/* ===== ３もじ くいず ===== */
(function () {
  "use strict";

  // ── 定数 ──
  var TOTAL_QUESTIONS = 10;
  var CHOICE_COUNT = 10;
  var ANSWER_LENGTH = 3;
  var STORAGE_KEY = "3moji_quiz_history";

  // ランダムひらがなプール（答えに含まれない文字用）
  var HIRAGANA_POOL = "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん".split("");
  var DAKUTEN_POOL = "がぎぐげござじずぜぞだぢづでどばびぶべぼぱぴぷぺぽ".split("");
  var EXTRA_POOL = HIRAGANA_POOL.concat(DAKUTEN_POOL);

  // ── 状態 ──
  var allQuestions = [];
  var gameQuestions = [];
  var currentIndex = 0;
  var correctCount = 0;
  var selectedChars = [];
  var results = [];
  var finalClickable = false;

  // ── DOM取得 ──
  var screens = {
    start: document.getElementById("screen-start"),
    game: document.getElementById("screen-game"),
    result: document.getElementById("screen-result"),
    final: document.getElementById("screen-final"),
    history: document.getElementById("screen-history"),
    historyDetail: document.getElementById("screen-history-detail")
  };

  function showScreen(name) {
    Object.keys(screens).forEach(function (k) {
      screens[k].classList.remove("active");
    });
    screens[name].classList.add("active");
  }

  // ── 問題読み込み ──
  function loadQuestions() {
    return fetch("questions.json")
      .then(function (res) { return res.json(); })
      .then(function (data) { allQuestions = data; });
  }

  // ── ゲーム開始 ──
  function startGame() {
    var shuffled = allQuestions.slice().sort(function () { return Math.random() - 0.5; });
    gameQuestions = shuffled.slice(0, TOTAL_QUESTIONS);
    currentIndex = 0;
    correctCount = 0;
    selectedChars = [];
    results = [];
    showScreen("game");
    renderQuestion();
  }

  // ── 問題表示 ──
  function renderQuestion() {
    var q = gameQuestions[currentIndex];
    document.getElementById("question-number").textContent =
      (currentIndex + 1) + " / " + TOTAL_QUESTIONS + " もんめ";
    document.getElementById("score").textContent = "せいかい: " + correctCount;
    document.getElementById("question-text").textContent = q.question;

    selectedChars = [];
    renderSlots();
    renderChoices(q.answer);
    updateConfirmButton();
  }

  // ── 回答スロット描画 ──
  function renderSlots() {
    var slots = document.getElementById("answer-slots");
    var slotEls = slots.querySelectorAll(".slot");
    for (var i = 0; i < ANSWER_LENGTH; i++) {
      slotEls[i].textContent = selectedChars[i] || "";
      if (selectedChars[i]) {
        slotEls[i].classList.add("filled");
      } else {
        slotEls[i].classList.remove("filled");
      }
    }
  }

  // ── 選択肢生成 ──
  function renderChoices(answer) {
    var answerChars = answer.split("");
    // 答え文字＋ランダム文字で合計CHOICE_COUNT個
    var fillers = [];
    var pool = EXTRA_POOL.filter(function (c) { return answerChars.indexOf(c) === -1; });
    while (fillers.length < CHOICE_COUNT - ANSWER_LENGTH) {
      var r = pool[Math.floor(Math.random() * pool.length)];
      if (fillers.indexOf(r) === -1) {
        fillers.push(r);
      }
    }
    var allChars = answerChars.concat(fillers);
    // シャッフル
    allChars.sort(function () { return Math.random() - 0.5; });

    var container = document.getElementById("choices");
    container.innerHTML = "";
    allChars.forEach(function (ch, idx) {
      var btn = document.createElement("button");
      btn.className = "choice-btn";
      btn.textContent = ch;
      btn.setAttribute("data-index", idx);
      btn.addEventListener("click", function () {
        onChoiceClick(btn, ch);
      });
      container.appendChild(btn);
    });
  }

  // ── 文字選択 ──
  function onChoiceClick(btn, ch) {
    if (selectedChars.length >= ANSWER_LENGTH) return;
    selectedChars.push(ch);
    btn.classList.add("selected");
    renderSlots();
    updateConfirmButton();
  }

  // ── かくていボタンの有効/無効 ──
  function updateConfirmButton() {
    var btn = document.getElementById("btn-confirm");
    if (selectedChars.length === ANSWER_LENGTH) {
      btn.classList.remove("disabled");
    } else {
      btn.classList.add("disabled");
    }
  }

  // ── くりあ ──
  function clearAnswer() {
    selectedChars = [];
    renderSlots();
    // 選択肢のselectedを解除
    var btns = document.querySelectorAll(".choice-btn");
    btns.forEach(function (b) { b.classList.remove("selected"); });
    updateConfirmButton();
  }

  // ── かくてい ──
  function confirmAnswer() {
    if (selectedChars.length !== ANSWER_LENGTH) return;

    var q = gameQuestions[currentIndex];
    var userAnswer = selectedChars.join("");
    var isCorrect = userAnswer === q.answer;

    if (isCorrect) correctCount++;

    results.push({
      question: q.question,
      answer: q.answer,
      userAnswer: userAnswer,
      correct: isCorrect
    });

    // 結果画面
    showResultScreen(isCorrect, q.answer);
  }

  // ── 一問ごと結果表示 ──
  function showResultScreen(isCorrect, answer) {
    var icon = document.getElementById("result-icon");
    var label = document.getElementById("result-label");
    var answerEl = document.getElementById("result-answer");

    if (isCorrect) {
      icon.textContent = "\u2B50";
      label.textContent = "せいかい！";
      label.className = "result-label correct";
    } else {
      icon.textContent = "\uD83D\uDE22";
      label.textContent = "まちがい...";
      label.className = "result-label wrong";
    }
    answerEl.textContent = "こたえ: " + answer;
    showScreen("result");
  }

  // ── 次の問題 or 最終結果 ──
  function goNext() {
    currentIndex++;
    if (currentIndex >= TOTAL_QUESTIONS) {
      showFinalScreen();
    } else {
      showScreen("game");
      renderQuestion();
    }
  }

  // ── 最終結果画面 ──
  function showFinalScreen() {
    document.getElementById("final-score").textContent =
      correctCount + " / " + TOTAL_QUESTIONS;

    var detailEl = document.getElementById("final-detail");
    detailEl.innerHTML = "";
    results.forEach(function (r) {
      var row = document.createElement("div");
      row.className = "final-detail-row";
      var mark = r.correct ? "\u2B50" : "\u2716";
      row.innerHTML =
        '<span class="mark">' + mark + "</span>" +
        '<span>' + r.question + " → <b>" + r.answer + "</b></span>";
      detailEl.appendChild(row);
    });

    // localStorage に保存
    saveHistory();

    finalClickable = false;
    var tapEl = document.getElementById("final-tap");
    tapEl.style.display = "none";
    showScreen("final");

    setTimeout(function () {
      finalClickable = true;
      tapEl.style.display = "block";
    }, 3000);
  }

  // ── 最終結果画面タップ ──
  function onFinalClick() {
    if (!finalClickable) return;
    showScreen("start");
  }

  // ── localStorage 保存 ──
  function saveHistory() {
    var history = loadHistory();
    history.unshift({
      date: new Date().toISOString(),
      score: correctCount,
      total: TOTAL_QUESTIONS,
      results: results
    });
    // 最大20件
    if (history.length > 20) history = history.slice(0, 20);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }

  function loadHistory() {
    try {
      var data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  // ── きろく画面 ──
  function showHistoryScreen() {
    var list = document.getElementById("history-list");
    var history = loadHistory();
    list.innerHTML = "";

    if (history.length === 0) {
      list.innerHTML = '<div class="history-empty">まだ きろくが ないよ</div>';
    } else {
      history.forEach(function (entry, idx) {
        var item = document.createElement("div");
        item.className = "history-item";
        var d = new Date(entry.date);
        var dateStr =
          d.getFullYear() + "/" +
          ("0" + (d.getMonth() + 1)).slice(-2) + "/" +
          ("0" + d.getDate()).slice(-2) + " " +
          ("0" + d.getHours()).slice(-2) + ":" +
          ("0" + d.getMinutes()).slice(-2);
        item.innerHTML =
          '<span class="history-item-date">' + dateStr + "</span>" +
          '<span class="history-item-score">' + entry.score + " / " + entry.total + "</span>";
        item.addEventListener("click", function () {
          showHistoryDetail(idx);
        });
        list.appendChild(item);
      });
    }
    showScreen("history");
  }

  // ── きろく詳細 ──
  function showHistoryDetail(idx) {
    var history = loadHistory();
    var entry = history[idx];
    if (!entry) return;

    var content = document.getElementById("history-detail-content");
    content.innerHTML = "";

    var header = document.createElement("div");
    header.className = "detail-score-header";
    header.textContent = entry.score + " / " + entry.total;
    content.appendChild(header);

    entry.results.forEach(function (r) {
      var row = document.createElement("div");
      row.className = "detail-row";
      var mark = r.correct ? "\u2B50" : "\u2716";
      row.innerHTML =
        '<span class="mark">' + mark + "</span>" +
        '<span class="q-text">' + r.question + "</span>" +
        '<span class="a-text">' + r.answer + "</span>";
      content.appendChild(row);
    });

    // シェアボタンのデータ保持
    document.getElementById("btn-share").onclick = function () {
      shareToLine(entry);
    };

    showScreen("historyDetail");
  }

  // ── LINE シェア ──
  function shareToLine(entry) {
    var text = "【３もじ くいず】\n";
    text += entry.score + " / " + entry.total + " せいかい！\n\n";
    entry.results.forEach(function (r) {
      text += (r.correct ? "\u2B50" : "\u2716") + " " + r.question + " → " + r.answer + "\n";
    });
    var url = "https://social-plugins.line.me/lineit/share?text=" + encodeURIComponent(text);
    window.open(url, "_blank");
  }

  // ── イベントバインド ──
  function bindEvents() {
    document.getElementById("btn-start").addEventListener("click", startGame);
    document.getElementById("btn-records").addEventListener("click", showHistoryScreen);
    document.getElementById("btn-clear").addEventListener("click", clearAnswer);
    document.getElementById("btn-confirm").addEventListener("click", confirmAnswer);
    document.getElementById("btn-next").addEventListener("click", goNext);
    document.getElementById("btn-back").addEventListener("click", function () {
      showScreen("start");
    });
    document.getElementById("btn-back-history").addEventListener("click", function () {
      showHistoryScreen();
    });

    // 最終結果画面タップ
    screens.final.addEventListener("click", onFinalClick);
  }

  // ── 初期化 ──
  loadQuestions().then(function () {
    bindEvents();
    showScreen("start");
  });
})();
