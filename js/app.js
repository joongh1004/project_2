/**
 * LISTEN Main Application Controller (js/app.js)
 */

const App = (function() {
  let currentQuestionIndex = 0;
  let currentResultData = null;

  function init() {
    setupTheme();
    setupNavigation();
    setupQuizListeners();
    ContentDB.loadDB().then(() => {
      renderLibrary();
    });
    ListenChat.init();
  }

  function setupTheme() {
    const themeBtn = document.getElementById('theme-toggle-btn');
    const themeIcon = document.getElementById('theme-icon');
    const savedTheme = localStorage.getItem('listen_theme');

    if (savedTheme === 'light') {
      document.body.classList.add('light-theme');
      if (themeIcon) themeIcon.textContent = '☀️';
    } else {
      document.body.classList.remove('light-theme');
      if (themeIcon) themeIcon.textContent = '🌙';
    }

    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        const isLight = document.body.classList.toggle('light-theme');
        if (themeIcon) themeIcon.textContent = isLight ? '☀️' : '🌙';
        localStorage.setItem('listen_theme', isLight ? 'light' : 'dark');
      });
    }
  }

  function setupNavigation() {
    const navBtns = document.querySelectorAll('.nav-link-btn[data-tab]');
    navBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab');
        switchTab(tab);
      });
    });

    document.getElementById('logo-btn')?.addEventListener('click', (e) => {
      e.preventDefault();
      switchTab('hero');
    });

    document.getElementById('retest-from-chat-btn')?.addEventListener('click', () => {
      startQuiz();
    });
  }

  function switchTab(tabName) {
    // Update active nav button
    document.querySelectorAll('.nav-link-btn[data-tab]').forEach(btn => {
      if (btn.getAttribute('data-tab') === tabName) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Hide all screen sections
    document.querySelectorAll('.screen-section').forEach(sec => sec.classList.remove('active'));

    // Show target section
    const targetId = `${tabName}-screen`;
    const targetEl = document.getElementById(targetId);
    if (targetEl) {
      targetEl.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    if (tabName === 'chat') {
      ListenChat.init();
    } else if (tabName === 'library') {
      renderLibrary();
    }
  }

  function setupQuizListeners() {
    document.getElementById('start-quiz-btn')?.addEventListener('click', startQuiz);
    document.getElementById('restart-btn')?.addEventListener('click', startQuiz);
    document.getElementById('prev-q-btn')?.addEventListener('click', goToPreviousQuestion);
  }

  function startQuiz() {
    if (window.enneagramEngine) {
      window.enneagramEngine.reset();
    }
    currentQuestionIndex = 0;
    
    document.querySelectorAll('.screen-section').forEach(sec => sec.classList.remove('active'));
    document.getElementById('quiz-screen')?.classList.add('active');
    
    renderQuestion();
  }

  function getQuestions() {
    if (typeof QUESTIONS_DATA !== 'undefined' && Array.isArray(QUESTIONS_DATA)) return QUESTIONS_DATA;
    if (window.QUESTIONS_DATA && Array.isArray(window.QUESTIONS_DATA)) return window.QUESTIONS_DATA;
    return [];
  }

  function renderQuestion() {
    const questions = getQuestions();
    if (!questions || !questions[currentQuestionIndex]) return;

    const q = questions[currentQuestionIndex];
    const numEl = document.getElementById('current-q-num');
    const titleEl = document.getElementById('question-title');
    const subTitleEl = document.getElementById('question-subtitle');

    if (numEl) numEl.textContent = currentQuestionIndex + 1;
    if (titleEl) titleEl.textContent = q.question;
    if (subTitleEl) subTitleEl.textContent = q.subtitle || "";

    const progressFill = document.getElementById('progress-fill');
    if (progressFill) {
      progressFill.style.width = `${((currentQuestionIndex + 1) / questions.length) * 100}%`;
    }

    const prevBtn = document.getElementById('prev-q-btn');
    if (prevBtn) {
      prevBtn.style.visibility = currentQuestionIndex > 0 ? 'visible' : 'hidden';
    }

    const container = document.getElementById('options-container');
    if (container) {
      container.innerHTML = q.options.map((opt, i) => `
        <button class="option-btn" onclick="App.selectOption(${i})">
          ${opt.text}
        </button>
      `).join('');
    }
  }

  function selectOption(optionIndex) {
    const questions = getQuestions();
    const q = questions[currentQuestionIndex];
    if (!q) return;

    if (window.enneagramEngine) {
      window.enneagramEngine.recordAnswer(currentQuestionIndex, optionIndex);
    }

    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
      renderQuestion();
    } else {
      finishQuiz();
    }
  }

  function goToPreviousQuestion() {
    if (currentQuestionIndex > 0) {
      currentQuestionIndex--;
      renderQuestion();
    }
  }

  function finishQuiz() {
    let result = null;
    if (window.enneagramEngine) {
      result = window.enneagramEngine.calculateResult();
    }

    const resData = result?.resultData || {};
    currentResultData = result;

    // Save profile to localStorage for LISTEN Chat
    const userProfile = {
      primaryType: result?.mainType || 1,
      wing: result?.wingCode || "1w9",
      title: `${result?.wingCode || "1w9"} ${resData.title || ''}`,
      description: resData.summary || ''
    };
    localStorage.setItem('enneagram_result', JSON.stringify(userProfile));

    // Update Result UI
    const wingEl = document.getElementById('res-wing-code');
    const titleEl = document.getElementById('res-title');
    const subTitleEl = document.getElementById('res-subtitle');
    const summaryEl = document.getElementById('res-summary');

    if (wingEl) wingEl.textContent = result?.wingCode || "1w9";
    if (titleEl) titleEl.textContent = resData.title || "평화로운 개혁가";
    if (subTitleEl) subTitleEl.textContent = resData.subtitle || "";
    if (summaryEl) summaryEl.textContent = resData.summary || "";

    // Biblical Character Card
    if (resData.character) {
      const charName = document.getElementById('res-char-name');
      const charTitle = document.getElementById('res-char-title');
      const charQuote = document.getElementById('res-char-quote');
      const charDesc = document.getElementById('res-char-desc');
      const charImg = document.getElementById('res-char-img');

      if (charName) charName.textContent = resData.character.name || "";
      if (charTitle) charTitle.textContent = resData.character.title || "";
      if (charQuote) charQuote.textContent = `"${resData.character.quote || ''}"`;
      if (charDesc) charDesc.textContent = resData.character.description || "";
      if (charImg && resData.character.image) {
        charImg.src = resData.character.image;
        charImg.alt = resData.character.name || "닮은 성경 인물";
      }
    }

    // Main Bible Verse Card
    if (resData.mainVerse) {
      const verseRef = document.getElementById('res-main-ref');
      const verseText = document.getElementById('res-main-text');
      const verseReflection = document.getElementById('res-main-reflection');

      if (verseRef) verseRef.textContent = resData.mainVerse.reference || "";
      if (verseText) verseText.textContent = `"${resData.mainVerse.text || ''}"`;
      if (verseReflection) verseReflection.textContent = resData.mainVerse.reflection || "";
    }

    // Growth & Prayer
    const growthTipEl = document.getElementById('res-growth-tip');
    const prayerEl = document.getElementById('res-prayer');

    if (growthTipEl) growthTipEl.textContent = resData.growthTip || "";
    if (prayerEl) prayerEl.textContent = resData.prayer || "";

    // Automatically reset & re-initialize LISTEN Chat for updated Enneagram result profile
    ListenChat.clearChat();

    document.querySelectorAll('.screen-section').forEach(sec => sec.classList.remove('active'));
    document.getElementById('result-screen')?.classList.add('active');
  }

  /**
   * Render Content Library Grid
   */
  async function renderLibrary() {
    const grid = document.getElementById('library-grid');
    if (!grid) return;

    const category = document.getElementById('lib-category')?.value || 'all';
    const wing = document.getElementById('lib-wing')?.value || 'all';
    const query = document.getElementById('lib-search')?.value.toLowerCase() || '';

    const all = await ContentDB.getAllContents(false);

    const filtered = all.filter(item => {
      if (category !== 'all' && item.category !== category) return false;
      if (wing !== 'all' && !item.targetEnneagram?.wings?.includes(wing)) return false;
      if (query) {
        const titleMatch = item.title?.toLowerCase().includes(query);
        const summaryMatch = item.summary?.toLowerCase().includes(query);
        const tagMatch = item.tags?.some(t => t.toLowerCase().includes(query));
        if (!titleMatch && !summaryMatch && !tagMatch) return false;
      }
      return true;
    });

    if (filtered.length === 0) {
      grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 40px;">조건에 부합하는 메타데이터 컨텐츠가 없습니다.</div>`;
      return;
    }

    grid.innerHTML = filtered.map(card => `
      <div class="content-card">
        <div class="card-thumb" style="background-image: url('${card.thumbnailUrl || 'images/default_thumb.jpg'}')">
          <span class="badge ${card.category}">${getCategoryLabel(card.category)}</span>
        </div>
        <div class="card-body">
          <h4 class="card-title">${card.title}</h4>
          <p class="card-summary">${card.summary}</p>
          ${card.bibleVerse ? `<div class="card-verse">📖 ${card.bibleVerse}</div>` : ''}
          <div class="card-tags">
            ${(card.tags || []).map(t => `<span class="tag">#${t}</span>`).join('')}
          </div>
          <a href="${card.url}" target="_blank" rel="noopener" class="card-btn">
            <span>컨텐츠 바로가기</span> ↗
          </a>
        </div>
      </div>
    `).join('');
  }

  function getCategoryLabel(cat) {
    const map = {
      music: '🎵 찬양/CCM',
      video: '🎬 설교/영상',
      article: '📝 영성칼럼',
      book: '📚 묵상집',
      podcast: '🎙️ 팟캐스트'
    };
    return map[cat] || '✨ 묵상';
  }

  return {
    init,
    switchTab,
    startQuiz,
    selectOption,
    renderLibrary
  };
})();

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

window.App = App;
