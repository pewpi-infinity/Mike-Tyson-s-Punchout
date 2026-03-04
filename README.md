# 🥊 Mike Tyson's Punch-Out!! — Interactive Gaming + Mario Token Wallet

An interactive fan page for **Mike Tyson's Punch-Out!!** (NES, 1987) featuring:

- 🧠 **Mike Tyson Trivia & History** — Answer questions about Iron Mike, the NES game, famous fights, and pop culture to earn Mario Tokens
- 🥊 **Punch Mini-Game** — Hit moving targets in the boxing ring to rack up combos and earn tokens; KO Tyson for a bonus!
- 📺 **Video Player** — Real Mike Tyson boxing matches, NES Punch-Out!! full gameplay, and highlight reels (earn tokens just for watching)
- 📖 **NES Lore Carousel** — Mike Tyson & Punch-Out!! history, cartridge facts, and Nintendo era nostalgia
- 🪙 **Mario Token Wallet** — Earn, hold, and transfer tokens synced with the [Mario-World-Tokens](https://github.com/pewpi-infinity/Mario-world-tokens) repo and [MARIO-TOKENS emulator](https://github.com/pewpi-infinity/MARIO-TOKENS)
- 🔗 **Hamburger Navigation** — Links to all connected gaming repos and sites
- 💾 **Wallet → GitHub Commit** — Connect your GitHub PAT and every sync/transfer commits `wallet/wallet.json` to this repo with a full transaction history
- 🧾 **Transfer Receipts** — Every token transfer generates a printable receipt

## Live Site

> Deploy via GitHub Pages: `Settings → Pages → Branch: main, / (root)`
> URL: `https://pewpi-infinity.github.io/Mike-Tyson-s-Punchout/`

## How to Earn Tokens

| Action | Tokens Earned |
|--------|--------------|
| Correct trivia answer | 5–15 🪙 |
| Punch mini-game hit | 1–3 🪙 |
| KO Tyson in mini-game | +10 🪙 bonus |
| Watch a video | 2 🪙 |

## Wallet Sync

1. Generate a GitHub PAT at [github.com/settings/tokens](https://github.com/settings/tokens/new?scopes=repo&description=PunchoutWallet) with `repo` scope
2. Paste it in the **Connect GitHub Account** box on the Wallet page
3. Click **Sync to GitHub** — this commits `wallet/wallet.json` to the repo
4. Every transfer creates a receipt and auto-syncs

## Connected Repos

- [MARIO-TOKENS Emulator](https://github.com/pewpi-infinity/MARIO-TOKENS)
- [Mario-World-Tokens](https://github.com/pewpi-infinity/Mario-world-tokens)
- [Mike-Tyson-s-Punchout](https://github.com/pewpi-infinity/Mike-Tyson-s-Punchout) ← you are here

## Tech Stack

Plain HTML5 · CSS3 (pixel retro theme) · Vanilla JavaScript · GitHub REST API (wallet sync) · YouTube embed (videos) · Google Fonts (Press Start 2P)

