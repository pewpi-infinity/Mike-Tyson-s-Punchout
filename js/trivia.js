/**
 * Mike Tyson Trivia & History Game
 * Correct answers earn Mario Tokens!
 */

const TriviaGame = (() => {
  // ── Question bank ──────────────────────────────────────────────────────────
  const QUESTIONS = [
    // History
    {
      category: "History",
      q: "In what year was Mike Tyson born?",
      options: ["1964", "1966", "1968", "1970"],
      answer: 1,
      tokens: 5,
    },
    {
      category: "History",
      q: "What is Mike Tyson's hometown?",
      options: ["Harlem, NY", "Brooklyn, NY", "Bronx, NY", "Queens, NY"],
      answer: 1,
      tokens: 5,
    },
    {
      category: "History",
      q: "At what age did Mike Tyson become the youngest heavyweight champion?",
      options: ["18", "20", "22", "24"],
      answer: 1,
      tokens: 10,
    },
    {
      category: "History",
      q: "Who was Mike Tyson's legendary trainer?",
      options: ["Angelo Dundee", "Cus D'Amato", "Emmanuel Steward", "Freddie Roach"],
      answer: 1,
      tokens: 10,
    },
    {
      category: "History",
      q: "Which title did Tyson win first in his professional career?",
      options: ["WBA", "WBC", "IBF", "WBO"],
      answer: 2,
      tokens: 10,
    },
    // Punchout NES
    {
      category: "NES Game",
      q: "What is Little Mac's weight class in Mike Tyson's Punch-Out!!?",
      options: ["Flyweight", "Featherweight", "Lightweight", "Welterweight"],
      answer: 0,
      tokens: 5,
    },
    {
      category: "NES Game",
      q: "Who is the first opponent in Mike Tyson's Punch-Out!!?",
      options: ["Glass Joe", "Bald Bull", "Piston Honda", "King Hippo"],
      answer: 0,
      tokens: 5,
    },
    {
      category: "NES Game",
      q: "What code in Punch-Out!! lets you fight Mike Tyson directly?",
      options: [
        "007-373-5963",
        "999-000-1111",
        "142-617-3748",
        "800-555-1234",
      ],
      answer: 0,
      tokens: 15,
    },
    {
      category: "NES Game",
      q: "What color trunks does Mike Tyson wear in the NES game?",
      options: ["Black", "Blue", "White", "Red"],
      answer: 1,
      tokens: 5,
    },
    {
      category: "NES Game",
      q: "Who is Little Mac's trainer in Mike Tyson's Punch-Out!!?",
      options: ["Doc Louis", "Angelo", "Cus", "King"],
      answer: 0,
      tokens: 5,
    },
    // Records
    {
      category: "Records",
      q: "How many consecutive KO wins did Tyson achieve at the start of his career?",
      options: ["19", "26", "37", "44"],
      answer: 1,
      tokens: 15,
    },
    {
      category: "Records",
      q: "Mike Tyson's professional record is 50 wins, 6 losses, and how many no-contests?",
      options: ["0", "1", "2", "3"],
      answer: 2,
      tokens: 10,
    },
    {
      category: "Records",
      q: "What is the fastest KO in Tyson's career (in seconds)?",
      options: ["30 seconds", "38 seconds", "52 seconds", "60 seconds"],
      answer: 0,
      tokens: 15,
    },
    {
      category: "Records",
      q: "Tyson's peak reach measurement?",
      options: ['71"', '71.5"', '72"', '74"'],
      answer: 1,
      tokens: 10,
    },
    // Fights
    {
      category: "Famous Fights",
      q: "Who defeated Mike Tyson in the upset of the century in 1990?",
      options: ["Evander Holyfield", "Lennox Lewis", "Buster Douglas", "Riddick Bowe"],
      answer: 2,
      tokens: 10,
    },
    {
      category: "Famous Fights",
      q: "In which city did the infamous 'Bite Fight' with Holyfield take place?",
      options: ["New York", "Chicago", "Las Vegas", "Atlantic City"],
      answer: 2,
      tokens: 10,
    },
    {
      category: "Famous Fights",
      q: "Who did Tyson knock out in 91 seconds to claim the WBC title?",
      options: ["Trevor Berbick", "Michael Spinks", "Tony Tucker", "Larry Holmes"],
      answer: 0,
      tokens: 10,
    },
    // Culture
    {
      category: "Culture",
      q: "What famous face tattoo design did Mike Tyson get?",
      options: ["A star", "A Māori-inspired tribal", "An eagle", "A crown"],
      answer: 1,
      tokens: 5,
    },
    {
      category: "Culture",
      q: "Mike Tyson starred in which comedy film alongside Zach Galifianakis?",
      options: ["Knocked Up", "The Hangover", "Step Brothers", "Superbad"],
      answer: 1,
      tokens: 5,
    },
    {
      category: "Culture",
      q: "What was the name of Mike Tyson's one-man Broadway show?",
      options: [
        "Iron Mike",
        "Undisputed Truth",
        "The Baddest Man",
        "Knockout",
      ],
      answer: 1,
      tokens: 10,
    },
  ];

  let currentQ = null;
  let score = 0;
  let questionIndex = 0;
  let shuffled = [];

  // ── Public API ─────────────────────────────────────────────────────────────

  function init() {
    shuffled = _shuffle([...QUESTIONS]);
    questionIndex = 0;
    score = 0;
    _renderNextQuestion();
  }

  function answer(choiceIndex) {
    if (!currentQ) return;
    const correct = choiceIndex === currentQ.answer;
    const feedbackEl = document.getElementById("trivia-feedback");

    // Disable answer buttons
    document
      .querySelectorAll(".trivia-option")
      .forEach((btn, i) => {
        btn.disabled = true;
        if (i === currentQ.answer) btn.classList.add("correct");
        if (i === choiceIndex && !correct) btn.classList.add("wrong");
      });

    if (correct) {
      score += currentQ.tokens;
      if (feedbackEl)
        feedbackEl.innerHTML = `✅ Correct! <strong>+${currentQ.tokens} 🪙 tokens</strong>`;
      feedbackEl?.classList.add("correct");
      feedbackEl?.classList.remove("wrong");
      TokenWallet.earnTokens(currentQ.tokens, "Trivia: " + currentQ.q.substring(0, 40) + "…");
    } else {
      if (feedbackEl)
        feedbackEl.innerHTML = `❌ Wrong! The answer was <strong>${currentQ.options[currentQ.answer]}</strong>`;
      feedbackEl?.classList.add("wrong");
      feedbackEl?.classList.remove("correct");
    }

    const nextBtn = document.getElementById("trivia-next");
    if (nextBtn) nextBtn.style.display = "inline-block";
  }

  function nextQuestion() {
    questionIndex++;
    if (questionIndex >= shuffled.length) {
      // Restart with new shuffle
      shuffled = _shuffle([...QUESTIONS]);
      questionIndex = 0;
    }
    _renderNextQuestion();
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  function _renderNextQuestion() {
    currentQ = shuffled[questionIndex];
    const qEl = document.getElementById("trivia-question");
    const optEl = document.getElementById("trivia-options");
    const catEl = document.getElementById("trivia-category");
    const feedbackEl = document.getElementById("trivia-feedback");
    const nextBtn = document.getElementById("trivia-next");

    if (!qEl || !optEl) return;

    if (catEl) catEl.textContent = "📂 " + currentQ.category;
    qEl.textContent = currentQ.q;
    optEl.innerHTML = "";
    feedbackEl.textContent = "";
    feedbackEl.className = "trivia-feedback";
    if (nextBtn) nextBtn.style.display = "none";

    currentQ.options.forEach((opt, i) => {
      const btn = document.createElement("button");
      btn.className = "trivia-option nes-btn";
      btn.textContent = opt;
      btn.onclick = () => answer(i);
      optEl.appendChild(btn);
    });

    const scoreEl = document.getElementById("trivia-score");
    if (scoreEl) scoreEl.textContent = "Session Score: " + score + " tokens";
  }

  function _shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  return { init, answer, nextQuestion };
})();
