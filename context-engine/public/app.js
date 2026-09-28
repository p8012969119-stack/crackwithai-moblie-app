/**
 * JS Context Engineering & Data Analysis Engine
 * Client Frontend Application Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const apiKeyInput = document.getElementById('apiKeyInput');
  const toggleKeyVisibility = document.getElementById('toggleKeyVisibility');
  const keyStatusText = document.getElementById('keyStatusText');
  const clearKeyBtn = document.getElementById('clearKeyBtn');

  const pipelineForm = document.getElementById('pipelineForm');
  const queryInput = document.getElementById('queryInput');
  const submitBtn = document.getElementById('submitBtn');

  const progressLogCard = document.getElementById('progressLogCard');
  const progressStepTitle = document.getElementById('progressStepTitle');
  const progressBarFill = document.getElementById('progressBarFill');
  const progressSubText = document.getElementById('progressSubText');

  const errorBanner = document.getElementById('errorBanner');
  const errorMessageText = document.getElementById('errorMessageText');

  const answerBanner = document.getElementById('answerBanner');
  const answerText = document.getElementById('answerText');

  const resultCount = document.getElementById('resultCount');
  const resultsGrid = document.getElementById('resultsGrid');
  const refreshHistoryBtn = document.getElementById('refreshHistoryBtn');
  const presetBtns = document.querySelectorAll('.preset-btn');

  // LOCAL STORAGE KEY MANAGEMENT
  const STORAGE_KEY = 'tavily_api_key';

  const updateKeyStatus = () => {
    const savedKey = localStorage.getItem(STORAGE_KEY) || '';
    if (savedKey.trim()) {
      apiKeyInput.value = savedKey;
      keyStatusText.innerHTML = `Status: <span class="text-emerald-400 font-semibold">Saved in localStorage ✓</span>`;
    } else {
      keyStatusText.innerHTML = `Status: <span class="text-amber-400 font-semibold">Not Configured</span>`;
    }
  };

  // Auto-commit API Key to localStorage on input change
  apiKeyInput.addEventListener('input', (e) => {
    const val = e.target.value.trim();
    if (val) {
      localStorage.setItem(STORAGE_KEY, val);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
    updateKeyStatus();
  });

  // Toggle password eye visibility
  toggleKeyVisibility.addEventListener('click', () => {
    const isPassword = apiKeyInput.type === 'password';
    apiKeyInput.type = isPassword ? 'text' : 'password';
    toggleKeyVisibility.innerHTML = isPassword ? '<i class="fa-solid fa-eye-slash"></i>' : '<i class="fa-solid fa-eye"></i>';
  });

  // Clear Key button
  clearKeyBtn.addEventListener('click', () => {
    localStorage.removeItem(STORAGE_KEY);
    apiKeyInput.value = '';
    updateKeyStatus();
  });

  // PRESET QUERY BUTTONS
  presetBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const presetQuery = btn.getAttribute('data-query');
      if (presetQuery) {
        queryInput.value = presetQuery;
        pipelineForm.dispatchEvent(new Event('submit'));
      }
    });
  });

  // REFRESH DB HISTORY BUTTON
  refreshHistoryBtn.addEventListener('click', async () => {
    fetchHistoryRecords();
  });

  // PIPELINE FORM SUBMIT HANDLER
  pipelineForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const userQuery = queryInput.value.trim();
    const tavilyApiKey = (apiKeyInput.value || localStorage.getItem(STORAGE_KEY) || '').trim();

    if (!userQuery) {
      showError('Please enter a query before executing the pipeline.');
      return;
    }

    if (!tavilyApiKey) {
      showError('Please enter your Tavily API Key in the sidebar input first.');
      apiKeyInput.focus();
      return;
    }

    // Reset UI State
    hideError();
    answerBanner.classList.add('hidden');
    showProgress(true);

    // Pipeline Step 1: Tavily API Query
    updateProgressStep('1/3 Fetching Tavily AI Context Search...', 33, 'Querying top 3 high-signal web sources via Tavily API...');

    try {
      // Pipeline Step 2: Data Transformation & DB Bulk Save via API
      setTimeout(() => {
        updateProgressStep('2/3 Transforming & Bulk Inserting into MongoDB...', 66, 'Executing Mongoose bulkWrite upsert on context_records schema...');
      }, 700);

      const response = await fetch('/api/context/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userQuery, tavilyApiKey })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || result.details || `Server returned error status ${response.status}`);
      }

      // Pipeline Step 3: Complete & Render UI
      updateProgressStep('3/3 Rendering UI Component Cards...', 100, 'Context records loaded successfully!');

      setTimeout(() => {
        showProgress(false);

        if (result.answer) {
          answerText.textContent = result.answer;
          answerBanner.classList.remove('hidden');
        }

        renderContextCards(result.data || []);
      }, 500);

    } catch (error) {
      showProgress(false);
      showError(error.message || 'Failed to execute Context Pipeline.');
    }
  });

  // RENDER CARDS FUNCTION
  function renderContextCards(records) {
    resultCount.textContent = records.length;

    if (!records || records.length === 0) {
      resultsGrid.innerHTML = `
        <div class="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center">
          <p class="text-sm font-medium text-slate-400">No context records found for this query.</p>
        </div>
      `;
      return;
    }

    resultsGrid.innerHTML = records.map((rec, index) => {
      const scorePercent = Math.round((rec.reliabilityScore || 0) * 100);
      const isHighSignal = (rec.reliabilityScore || 0) >= 0.85;

      // Color coding badges
      const badgeStyle = isHighSignal
        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
        : 'bg-amber-500/10 text-amber-400 border-amber-500/30';

      const badgeIcon = isHighSignal ? 'fa-shield-check' : 'fa-circle-exclamation';
      const badgeLabel = isHighSignal ? 'High Signal Context' : 'Moderate Signal';

      const formattedDate = rec.timestamp
        ? new Date(rec.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        : 'Just now';

      return `
        <div class="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden transition-all duration-300 hover:border-slate-700">
          
          <!-- CARD HEADER -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-slate-800/80 pb-4">
            <div class="flex items-center gap-3">
              <span class="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center font-bold text-xs">
                #${index + 1}
              </span>
              <h3 class="text-base font-bold text-slate-100 line-clamp-1 flex-1">
                ${escapeHtml(rec.title)}
              </h3>
            </div>

            <!-- RELIABILITY SCORE BADGE -->
            <div class="flex items-center gap-2">
              <div class="px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${badgeStyle}">
                <i class="fa-solid ${badgeIcon}"></i>
                <span>${scorePercent}% (${badgeLabel})</span>
              </div>
            </div>
          </div>

          <!-- EXTRACTED FACTS BODY -->
          <div class="bg-slate-950 p-4 rounded-xl border border-slate-800/80 mb-4">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <i class="fa-solid fa-align-left text-indigo-400"></i>
                Extracted Context Facts
              </span>
              <button
                class="copy-btn text-xs text-slate-500 hover:text-indigo-400 transition-colors flex items-center gap-1"
                onclick="copyToClipboard('${escapeHtml(rec.extractedFacts).replace(/'/g, "\\'")}', this)"
              >
                <i class="fa-regular fa-copy"></i>
                <span>Copy</span>
              </button>
            </div>
            <p class="text-xs text-slate-300 leading-relaxed font-mono whitespace-pre-line">
              ${escapeHtml(rec.extractedFacts)}
            </p>
          </div>

          <!-- CARD FOOTER META & DIRECT ANCHOR LINK -->
          <div class="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 pt-1">
            <div class="flex items-center gap-4">
              <span class="font-mono text-slate-500">ID: ${rec.sourceId ? rec.sourceId.substring(0, 10) : 'N/A'}...</span>
              <span><i class="fa-regular fa-clock mr-1"></i>${formattedDate}</span>
            </div>

            <!-- DIRECT SOURCE ANCHOR LINK -->
            <a
              href="${escapeHtml(rec.url)}"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 border border-indigo-500/20 font-medium transition-all text-xs"
            >
              <span>Visit Source URL</span>
              <i class="fa-solid fa-up-right-from-square text-xs"></i>
            </a>
          </div>

        </div>
      `;
    }).join('');
  }

  // FETCH DB HISTORY
  async function fetchHistoryRecords() {
    try {
      const res = await fetch('/api/context/history');
      const data = await res.json();
      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        renderContextCards(data.data);
      }
    } catch (e) {
      console.warn('History fetch failed:', e);
    }
  }

  // UI HELPER FUNCTIONS
  function showProgress(show) {
    if (show) {
      progressLogCard.classList.remove('hidden');
      submitBtn.disabled = true;
    } else {
      progressLogCard.classList.add('hidden');
      submitBtn.disabled = false;
    }
  }

  function updateProgressStep(title, percent, sub) {
    progressStepTitle.textContent = title;
    progressBarFill.style.width = `${percent}%`;
    progressSubText.textContent = sub;
  }

  function showError(msg) {
    errorMessageText.textContent = msg;
    errorBanner.classList.remove('hidden');
  }

  function hideError() {
    errorBanner.classList.add('hidden');
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Global helper for copy button
  window.copyToClipboard = function(text, btn) {
    navigator.clipboard.writeText(text).then(() => {
      const orig = btn.innerHTML;
      btn.innerHTML = `<i class="fa-solid fa-check text-emerald-400"></i><span class="text-emerald-400">Copied!</span>`;
      setTimeout(() => {
        btn.innerHTML = orig;
      }, 2000);
    });
  };

  // Initialize
  updateKeyStatus();
  fetchHistoryRecords();
});
