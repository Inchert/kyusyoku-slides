// ハンバーガーメニュー制御
function toggleMenu() {
    const hamburger = document.querySelector('.hamburger');
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.overlay');

    hamburger.classList.toggle('active');
    sidebar.classList.toggle('open');
    overlay.classList.toggle('active');
}

function closeMenu() {
    const hamburger = document.querySelector('.hamburger');
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.overlay');

    hamburger.classList.remove('active');
    sidebar.classList.remove('open');
    overlay.classList.remove('active');
}

// ツールバー表示/非表示
let toolbarHidden = false;

function toggleToolbar() {
    const toolbar = document.getElementById('toolbar');
    const toggle = document.getElementById('toolbarToggle');

    toolbarHidden = !toolbarHidden;
    toolbar.classList.toggle('hidden', toolbarHidden);
    toggle.classList.toggle('collapsed', toolbarHidden);

    // 非表示時はパネルも閉じる
    if (toolbarHidden) {
        closeSearch();
        closeMemo();
    }

    // 状態を保存
    localStorage.setItem('toolbarHidden', toolbarHidden);
}

// 初期化時にツールバー状態を復元
document.addEventListener('DOMContentLoaded', () => {
    const saved = localStorage.getItem('toolbarHidden');
    if (saved === 'true') {
        toolbarHidden = true;
        const toolbar = document.getElementById('toolbar');
        const toggle = document.getElementById('toolbarToggle');
        if (toolbar) toolbar.classList.add('hidden');
        if (toggle) toggle.classList.add('collapsed');
    }
    loadCheckedItems();
});

// ========== メモ機能 ==========
let memoOpen = false;

function toggleMemo() {
    const panel = document.getElementById('memoPanel');
    const btn = document.getElementById('memoBtn');
    memoOpen = !memoOpen;
    if (panel) panel.classList.toggle('active', memoOpen);
    if (btn) btn.classList.toggle('active', memoOpen);
    if (memoOpen) {
        loadMemo();
        closeSearch();
    }
}

function closeMemo() {
    memoOpen = false;
    const panel = document.getElementById('memoPanel');
    const btn = document.getElementById('memoBtn');
    if (panel) panel.classList.remove('active');
    if (btn) btn.classList.remove('active');
}

function closeSearch() {
    searchOpen = false;
    const panel = document.getElementById('searchPanel');
    const btn = document.getElementById('searchBtn');
    if (panel) panel.classList.remove('active');
    if (btn) btn.classList.remove('active');
}

// 現在のページ名からスライド番号を取得
function getCurrentSlideNumber() {
    const path = window.location.pathname;
    const filename = path.split('/').pop();
    if (filename === 'index.html' || filename === '') {
        return 0;
    }
    const match = filename.match(/slide-(\d+)\.html/);
    if (match) {
        return parseInt(match[1], 10);
    }
    return 0;
}

function loadMemo() {
    const slideNum = getCurrentSlideNumber();
    const memos = JSON.parse(localStorage.getItem('slideMemos') || '{}');
    const memo = memos[slideNum] || '';
    const memoText = document.getElementById('memoText');
    if (memoText) memoText.value = memo;
}

function saveMemo() {
    const slideNum = getCurrentSlideNumber();
    const memos = JSON.parse(localStorage.getItem('slideMemos') || '{}');
    const memoText = document.getElementById('memoText');
    const text = memoText ? memoText.value : '';

    if (text.trim()) {
        memos[slideNum] = text;
    } else {
        delete memos[slideNum];
    }
    localStorage.setItem('slideMemos', JSON.stringify(memos));

    const saved = document.getElementById('memoSaved');
    if (saved) {
        saved.style.display = 'block';
        setTimeout(() => saved.style.display = 'none', 2000);
    }
}

function clearMemo() {
    if (confirm('このスライドのメモを削除しますか？')) {
        const memoText = document.getElementById('memoText');
        if (memoText) memoText.value = '';
        saveMemo();
    }
}

// ========== チェック機能 ==========
let checkMode = false;

function toggleCheckMode() {
    checkMode = !checkMode;
    const btn = document.getElementById('checkBtn');
    const indicator = document.getElementById('checkIndicator');

    if (btn) btn.classList.toggle('active', checkMode);
    if (indicator) indicator.classList.toggle('active', checkMode);

    if (checkMode) {
        enableCheckMode();
    } else {
        disableCheckMode();
    }
}

function enableCheckMode() {
    const slideNum = getCurrentSlideNumber();
    // li要素、p要素、カード内の要素をチェック可能に
    const checkables = document.querySelectorAll('.slide li, .slide .card p, .slide .highlight-box p');
    checkables.forEach((el, i) => {
        if (!el.classList.contains('checkable')) {
            el.classList.add('checkable');
            el.dataset.checkId = `${slideNum}-${i}`;
            el.addEventListener('click', handleCheck);
        }
    });
    loadCheckedItems();
}

function disableCheckMode() {
    const checkables = document.querySelectorAll('.checkable');
    checkables.forEach(el => {
        el.classList.remove('checkable');
        el.removeEventListener('click', handleCheck);
    });
}

function handleCheck(e) {
    if (!checkMode) return;
    const el = e.currentTarget;
    el.classList.toggle('checked');
    saveCheckedItems();
}

function saveCheckedItems() {
    const checked = JSON.parse(localStorage.getItem('checkedItems') || '{}');
    const checkables = document.querySelectorAll('.checkable');
    checkables.forEach(el => {
        if (el.classList.contains('checked')) {
            checked[el.dataset.checkId] = true;
        } else {
            delete checked[el.dataset.checkId];
        }
    });
    localStorage.setItem('checkedItems', JSON.stringify(checked));
}

function loadCheckedItems() {
    const checked = JSON.parse(localStorage.getItem('checkedItems') || '{}');
    const slideNum = getCurrentSlideNumber();
    const checkables = document.querySelectorAll('.checkable');
    checkables.forEach(el => {
        if (checked[el.dataset.checkId]) {
            el.classList.add('checked');
        }
    });
}

// ========== 検索機能 ==========
let searchOpen = false;

function toggleSearch() {
    const panel = document.getElementById('searchPanel');
    const btn = document.getElementById('searchBtn');
    searchOpen = !searchOpen;
    if (panel) panel.classList.toggle('active', searchOpen);
    if (btn) btn.classList.toggle('active', searchOpen);
    if (searchOpen) {
        const input = document.getElementById('searchInput');
        if (input) input.focus();
        closeMemo();
    }
}

// 検索機能（単一ページ版）
function performSearch() {
    const input = document.getElementById('searchInput');
    const results = document.getElementById('searchResults');
    const query = input ? input.value.toLowerCase() : '';

    if (query.length < 2) {
        if (results) results.innerHTML = '<p style="color:#999;text-align:center;">2文字以上入力してください</p>';
        return;
    }

    const slide = document.querySelector('.slide');
    if (!slide) {
        if (results) results.innerHTML = '<p style="color:#999;text-align:center;">コンテンツが見つかりません</p>';
        return;
    }

    const text = slide.textContent;
    const lowerText = text.toLowerCase();

    if (lowerText.includes(query)) {
        const pos = lowerText.indexOf(query);
        const start = Math.max(0, pos - 30);
        const end = Math.min(text.length, pos + query.length + 30);
        let matchText = text.substring(start, end);
        if (start > 0) matchText = '...' + matchText;
        if (end < text.length) matchText = matchText + '...';

        if (results) {
            results.innerHTML = `
                <div class="search-result-item">
                    <div class="slide-title">このページ内で見つかりました</div>
                    <div class="match-text">${matchText.replace(new RegExp(query, 'gi'), '<span class="search-highlight">$&</span>')}</div>
                </div>
            `;
        }
    } else {
        if (results) results.innerHTML = '<p style="color:#999;text-align:center;">このページ内では見つかりませんでした</p>';
    }
}
