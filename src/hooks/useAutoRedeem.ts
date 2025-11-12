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
  isProcessing: boolean
  balance: bigint | null
  maxRedeemable: bigint | null
  botAddress: string | null
  logs: TransactionLog[]
  error: string | null
}

export function useAutoRedeem(config: Config | null) {
  const [state, setState] = useState<AutoRedeemState>({
    isRunning: false,
    isProcessing: false,
    balance: null,
    maxRedeemable: null,
    botAddress: null,
    logs: [],
    error: null,
  })

  const intervalRef = useRef<number | null>(null)
  const clientsRef = useRef<ReturnType<typeof createClients> | null>(null)
  const isProcessingRef = useRef<boolean>(false)

  const addLog = useCallback((log: TransactionLog) => {
    setState((prev) => ({
      ...prev,
      logs: [...prev.logs.slice(-99), log], // Keep the last 100 logs
    }))
  }, [])

  const attemptRedeem = useCallback(async () => {
    if (!clientsRef.current || !config) return

    // 檢查是否正在處理交易，避免重複觸發
    if (isProcessingRef.current) {
      return
    }

    // 設置處理狀態並暫停計時器
    isProcessingRef.current = true
    setState((prev) => ({
      ...prev,
      isProcessing: true,
    }))

    // 暫停計時器
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current)
      intervalRef.current = null
    }

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
          message: `Found ${sharesToRedeem.toString()} shares redeemable! Attempting to redeem to: ${config.receiver}`,
        })

        // Call redeem function
        const hash = await walletClient.writeContract({
          address: config.vault as Address,
          abi: abi,
          functionName: "redeem",
          args: [sharesToRedeem, config.receiver as Address, botAddress],
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
          
          // 交易成功後停止輪詢
          isProcessingRef.current = false
          setState((prev) => ({
            ...prev,
            isRunning: false,
            isProcessing: false,
          }))
        } else {
          addLog({
            timestamp: new Date().toISOString(),
            type: "error",
            message: `Transaction failed!`,
            hash,
          })
          
          // 交易失敗後重新啟動輪詢
          isProcessingRef.current = false
          setState((prev) => ({
            ...prev,
            isProcessing: false,
          }))
          
          // 重新啟動計時器
          intervalRef.current = window.setInterval(attemptRedeem, INTERVAL_MS)
        }
      } else {
        addLog({
          timestamp: new Date().toISOString(),
          type: "check",
          message: "No redeemable shares available",
        })
        
        // 沒有可兌回的 shares，重置處理狀態並重新啟動輪詢
        isProcessingRef.current = false
        setState((prev) => ({
          ...prev,
          isProcessing: false,
        }))
        
        // 重新啟動計時器
        intervalRef.current = window.setInterval(attemptRedeem, INTERVAL_MS)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      isProcessingRef.current = false
      setState((prev) => ({
        ...prev,
        error: errorMessage,
        isProcessing: false,
      }))
      addLog({
        timestamp: new Date().toISOString(),
        type: "error",
        message: `Error: ${errorMessage}`,
      })
      
      // 發生錯誤時重新啟動輪詢
      intervalRef.current = window.setInterval(attemptRedeem, INTERVAL_MS)
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

      // 重置處理狀態
      isProcessingRef.current = false

      setState((prev) => ({
        ...prev,
        isRunning: true,
        isProcessing: false,
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
            message: `Recipient address: ${config.receiver}`,
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

      // Run immediately, then it will set up interval if needed
      attemptRedeem()
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
    isProcessingRef.current = false
    setState((prev) => ({
      ...prev,
      isRunning: false,
      isProcessing: false,
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

