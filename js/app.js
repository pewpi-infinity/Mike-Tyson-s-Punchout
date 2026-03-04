/**
 * Main App — Mike Tyson's Punchout Interactive Gaming Page
 * Handles: hamburger nav, video player, GitHub auth, punch mini-game
 */

// ── Hamburger Menu ────────────────────────────────────────────────────────────
(function initHamburger() {
  const toggle = document.getElementById("hamburger-toggle");
  const menu = document.getElementById("nav-menu");
  if (!toggle || !menu) return;

  toggle.addEventListener("click", () => {
    const open = menu.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open);
    toggle.innerHTML = open ? "✕" : "☰";
  });

  // Close when clicking outside
  document.addEventListener("click", (e) => {
    if (!menu.contains(e.target) && e.target !== toggle) {
      menu.classList.remove("open");
      toggle.innerHTML = "☰";
    }
  });
})();

// ── Section navigation (tab-like) ────────────────────────────────────────────
function showSection(id) {
  document.querySelectorAll(".section-panel").forEach((s) => s.classList.remove("active"));
  const target = document.getElementById(id);
  if (target) {
    target.classList.add("active");
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  // Close hamburger after nav
  const menu = document.getElementById("nav-menu");
  if (menu) menu.classList.remove("open");
  const toggle = document.getElementById("hamburger-toggle");
  if (toggle) toggle.innerHTML = "☰";
}

// ── GitHub Auth (PAT stored in localStorage) ────────────────────────────────
function connectGitHub() {
  const pat = document.getElementById("gh-pat-input")?.value?.trim();
  if (!pat) return alert("Please paste your GitHub token first.");

  localStorage.setItem("gh_token", pat);
  document.getElementById("gh-pat-input").value = "";

  // Try to fetch user info
  fetch("https://api.github.com/user", {
    headers: { Authorization: "Bearer " + pat },
  })
    .then((r) => {
      if (!r.ok) throw new Error("Invalid token");
      return r.json();
    })
    .then((user) => {
      TokenWallet.setOwner(user.login);
      document.getElementById("gh-status").innerHTML =
        `✅ Connected as <strong>${user.login}</strong>`;
      TokenWallet.renderWallet();
    })
    .catch(() => {
      document.getElementById("gh-status").innerHTML =
        "❌ Could not authenticate. Check your token.";
    });
}

function syncWallet() {
  TokenWallet.commitWalletToRepo();
}

// ── Transfer Form ────────────────────────────────────────────────────────────
function openTransferModal() {
  const modal = document.getElementById("transfer-modal");
  if (modal) modal.classList.remove("hidden");
}

function closeTransferModal() {
  const modal = document.getElementById("transfer-modal");
  if (modal) modal.classList.add("hidden");
}

function closeReceiptModal() {
  const modal = document.getElementById("receipt-modal");
  if (modal) modal.classList.add("hidden");
}

function submitTransfer() {
  const to = document.getElementById("transfer-to")?.value?.trim();
  const amt = parseInt(document.getElementById("transfer-amount")?.value, 10);
  const note = document.getElementById("transfer-note")?.value?.trim();

  if (!to) return alert("Enter recipient username.");
  if (!amt || amt <= 0) return alert("Enter a valid amount.");

  try {
    TokenWallet.transferTokens(to, amt, note);
    closeTransferModal();
    // Auto-sync after transfer
    setTimeout(() => TokenWallet.commitWalletToRepo(), 500);
  } catch (err) {
    alert("Transfer failed: " + err.message);
  }
}

// ── Punch Mini-Game ───────────────────────────────────────────────────────────
(function initPunchGame() {
  let gameActive = false;
  let combo = 0;
  let hp = 100;
  let gameTimer = null;
  let lastTargetTime = null;
  let tokensEarned = 0;

  const GAME_DURATION = 30; // seconds
  let timeLeft = GAME_DURATION;

  function startGame() {
    if (gameActive) return;
    gameActive = true;
    combo = 0;
    hp = 100;
    tokensEarned = 0;
    timeLeft = GAME_DURATION;

    document.getElementById("punch-hp").style.width = "100%";
    document.getElementById("punch-combo").textContent = "0";
    document.getElementById("punch-tokens-earned").textContent = "0";
    document.getElementById("punch-result").textContent = "";
    document.getElementById("btn-punch-start").disabled = true;
    document.getElementById("punch-target").style.display = "flex";

    _moveTarget();

    gameTimer = setInterval(() => {
      timeLeft--;
      document.getElementById("punch-timer").textContent = timeLeft + "s";
      if (timeLeft <= 0) endGame();
    }, 1000);
  }

  function _moveTarget() {
    if (!gameActive) return;
    const target = document.getElementById("punch-target");
    if (!target) return;
    const ring = document.getElementById("punch-ring");
    if (!ring) return;

    const maxX = ring.offsetWidth - target.offsetWidth - 10;
    const maxY = ring.offsetHeight - target.offsetHeight - 10;
    target.style.left = Math.random() * maxX + "px";
    target.style.top = Math.random() * maxY + "px";
    lastTargetTime = Date.now();

    // Auto-miss after 1.5s
    setTimeout(() => {
      if (gameActive && lastTargetTime && Date.now() - lastTargetTime >= 1480) {
        _miss();
      }
    }, 1500);
  }

  function _hit() {
    if (!gameActive) return;
    lastTargetTime = null;
    combo++;
    const dmg = combo >= 3 ? 15 : 10;
    hp = Math.max(0, hp - dmg);

    document.getElementById("punch-hp").style.width = hp + "%";
    document.getElementById("punch-combo").textContent = combo;

    const coinsNow = combo >= 3 ? 3 : 1;
    tokensEarned += coinsNow;
    document.getElementById("punch-tokens-earned").textContent = tokensEarned;

    // Shake Tyson
    const portrait = document.getElementById("tyson-portrait");
    if (portrait) {
      portrait.classList.add("hit-shake");
      setTimeout(() => portrait.classList.remove("hit-shake"), 300);
    }

    if (hp <= 0) {
      endGame(true);
      return;
    }
    _moveTarget();
  }

  function _miss() {
    if (!gameActive) return;
    combo = 0;
    document.getElementById("punch-combo").textContent = "0";
    _moveTarget();
  }

  function endGame(ko = false) {
    gameActive = false;
    clearInterval(gameTimer);
    lastTargetTime = null;

    const target = document.getElementById("punch-target");
    if (target) target.style.display = "none";
    document.getElementById("btn-punch-start").disabled = false;

    const resultEl = document.getElementById("punch-result");
    if (ko) {
      resultEl.innerHTML = "🥊 KO! You win! <strong>+10 BONUS tokens!</strong>";
      tokensEarned += 10;
    } else {
      resultEl.textContent = `Time's up! You earned ${tokensEarned} tokens.`;
    }

    if (tokensEarned > 0) {
      TokenWallet.earnTokens(tokensEarned, "Punch Mini-Game");
    }
  }

  window.punchGame = { startGame, hit: _hit };

  // Attach after DOM ready
  document.addEventListener("DOMContentLoaded", () => {
    const startBtn = document.getElementById("btn-punch-start");
    if (startBtn) startBtn.addEventListener("click", startGame);

    const target = document.getElementById("punch-target");
    if (target) target.addEventListener("click", _hit);
  });
})();

// ── YouTube-style video gallery ───────────────────────────────────────────────
const VIDEOS = [
  {
    id: "pQ5fRNaCMiU",
    title: "Mike Tyson vs. Trevor Berbick — WBC Title Win (1986)",
    desc: "Tyson becomes youngest heavyweight champion at 20.",
  },
  {
    id: "JuZa_u6gI0c",
    title: "Mike Tyson Highlights — Greatest KOs",
    desc: "Top knockouts from Iron Mike's legendary career.",
  },
  {
    id: "s7Ic7jRExWI",
    title: "Mike Tyson vs. Michael Spinks (1988)",
    desc: "91-second demolition of Michael Spinks.",
  },
  {
    id: "YzBnX0NkVrs",
    title: "Punch-Out!! NES — Full Playthrough",
    desc: "Classic NES Punch-Out!! all opponents gameplay.",
  },
  {
    id: "5b8XSdLqIMI",
    title: "Mike Tyson — Undisputed Truth",
    desc: "Excerpt from Mike Tyson's one-man Broadway show.",
  },
];

function loadVideo(index) {
  const v = VIDEOS[index];
  if (!v) return;
  const frame = document.getElementById("main-video-frame");
  if (frame) {
    frame.src = `https://www.youtube-nocookie.com/embed/${v.id}?rel=0&modestbranding=1`;
    frame.title = v.title;
  }
  document.getElementById("video-title").textContent = v.title;
  document.getElementById("video-desc").textContent = v.desc;

  // Highlight active thumb
  document.querySelectorAll(".video-thumb").forEach((t, i) => {
    t.classList.toggle("active", i === index);
  });

  // Earn 2 tokens for watching
  TokenWallet.earnTokens(2, "Watched: " + v.title.substring(0, 40));
}

function initVideoGallery() {
  const thumbs = document.getElementById("video-thumbs");
  if (!thumbs) return;
  VIDEOS.forEach((v, i) => {
    const div = document.createElement("div");
    div.className = "video-thumb";
    div.innerHTML = `
      <img src="https://img.youtube.com/vi/${v.id}/mqdefault.jpg" alt="${v.title}" loading="lazy">
      <span>${v.title}</span>
    `;
    div.addEventListener("click", () => loadVideo(i));
    thumbs.appendChild(div);
  });
  // Auto-load first
  loadVideo(0);
}

// ── NES Cartridge Lore carousel ───────────────────────────────────────────────
const LORE_ITEMS = [
  {
    icon: "🎮",
    title: "NES Release — 1987",
    text: "Mike Tyson's Punch-Out!! was released in North America on October 18, 1987, published by Nintendo. It featured real Mike Tyson as the final boss and became one of the best-selling NES games.",
  },
  {
    icon: "👾",
    title: "Little Mac",
    text: "You play as 17-year-old Little Mac from the Bronx. At just 107 lbs, he fights his way through the World Video Boxing Association (WVBA) circuit to face Iron Mike himself.",
  },
  {
    icon: "🕹️",
    title: "The Secret Code",
    text: "Enter 007-373-5963 at the title screen to fight Mike Tyson directly. This cheat code was widely circulated in schoolyards and gaming magazines across America.",
  },
  {
    icon: "🥊",
    title: "Doc Louis",
    text: "Little Mac's trainer Doc Louis offers motivational advice between rounds. His most famous line: 'Get up, Mac! Get up!'",
  },
  {
    icon: "🏆",
    title: "Title Change — 1990",
    text: "After Tyson lost his real-world boxing license in 1990, Nintendo re-released the game as just 'Punch-Out!!' replacing Tyson with fictional champion Mr. Dream.",
  },
  {
    icon: "📺",
    title: "NES Cartoon Era",
    text: "The Super Mario Bros. Super Show aired from 1989–1990, crossing over Nintendo's gaming universe into animation. It inspired the NES gaming cultural moment that Punch-Out!! was part of.",
  },
];

let loreIndex = 0;

function renderLore() {
  const item = LORE_ITEMS[loreIndex];
  const el = document.getElementById("lore-card");
  if (!el) return;
  el.innerHTML = `
    <div class="lore-icon">${item.icon}</div>
    <h3 class="lore-title">${item.title}</h3>
    <p class="lore-text">${item.text}</p>
    <div class="lore-nav">
      <button class="nes-btn is-default" onclick="prevLore()">◀ Prev</button>
      <span>${loreIndex + 1} / ${LORE_ITEMS.length}</span>
      <button class="nes-btn is-primary" onclick="nextLore()">Next ▶</button>
    </div>
  `;
}

function nextLore() {
  loreIndex = (loreIndex + 1) % LORE_ITEMS.length;
  renderLore();
}

function prevLore() {
  loreIndex = (loreIndex - 1 + LORE_ITEMS.length) % LORE_ITEMS.length;
  renderLore();
}

// ── DOMContentLoaded bootstrap ────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  TokenWallet.init();
  TriviaGame.init();
  initVideoGallery();
  renderLore();

  // Default section
  showSection("section-home");

  // Trivia next button
  const nextBtn = document.getElementById("trivia-next");
  if (nextBtn) nextBtn.addEventListener("click", () => TriviaGame.nextQuestion());
});
