# Auto-Redeem Rescue

A rescue app that continuously attempts to withdraw funds from ERC-4626 compliant vaults with limited liquidity.

🌐 **Live Version**: [https://onesavielabs.github.io/auto-redeem/](https://onesavielabs.github.io/auto-redeem/)

**Works with any ERC-4626 compliant vault** - simply configure the vault address and network settings in the web interface.

## Reference Project

This project is referenced and adapted from [antoncoding/auto-redeem](https://github.com/antoncoding/auto-redeem), converting the original Node.js script into a React-based web application with a more user-friendly interface.

## ⚠️ Security Notice

**We do not store any user data. All data exists only in the user's browser.**

**Always create a fresh, one-time wallet to run this tool. Never use your main wallet's private key.**

**How to use safely:**

1. Generate a new wallet at [vanity-eth.tk](https://vanity-eth.tk/) or using any wallet generator
2. Enter this new wallet's private key in the application (without the `0x` prefix)
3. Only send to this bot wallet:
   - The vault share tokens you want to redeem
   - A small amount of native tokens (ETH/AVAX) for gas fees
4. Set your main wallet as the receiver address (Receiver Address) - this is where redeemed assets will be sent

This way, even if something goes wrong, only the bot wallet is at risk, and your main funds remain safe.

## How It Works

This application runs directly in your browser and works as follows:

1. **Browser-side execution**: All operations are performed in your browser without requiring a server. Your private keys and configuration information never leave your browser.

2. **Continuous monitoring**: The application checks the vault's available liquidity every second using the ERC-4626 standard `maxRedeem` function to determine the maximum amount that can be redeemed.

3. **Automatic redemption**: When redeemable shares are detected, the application automatically executes a `redeem` transaction, sending assets to your specified receiver address.

4. **Real-time logs**: All operations are recorded in transaction logs, including check status, transaction hashes, and confirmation information, making it easy to track progress.

5. **Secure design**: Uses a one-time bot wallet, so even if something goes wrong, it won't affect your main funds.

## Getting Started

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Development Mode

Start the development server:

```bash
pnpm dev
```

### 3. Build

```bash
pnpm build
```

### 4. Deploy

Deploy to GitHub Pages:

```bash
pnpm deploy
```

### Using the Application

1. After opening the application, you'll see a configuration form
2. Fill in the following information:
   - **PRIVATE_KEY**: Your one-time bot wallet private key (without the `0x` prefix)
   - **RPC_URL**: RPC endpoint URL for the blockchain network (can be found at [Chainlist](https://chainlist.org/))
   - **Receiver Address**: Your main wallet address for receiving redeemed assets
   - **VAULT Address**: ERC-4626 vault contract address
3. Read and accept the disclaimer
4. Click "Save Configuration" to save the configuration
5. Click "Start Auto-Redeem" to begin automatic redemption
6. The application will display your bot wallet address. Transfer vault share tokens to this address
7. Monitor transaction logs to track progress

**Note**: The application automatically detects shares in your bot wallet and automatically executes redemption when liquidity is available.

## Support This Project

If you find this project useful, we welcome:

- ⭐ Give us a Star on GitHub
- 🐛 Report issues or suggest improvements
- 🔀 Submit Pull Requests
- 📢 Share with friends in need

Project URL: [https://github.com/OneSavieLabs/auto-redeem](https://github.com/OneSavieLabs/auto-redeem)

### 💰 Donation Support

If you would like to support this project through donations, we accept donations on the following chains:

- **Base**
- **Arbitrum**
- **BNB Chain**

**Donation Address**: `0x4c9fe5e7d77401cF8a2DF89937F77D9B3537D826`

Thank you for your support!

## MIT License