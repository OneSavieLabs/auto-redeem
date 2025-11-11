import { useState, useEffect, useRef, useCallback } from "react"
import { createClients } from "@/lib/client"
import { abi } from "@/lib/abi"
import type { Config } from "@/components/ConfigForm"
import type { Address } from "viem"

const INTERVAL_MS = 1000 // Try every 1 second

export interface TransactionLog {
  timestamp: string
  type: "check" | "redeem" | "success" | "error"
  message: string
  hash?: string
  blockNumber?: bigint
}

export interface AutoRedeemState {
  isRunning: boolean
  balance: bigint | null
  maxRedeemable: bigint | null
  botAddress: string | null
  logs: TransactionLog[]
  error: string | null
}

export function useAutoRedeem(config: Config | null) {
  const [state, setState] = useState<AutoRedeemState>({
    isRunning: false,
    balance: null,
    maxRedeemable: null,
    botAddress: null,
    logs: [],
    error: null,
  })

  const intervalRef = useRef<number | null>(null)
  const clientsRef = useRef<ReturnType<typeof createClients> | null>(null)

  const addLog = useCallback((log: TransactionLog) => {
    setState((prev) => ({
      ...prev,
      logs: [...prev.logs.slice(-99), log], // Keep the last 100 logs
    }))
  }, [])

  const attemptRedeem = useCallback(async () => {
    if (!clientsRef.current || !config) return

    try {
      const { account, publicClient, walletClient } = clientsRef.current
      const botAddress = account.address

      addLog({
        timestamp: new Date().toISOString(),
        type: "check",
        message: `Checking vault, address: ${config.vault}`,
      })

      // Read balance and maxRedeem in parallel
      const [balance, maxRedeemable] = await Promise.all([
        publicClient.readContract({
          address: config.vault as Address,
          abi: abi,
          functionName: "balanceOf",
          args: [botAddress],
        }) as Promise<bigint>,
        publicClient.readContract({
          address: config.vault as Address,
          abi: abi,
          functionName: "maxRedeem",
          args: [botAddress],
        }) as Promise<bigint>,
      ])

      setState((prev) => ({
        ...prev,
        balance,
        maxRedeemable,
        botAddress,
        error: null,
      }))

      addLog({
        timestamp: new Date().toISOString(),
        type: "check",
        message: `Balance: ${balance.toString()}, Max redeemable: ${maxRedeemable.toString()}`,
      })

      // Take minimum of balance and maxRedeemable
      const sharesToRedeem = balance < maxRedeemable ? balance : maxRedeemable

      if (sharesToRedeem > 0n) {
        addLog({
          timestamp: new Date().toISOString(),
          type: "redeem",
          message: `Found ${sharesToRedeem.toString()} shares redeemable! Attempting to redeem to: ${config.owner}`,
        })

        // Call redeem function
        const hash = await walletClient.writeContract({
          address: config.vault as Address,
          abi: abi,
          functionName: "redeem",
          args: [sharesToRedeem, config.owner as Address, botAddress],
          chain: walletClient.chain,
          account: account,
        })

        addLog({
          timestamp: new Date().toISOString(),
          type: "redeem",
          message: `Transaction sent! Hash: ${hash}`,
          hash,
        })

        // Wait for transaction receipt
        const receipt = await publicClient.waitForTransactionReceipt({ hash })

        if (receipt.status === "success") {
          addLog({
            timestamp: new Date().toISOString(),
            type: "success",
            message: `Transaction confirmed successfully! Block: ${receipt.blockNumber.toString()}`,
            hash,
            blockNumber: receipt.blockNumber,
          })
        } else {
          addLog({
            timestamp: new Date().toISOString(),
            type: "error",
            message: `Transaction failed!`,
            hash,
          })
        }
      } else {
        addLog({
          timestamp: new Date().toISOString(),
          type: "check",
          message: "No redeemable shares available",
        })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      setState((prev) => ({
        ...prev,
        error: errorMessage,
      }))
      addLog({
        timestamp: new Date().toISOString(),
        type: "error",
        message: `Error: ${errorMessage}`,
      })
    }
  }, [config, addLog])

  const start = useCallback(() => {
    if (!config) {
      setState((prev) => ({
        ...prev,
        error: "Please configure first",
      }))
      return
    }

    try {
      // Create clients
      clientsRef.current = createClients({
        privateKey: config.privateKey,
        rpcUrl: config.rpcUrl,
      })

      const botAddress = clientsRef.current.account.address

      setState((prev) => ({
        ...prev,
        isRunning: true,
        botAddress,
        error: null,
        logs: [
          {
            timestamp: new Date().toISOString(),
            type: "check",
            message: `🚀 Auto-redeem script started`,
          },
          {
            timestamp: new Date().toISOString(),
            type: "check",
            message: `Vault: ${config.vault}`,
          },
          {
            timestamp: new Date().toISOString(),
            type: "check",
            message: `Recipient address: ${config.owner}`,
          },
          {
            timestamp: new Date().toISOString(),
            type: "check",
            message: `Operator address: ${botAddress}`,
          },
          {
            timestamp: new Date().toISOString(),
            type: "check",
            message: `Check interval: ${INTERVAL_MS}ms`,
          },
        ],
      }))

      // Run immediately
      attemptRedeem()

      // Then run at intervals
      intervalRef.current = window.setInterval(attemptRedeem, INTERVAL_MS)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      setState((prev) => ({
        ...prev,
        error: errorMessage,
        isRunning: false,
      }))
    }
  }, [config, attemptRedeem])

  const stop = useCallback(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setState((prev) => ({
      ...prev,
      isRunning: false,
    }))
    addLog({
      timestamp: new Date().toISOString(),
      type: "check",
      message: "Auto-redeem stopped",
    })
  }, [addLog])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current)
      }
    }
  }, [])

  return {
    ...state,
    start,
    stop,
  }
}

