/**
 * Mario Tokens System — Mike Tyson's Punchout Edition
 * Synced with /pewpi-infinity/MARIO-TOKENS (emulator)
 * and /pewpi-infinity/Mario-world-tokens (token printing + wallet)
 */

const MARIO_TOKENS_REPO = "pewpi-infinity/Mario-world-tokens";
const PUNCHOUT_REPO = "pewpi-infinity/Mike-Tyson-s-Punchout";
const WALLET_FILE = "wallet/wallet.json";

// ── Local wallet state ────────────────────────────────────────────────────────
const TokenWallet = (() => {
  const STORAGE_KEY = "punchout_wallet";

  function _load() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || _empty();
    } catch {
      return _empty();
    }
  }

  function _empty() {
    return {
      owner: null,
      balance: 0,
      transactions: [],
      lastUpdated: null,
    };
  }

  function _save(wallet) {
    wallet.lastUpdated = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(wallet));
    return wallet;
  }

  // ── Public API ──────────────────────────────────────────────────────────────

  function getWallet() {
    return _load();
  }

  function setOwner(username) {
    const w = _load();
    w.owner = username;
    return _save(w);
  }

  /**
   * Earn tokens (e.g. correct trivia answer, watching video, playing mini-game).
   * Prints a "coin" animation and records the transaction.
   */
  function earnTokens(amount, reason) {
    const w = _load();
    w.balance += amount;
    const tx = {
      id: _txId(),
      type: "EARN",
      amount,
      reason,
      timestamp: new Date().toISOString(),
      balanceAfter: w.balance,
    };
    w.transactions.unshift(tx);
    _save(w);
    _printCoinAnimation(amount);
    _renderWallet();
    return tx;
  }

  /**
   * Transfer tokens to another user. Returns a receipt object.
   */
  function transferTokens(toUser, amount, note) {
    const w = _load();
    if (amount <= 0 || amount > w.balance) {
      throw new Error("Insufficient token balance for transfer.");
    }
    w.balance -= amount;
    const receipt = {
      id: _txId(),
      type: "TRANSFER_OUT",
      from: w.owner || "anonymous",
      to: toUser,
      amount,
      note: note || "",
      timestamp: new Date().toISOString(),
      balanceAfter: w.balance,
      receiptNumber: "MT-" + Date.now(),
    };
    w.transactions.unshift(receipt);
    _save(w);
    _renderReceipt(receipt);
    _renderWallet();
    return receipt;
  }

  /**
   * Receive tokens from another user.
   */
  function receiveTokens(fromUser, amount, note) {
    const w = _load();
    w.balance += amount;
    const receipt = {
      id: _txId(),
      type: "TRANSFER_IN",
      from: fromUser,
      to: w.owner || "anonymous",
      amount,
      note: note || "",
      timestamp: new Date().toISOString(),
      balanceAfter: w.balance,
      receiptNumber: "MT-" + Date.now(),
    };
    w.transactions.unshift(receipt);
    _save(w);
    _renderWallet();
    return receipt;
  }

  function exportWallet() {
    const w = _load();
    const blob = new Blob([JSON.stringify(w, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "wallet.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    _showNotice("✅ Wallet exported.", "success");
  }

  // ── GitHub commit (wallet state → repo) ──────────────────────────────────
  /**
   * Commits the current wallet.json to the repo via GitHub API.
   * Requires a GitHub PAT stored in localStorage under "gh_token".
   */
  async function commitWalletToRepo() {
    const token = localStorage.getItem("gh_token");
    if (!token) {
      _showNotice("⚠️ Connect your GitHub account to sync wallet to repo.", "warning");
      return null;
    }

    const w = _load();
    const content = btoa(unescape(encodeURIComponent(JSON.stringify(w, null, 2))));
    const sha = await _getFileSha(token);

    const body = {
      message: `💰 Wallet update — Balance: ${w.balance} tokens [${new Date().toISOString()}]`,
      content,
      ...(sha ? { sha } : {}),
    };

    try {
      const res = await fetch(
        `https://api.github.com/repos/${PUNCHOUT_REPO}/contents/${WALLET_FILE}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );
      if (!res.ok) throw new Error(`GitHub API ${res.status}`);
      const data = await res.json();
      _showNotice("✅ Wallet synced to GitHub repo!", "success");
      return data;
    } catch (err) {
      _showNotice("❌ Failed to sync wallet: " + err.message, "error");
      return null;
    }
  }

  async function _getFileSha(token) {
    try {
      const res = await fetch(
        `https://api.github.com/repos/${PUNCHOUT_REPO}/contents/${WALLET_FILE}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) return null;
      const data = await res.json();
      return data.sha || null;
    } catch {
      return null;
    }
  }

  // ── UI helpers ────────────────────────────────────────────────────────────
  function _txId() {
    return Math.random().toString(36).substring(2, 11).toUpperCase();
  }

  function _printCoinAnimation(amount) {
    const container = document.getElementById("coin-animation-container");
    if (!container) return;
    for (let i = 0; i < Math.min(amount, 10); i++) {
      const coin = document.createElement("span");
      coin.className = "mario-coin";
      coin.textContent = "🪙";
      coin.style.left = Math.random() * 90 + "%";
      coin.style.animationDelay = i * 0.08 + "s";
      container.appendChild(coin);
      setTimeout(() => coin.remove(), 2000);
    }
  }

  function _renderWallet() {
    const el = document.getElementById("wallet-balance");
    if (el) {
      const w = _load();
      el.textContent = w.balance;
    }
    const owner = document.getElementById("wallet-owner");
    if (owner) {
      const w = _load();
      owner.textContent = w.owner || "Anonymous";
    }
    _renderTransactionHistory();
  }

  function _renderTransactionHistory() {
    const list = document.getElementById("tx-history");
    if (!list) return;
    const w = _load();
    list.innerHTML = "";
    w.transactions.slice(0, 20).forEach((tx) => {
      const li = document.createElement("li");
      li.className = "tx-item tx-" + tx.type.toLowerCase().replace("_", "-");
      const sign = tx.type === "EARN" || tx.type === "TRANSFER_IN" ? "+" : "-";
      const icon =
        tx.type === "EARN" ? "🪙" : tx.type === "TRANSFER_IN" ? "📥" : "📤";
      li.innerHTML = `
        <span class="tx-icon">${icon}</span>
        <span class="tx-desc">${tx.reason || tx.note || tx.type}</span>
        <span class="tx-amount ${sign === "+" ? "earn" : "spend"}">${sign}${tx.amount}</span>
        <span class="tx-time">${_formatDate(tx.timestamp)}</span>
      `;
      list.appendChild(li);
    });
  }

  function _renderReceipt(receipt) {
    const modal = document.getElementById("receipt-modal");
    const content = document.getElementById("receipt-content");
    if (!modal || !content) return;
    content.innerHTML = `
      <div class="receipt">
        <div class="receipt-header">🥊 MARIO TOKEN TRANSFER RECEIPT 🥊</div>
        <div class="receipt-row"><span>Receipt #:</span><strong>${receipt.receiptNumber}</strong></div>
        <div class="receipt-row"><span>From:</span><strong>${receipt.from}</strong></div>
        <div class="receipt-row"><span>To:</span><strong>${receipt.to}</strong></div>
        <div class="receipt-row"><span>Amount:</span><strong>${receipt.amount} 🪙 tokens</strong></div>
        <div class="receipt-row"><span>Note:</span><em>${receipt.note || "—"}</em></div>
        <div class="receipt-row"><span>Date:</span>${_formatDate(receipt.timestamp)}</div>
        <div class="receipt-row"><span>Balance After:</span><strong>${receipt.balanceAfter} tokens</strong></div>
        <div class="receipt-footer">Powered by Mario-World-Tokens × Mike Tyson's Punchout</div>
      </div>
    `;
    modal.classList.remove("hidden");
  }

  function _showNotice(msg, type) {
    const el = document.getElementById("wallet-notice");
    if (!el) return;
    el.textContent = msg;
    el.className = "wallet-notice " + type;
    el.style.display = "block";
    setTimeout(() => (el.style.display = "none"), 4000);
  }

  function _formatDate(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleString();
  }

  // ── Init ─────────────────────────────────────────────────────────────────
  function init() {
    _renderWallet();
  }

  return {
    getWallet,
    setOwner,
    earnTokens,
    transferTokens,
    receiveTokens,
    exportWallet,
    commitWalletToRepo,
    init,
    renderWallet: _renderWallet,
  };
})();
