import { useState } from "react"
import { ConfigForm, type Config } from "@/components/ConfigForm"
import { useAutoRedeem } from "@/hooks/useAutoRedeem"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function AutoRedeemApp() {
  const [config, setConfig] = useState<Config | null>(null)
  const { isRunning, balance, maxRedeemable, botAddress, logs, error, start, stop } =
    useAutoRedeem(config)

  const handleConfigSubmit = (newConfig: Config) => {
    if (isRunning) {
      stop()
    }
    setConfig(newConfig)
  }

  const handleStart = () => {
    if (config) {
      start()
    }
  }

  const formatBigInt = (value: bigint | null) => {
    if (value === null) return "—"
    return value.toString()
  }

  const getLogIcon = (type: string) => {
    switch (type) {
      case "success":
        return "✅"
      case "error":
        return "❌"
      case "redeem":
        return "🎯"
      default:
        return "ℹ️"
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Auto-Redeem Rescue Script</h1>
        <p className="text-muted-foreground">
          持續嘗試從 ERC-4626 合規的 vault 中提取資金
        </p>
      </div>

      {!config ? (
        <ConfigForm onSubmit={handleConfigSubmit} />
      ) : (
        <div className="space-y-6">
          {/* 配置資訊卡片 */}
          <Card>
            <CardHeader>
              <CardTitle>當前配置</CardTitle>
              <CardDescription>您可以停止後重新配置</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Vault:</span>{" "}
                  <span className="font-mono text-xs">{config.vault}</span>
                </div>
                <div>
                  <span className="font-medium">Owner:</span>{" "}
                  <span className="font-mono text-xs">{config.owner}</span>
                </div>
                {botAddress && (
                  <div>
                    <span className="font-medium">Bot Address:</span>{" "}
                    <span className="font-mono text-xs">{botAddress}</span>
                  </div>
                )}
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={handleStart}
                  disabled={isRunning}
                  variant="default"
                >
                  開始自動贖回
                </Button>
                <Button
                  onClick={stop}
                  disabled={!isRunning}
                  variant="destructive"
                >
                  停止
                </Button>
                <Button
                  onClick={() => {
                    stop()
                    setConfig(null)
                  }}
                  variant="outline"
                >
                  重新配置
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 狀態卡片 */}
          {isRunning && (
            <Card>
              <CardHeader>
                <CardTitle>當前狀態</CardTitle>
                <CardDescription>實時監控資訊</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">餘額</div>
                    <div className="text-2xl font-bold">
                      {formatBigInt(balance)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">可贖回數量</div>
                    <div className="text-2xl font-bold">
                      {formatBigInt(maxRedeemable)}
                    </div>
                  </div>
                </div>
                {error && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                    <div className="text-sm font-medium text-destructive">
                      錯誤: {error}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* 日誌卡片 */}
          <Card>
            <CardHeader>
              <CardTitle>交易日誌</CardTitle>
              <CardDescription>最近的活動記錄</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {logs.length === 0 ? (
                  <div className="text-sm text-muted-foreground text-center py-4">
                    暫無日誌
                  </div>
                ) : (
                  logs.map((log, index) => (
                    <div
                      key={index}
                      className="flex gap-2 text-sm border-b border-border pb-2 last:border-0"
                    >
                      <span className="shrink-0">{getLogIcon(log.type)}</span>
                      <span className="text-muted-foreground font-mono text-xs shrink-0">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                      <span className="flex-1">{log.message}</span>
                      {log.hash && (
                        <a
                          href={`https://snowtrace.io/tx/${log.hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline shrink-0"
                        >
                          查看
                        </a>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

