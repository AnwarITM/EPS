/**
 * EPS Theme Manager
 * Handles multi-theme persistence across all pages.
 */

const THEME_KEY = 'eps_theme_pref';
const APP_SEMANTIC_VERSION = '1.2.0';
const THEME_VERSION = '202609140623';

const THEME_MANIFEST = {
    'studio': `theme-studio.css?v=${THEME_VERSION}`,
    'default': `theme-default.css?v=${THEME_VERSION}`,
    'linear': `theme-linear.css?v=${THEME_VERSION}`,
    'vercel': `theme-vercel.css?v=${THEME_VERSION}`,
    'apple': `theme-apple.css?v=${THEME_VERSION}`,
    'supabase': `theme-supabase.css?v=${THEME_VERSION}`,
    'liquid-glass': `theme-liquid-glass.css?v=${THEME_VERSION}`
};

const THEME_COLORS = {
    'studio': '#245B47',
    'default': '#FF0036',
    'linear': '#5e6ad2',
    'vercel': '#000000',
    'apple': '#0066cc',
    'supabase': '#3ecf8e',
    'liquid-glass': '#0f172a'
};

const DARK_THEMES = ['linear', 'supabase', 'liquid-glass'];

function updateMetaThemeColor(themeId) {
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
        metaThemeColor.setAttribute('content', THEME_COLORS[themeId] || THEME_COLORS['default']);
    }
}

// Function to append version info at the bottom of theme modal content
function appendVersionFooter() {
    const modalContent = document.querySelector('#themeModal .modal-content');
    if (modalContent && !document.getElementById('eps-version-footer')) {
        const hr = document.createElement('hr');
        hr.style.border = '0';
        hr.style.borderTop = '1px dashed var(--surface-border)';
        hr.style.margin = 'var(--space-6) 0 var(--space-4) 0';
        hr.style.opacity = '0.5';
        
        const footer = document.createElement('div');
        footer.id = 'eps-version-footer';
        footer.style.textAlign = 'center';
        footer.style.fontSize = 'var(--font-size-xs)';
        footer.style.color = 'var(--text-secondary)';
        footer.style.fontWeight = '600';
        footer.style.letterSpacing = '0.03em';
        footer.innerHTML = `EPS v${APP_SEMANTIC_VERSION} • Build ${THEME_VERSION}`;
        
        modalContent.appendChild(hr);
        modalContent.appendChild(footer);
    }
}

function ensureStudioThemeOption() {
    document.querySelectorAll('.theme-grid').forEach((grid) => {
        if (grid.querySelector('[data-theme-choice="studio"], [onclick*="selectTheme(\'studio\')"]')) return;
        const option = document.createElement('button');
        option.type = 'button';
        option.className = 'theme-option';
        option.dataset.themeChoice = 'studio';
        option.innerHTML = '<span class="theme-preview" style="background:#245b47"></span><span>Studio</span>';
        option.addEventListener('click', () => setGlobalTheme('studio'));
        grid.prepend(option);
    });
}

function enhanceNavigation() {
    const nav = document.querySelector('.bottom-nav');
    if (!nav || nav.dataset.epsEnhanced) return;
    nav.dataset.epsEnhanced = 'true';
    nav.setAttribute('aria-label', 'Navigasi utama');
    const logo = '<span class="eps-logo-mark"><svg class="eps-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 6h14M5 12h10M5 18h14m-3-9 3 3-3 3"/></svg></span><span>eps<small>ENGINEER WORKSPACE</small></span>';
    nav.insertAdjacentHTML('afterbegin', `<a class="eps-logo" href="index.html" aria-label="EPS beranda">${logo}</a><div class="eps-nav-heading">WORKSPACE</div>`);
    nav.insertAdjacentHTML('beforeend', '<div class="eps-nav-foot">Untuk setiap langkah<br>di lapangan.<br><span>EPS · Customer Engineer</span></div>');
    const labels = { Home: 'Beranda', Notes: 'Catatan', Error: 'Error Codes', Settings: 'Tampilan' };
    nav.querySelectorAll('.nav-link').forEach((link) => {
        const label = link.querySelector('span:last-child');
        if (label && labels[label.textContent.trim()]) label.textContent = labels[label.textContent.trim()];
        if (link.classList.contains('active')) link.setAttribute('aria-current', 'page');
    });
}

// Function to update UI state based on theme
function updateThemeUI(themeId) {
    document.documentElement.dataset.theme = themeId;
    document.documentElement.style.colorScheme = DARK_THEMES.includes(themeId) ? 'dark' : 'light';
    window.dispatchEvent(new CustomEvent('eps:theme-change', { detail: { themeId } }));
    document.querySelectorAll('[data-theme-choice]').forEach((option) => {
        option.setAttribute('aria-pressed', String(option.dataset.themeChoice === themeId));
    });
    const isDark = DARK_THEMES.includes(themeId);
    
    // Update the new toggle switch if it exists
    const toggleCheckbox = document.getElementById('themeToggleCheckbox');
    if (toggleCheckbox) {
        toggleCheckbox.checked = isDark;
    }

    // Update old theme buttons for compatibility
    const label = isDark ? 'Mode Terang' : 'Mode Gelap';
    const btns = document.querySelectorAll('[onclick="toggleGlobalTheme()"]');
    btns.forEach((btn) => {
        if (btn.tagName !== 'INPUT') {
            btn.textContent = label;
        }
        btn.setAttribute('aria-label', label);
        btn.setAttribute('title', label);
    });

    // Append version footer
    appendVersionFooter();
}

// Function to immediately apply theme (can be called in head)
function applyTheme() {
    let saved = localStorage.getItem(THEME_KEY) || 'studio';
    
    // Migration logic: if saved value contains '.css', map it to an ID or reset
    if (saved.includes('.css')) {
        if (saved.includes('theme-dark')) {
            saved = 'linear';
        } else {
            saved = 'default';
        }
    }

    // Ensure the ID is valid
    if (!THEME_MANIFEST[saved]) {
        saved = 'default';
    }

    // Set the theme immediately
    const themeFile = THEME_MANIFEST[saved];
    const link = document.getElementById('theme-link');
    if (link) {
        link.setAttribute('href', themeFile);
    }
    document.documentElement.dataset.theme = saved;
    updateMetaThemeColor(saved);

    // Defer UI update slightly to ensure DOM is ready if script runs in head
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => updateThemeUI(saved));
    } else {
        updateThemeUI(saved);
    }
    
    localStorage.setItem(THEME_KEY, saved);
}

// Function to set a specific theme
function setGlobalTheme(themeId) {
    const themeFile = THEME_MANIFEST[themeId] || THEME_MANIFEST['default'];
    const link = document.getElementById('theme-link');
    if (link) {
        link.setAttribute('href', themeFile);
    }
    updateMetaThemeColor(themeId);
    localStorage.setItem(THEME_KEY, themeId);
    updateThemeUI(themeId);
}

// Function to toggle between default light and default dark (linear)
function toggleGlobalTheme() {
    const current = localStorage.getItem(THEME_KEY) || 'default';
    const next = DARK_THEMES.includes(current) ? 'default' : 'linear';
    setGlobalTheme(next);
}

// Apply on load
document.addEventListener('DOMContentLoaded', () => {
    ensureStudioThemeOption();
    enhanceNavigation();
    applyTheme();
});

// Also apply immediately if possible to prevent flash
applyTheme();
