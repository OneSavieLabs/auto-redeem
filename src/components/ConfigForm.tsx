import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"

export interface Config {
  privateKey: string
  rpcUrl: string
  receiver: string
  vault: string
}

interface ConfigFormProps {
  onSubmit: (config: Config) => void
  initialConfig?: Partial<Config>
}

export function ConfigForm({ onSubmit, initialConfig }: ConfigFormProps) {
  const [privateKey, setPrivateKey] = useState(initialConfig?.privateKey || "")
  const [rpcUrl, setRpcUrl] = useState(initialConfig?.rpcUrl || "")
  const [receiver, setReceiver] = useState(initialConfig?.receiver || "")
  const [vault, setVault] = useState(initialConfig?.vault || "")
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Basic validation
    if (!privateKey.trim()) {
      alert("Please enter PRIVATE_KEY")
      return
    }
    if (!rpcUrl.trim()) {
      alert("Please enter RPC_URL")
      return
    }
    if (!receiver.trim()) {
      alert("Please enter Receiver address")
      return
    }
    if (!vault.trim()) {
      alert("Please enter VAULT address")
      return
    }

    // Validate address format (simple check)
    const addressRegex = /^0x[a-fA-F0-9]{40}$/
    if (!addressRegex.test(receiver.trim())) {
      alert("Receiver address format is incorrect")
      return
    }
    if (!disclaimerAccepted) {
      alert("Please accept the disclaimer before proceeding")
      return
    }
    if (!addressRegex.test(vault.trim())) {
      alert("VAULT address format is incorrect")
      return
    }

    onSubmit({
      privateKey: privateKey.trim(),
      rpcUrl: rpcUrl.trim(),
      receiver: receiver.trim(),
      vault: vault.trim(),
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuration</CardTitle>
        <CardDescription>
          Please enter your configuration to start the auto-redeem feature
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="pb-4 border-b">
            <div className="space-y-3 text-sm text-muted-foreground">
                <div className="p-4 bg-muted rounded-lg space-y-2">
                  <p className="font-semibold text-foreground">⚠️ Important Security Notice</p>
                  <p>Always create a fresh, one-time-use wallet to run this bot. Never use your main wallet's private key.</p>
                </div>
                <div className="space-y-2">
                  <p className="font-semibold text-foreground">Usage Steps:</p>
                  <ol className="list-decimal list-inside space-y-1 ml-2">
                    <li>Create a new wallet at <a href="https://vanity-eth.tk/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">vanity-eth.tk</a> or using any wallet generator</li>
                    <li>Enter the new wallet's private key in the PRIVATE_KEY field below (without 0x prefix)</li>
                    <li>Only send to this bot wallet:
                      <ul className="list-disc list-inside ml-4 mt-1">
                        <li>The vault share tokens you want to redeem</li>
                        <li>A small amount of native tokens (ETH/AVAX) for gas fees</li>
                      </ul>
                    </li>
                    <li>Set your main wallet address as the receiver address - this is where redeemed assets will be sent</li>
                  </ol>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-foreground">This way, even if something goes wrong, only the bot wallet is at risk, and your main funds remain safe.</p>
                </div>
              </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="privateKey">PRIVATE_KEY</Label>
            <Input
              id="privateKey"
              type="text"
              placeholder="Enter private key (without 0x prefix)"
              value={privateKey}
              onChange={(e) => setPrivateKey(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Notice: Private key is only used in the browser and will not be saved or sent to any server
            </p>
            <p className="text-xs text-muted-foreground">
              <strong>Description:</strong> Private key of a one-time bot wallet (without 0x prefix). Please use a new wallet created specifically for this bot, do not use your main wallet's private key.
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
              <strong>Description:</strong> RPC endpoint URL for the blockchain network you're using. You can find RPC endpoint URLs at <a href="https://chainlist.org/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Chainlist</a> or any other source.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="receiver">Receiver Address</Label>
            <Input
              id="receiver"
              type="text"
              placeholder="0x..."
              value={receiver}
              onChange={(e) => setReceiver(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Main wallet address to receive redeemed assets
            </p>
            <p className="text-xs text-muted-foreground">
              <strong>Description:</strong> Your main wallet address where redeemed assets will be sent. This should be your primary wallet, not the bot wallet.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="vault">VAULT Address</Label>
            <Input
              id="vault"
              type="text"
              placeholder="0x..."
              value={vault}
              onChange={(e) => setVault(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
            <strong>Description:</strong> The ERC-4626 vault contract address you want to monitor and redeem from
            </p>
          </div>

          <div className="flex items-start space-x-2 pb-2">
            <Checkbox
              id="disclaimer"
              checked={disclaimerAccepted}
              onCheckedChange={(checked) => setDisclaimerAccepted(checked === true)}
            />
            <Label
              htmlFor="disclaimer"
              className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              I understand and have read the instructions for using this tool. I acknowledge that the developers are not responsible for any asset losses, and I assume all risks associated with using this tool.
            </Label>
          </div>

          <Button type="submit" className="w-full">
            Save Configuration
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

