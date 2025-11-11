import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export interface Config {
  privateKey: string
  rpcUrl: string
  owner: string
  vault: string
}

interface ConfigFormProps {
  onSubmit: (config: Config) => void
  initialConfig?: Partial<Config>
}

export function ConfigForm({ onSubmit, initialConfig }: ConfigFormProps) {
  const [privateKey, setPrivateKey] = useState(initialConfig?.privateKey || "")
  const [rpcUrl, setRpcUrl] = useState(initialConfig?.rpcUrl || "")
  const [owner, setOwner] = useState(initialConfig?.owner || "")
  const [vault, setVault] = useState(initialConfig?.vault || "")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // 基本驗證
    if (!privateKey.trim()) {
      alert("請輸入 PRIVATE_KEY")
      return
    }
    if (!rpcUrl.trim()) {
      alert("請輸入 RPC_URL")
      return
    }
    if (!owner.trim()) {
      alert("請輸入 OWNER 地址")
      return
    }
    if (!vault.trim()) {
      alert("請輸入 VAULT 地址")
      return
    }

    // 驗證地址格式（簡單檢查）
    const addressRegex = /^0x[a-fA-F0-9]{40}$/
    if (!addressRegex.test(owner.trim())) {
      alert("OWNER 地址格式不正確")
      return
    }
    if (!addressRegex.test(vault.trim())) {
      alert("VAULT 地址格式不正確")
      return
    }

    onSubmit({
      privateKey: privateKey.trim(),
      rpcUrl: rpcUrl.trim(),
      owner: owner.trim(),
      vault: vault.trim(),
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>配置資訊</CardTitle>
        <CardDescription>
          請輸入您的配置資訊以開始自動贖回功能
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="pb-4 border-b">
            <div className="space-y-3 text-sm text-muted-foreground">
                <div className="p-4 bg-muted rounded-lg space-y-2">
                  <p className="font-semibold text-foreground">⚠️ 重要安全提示</p>
                  <p>請務必創建一個全新的、一次性使用的錢包來運行此機器人。絕對不要使用您主錢包的私鑰。</p>
                </div>
                <div className="space-y-2">
                  <p className="font-semibold text-foreground">使用步驟：</p>
                  <ol className="list-decimal list-inside space-y-1 ml-2">
                    <li>在 <a href="https://vanity-eth.tk/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">vanity-eth.tk</a> 或使用任何錢包生成器創建一個新錢包</li>
                    <li>將新錢包的私鑰填入下方的 PRIVATE_KEY 欄位（不含 0x 前綴）</li>
                    <li>僅向此機器人錢包發送：
                      <ul className="list-disc list-inside ml-4 mt-1">
                        <li>您要贖回的 vault share token</li>
                        <li>少量原生代幣（ETH/AVAX）用於支付 gas 費用</li>
                      </ul>
                    </li>
                    <li>將您的主錢包地址設為 OWNER 地址 - 這是贖回資產的接收地址</li>
                  </ol>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-foreground">這樣即使出現問題，也只有機器人錢包處於風險中，您的主資金是安全的。</p>
                </div>
              </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="privateKey">PRIVATE_KEY</Label>
            <Input
              id="privateKey"
              type="text"
              placeholder="輸入私鑰（不含 0x 前綴）"
              value={privateKey}
              onChange={(e) => setPrivateKey(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              聲明：私鑰僅在瀏覽器中使用，不會被保存或發送到任何伺服器
            </p>
            <p className="text-xs text-muted-foreground">
              <strong>說明：</strong>一次性機器人錢包的私鑰（不含 0x 前綴）。請務必使用專門為此機器人創建的新錢包，不要使用主錢包的私鑰。
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rpcUrl">RPC_URL</Label>
            <Input
              id="rpcUrl"
              type="url"
              placeholder="https://avax-mainnet.g.alchemy.com/v2/your_api_key"
              value={rpcUrl}
              onChange={(e) => setRpcUrl(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              <strong>說明：</strong>您使用的區塊鏈網路的 RPC 端點 URL。你可以到 <a href="https://chainlist.org/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Chainlist</a> 或任何其他地方找到 RPC 端點 URL。
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="owner">OWNER 地址</Label>
            <Input
              id="owner"
              type="text"
              placeholder="0x..."
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              接收贖回資產的主錢包地址
            </p>
            <p className="text-xs text-muted-foreground">
              <strong>說明：</strong>您的主錢包地址，贖回的資產將發送到此地址。這應該是您的主要錢包，而不是機器人錢包。
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="vault">VAULT 地址</Label>
            <Input
              id="vault"
              type="text"
              placeholder="0x..."
              value={vault}
              onChange={(e) => setVault(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
            <strong>說明：</strong>你要監控及贖回的 ERC-4626 vault 合約地址
            </p>
          </div>

          <Button type="submit" className="w-full">
            開始自動贖回
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

