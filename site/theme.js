// Appearance: light/dark, and the accent colour. Both are per-browser
// preferences, so both live in localStorage — sessionStorage would forget
// the choice the moment the tab closed, which is not what a preference is.
//
// Loaded in <head> so the theme attribute and the accent variables are set
// before the first paint.

(function () {
  var THEME_KEY = 'birly.theme';
  var ACCENT_KEY = 'birly.accent';
  var BAR = { light: '#FAFAF9', dark: '#1E1C1B' };
  var ORDER = ['auto', 'light', 'dark'];

  /* Each accent is five tokens per theme, not one colour.
   *
   * In light the brand sits under white text, so it has to be dark enough to
   * clear 4.5:1 — a mid pastel fails that badly. In dark the relationship
   * inverts: a light tint under near-black text. So every entry carries both,
   * and `on` says which text colour the pair expects.
   *
   * tint/line are the quiet pair used for chips, code and hover fills. */
  var ACCENTS = {
    amber: {
      name: 'Amber',
      dot: '#D08A28',
      light: { brand: '#A76A16', dark: '#8E5A10', tint: '#FDF5E7', line: '#E8CFA0', on: '#FFFFFF' },
      dark:  { brand: '#E0A040', dark: '#EFB558', tint: '#2A1E0A', line: '#6B4A12', on: '#1C1917' }
    },
    rose: {
      name: 'Rose',
      dot: '#D96072',
      light: { brand: '#B23A48', dark: '#97303C', tint: '#FDF1F3', line: '#F0C6CD', on: '#FFFFFF' },
      dark:  { brand: '#F08C9B', dark: '#F5A6B2', tint: '#2C1216', line: '#7A2A36', on: '#1C1917' }
    },
    green: {
      name: 'Green',
      dot: '#49A86F',
      light: { brand: '#2F7D4F', dark: '#276843', tint: '#EFF8F2', line: '#BEE0CC', on: '#FFFFFF' },
      dark:  { brand: '#5FCB8D', dark: '#7FD9A4', tint: '#0C2416', line: '#1E5A38', on: '#1C1917' }
    },
    teal: {
      name: 'Teal',
      dot: '#3EA3A9',
      light: { brand: '#16787D', dark: '#12656A', tint: '#EDF8F8', line: '#B7DEE0', on: '#FFFFFF' },
      dark:  { brand: '#4FC9CF', dark: '#72D6DB', tint: '#08262A', line: '#145C62', on: '#1C1917' }
    },
    blue: {
      name: 'Blue',
      dot: '#4C82DC',
      light: { brand: '#2B63C4', dark: '#2452A6', tint: '#EEF3FD', line: '#C2D5F5', on: '#FFFFFF' },
      dark:  { brand: '#7BA6F0', dark: '#9BBCF5', tint: '#101C33', line: '#2A4478', on: '#1C1917' }
    },
    violet: {
      name: 'Violet',
      dot: '#9268DB',
      light: { brand: '#7A4BC4', dark: '#663EA6', tint: '#F4EFFD', line: '#D6C6F2', on: '#FFFFFF' },
      dark:  { brand: '#B392EE', dark: '#C6ADF4', tint: '#1E1533', line: '#4A3478', on: '#1C1917' }
    }
  };

  var THEME_LABEL = { auto: 'Theme: system', light: 'Theme: light', dark: 'Theme: dark' };
  var THEME_ICON = {
    auto:  '<circle cx="12" cy="12" r="8"/><path d="M12 4a8 8 0 0 0 0 16z" fill="currentColor" stroke="none"/>',
    light: '<circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2M12 19.5v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2.5 12h2M19.5 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/>',
    dark:  '<path d="M20 13.5A8 8 0 0 1 10.5 4a8.2 8.2 0 1 0 9.5 9.5z"/>'
  };
  var PALETTE_ICON =
    '<path d="M12 21a9 9 0 1 1 9-9c0 1.7-1.3 3-3 3h-1.5a1.8 1.8 0 0 0-1.3 3 1.8 1.8 0 0 1-1.3 3z"/>' +
    '<circle cx="7.5" cy="12" r="1.1" fill="currentColor" stroke="none"/>' +
    '<circle cx="9.8" cy="8" r="1.1" fill="currentColor" stroke="none"/>' +
    '<circle cx="14.2" cy="8" r="1.1" fill="currentColor" stroke="none"/>';

  function read(key, allowed, fallback) {
    try {
      var v = localStorage.getItem(key);
      return allowed.indexOf(v) > -1 ? v : fallback;
    } catch (e) { return fallback; }
  }

  var mode = read(THEME_KEY, ORDER, 'auto');
  var accent = read(ACCENT_KEY, Object.keys(ACCENTS), 'amber');

  function resolved(m) {
    if (m !== 'auto') return m;
    return window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function paintBar() {
    var tag = document.querySelector('meta[name="theme-color"]');
    if (!tag) {
      tag = document.createElement('meta');
      tag.setAttribute('name', 'theme-color');
      document.head.appendChild(tag);
    }
    tag.setAttribute('content', BAR[resolved(mode)]);
  }

  /* Inline custom properties on :root beat every stylesheet rule, including
   * the ones inside the dark media query — so the right half of the accent
   * has to be chosen here and re-applied whenever the theme changes. */
  function applyAccent() {
    var set = ACCENTS[accent][resolved(mode)];
    var el = document.documentElement;
    el.style.setProperty('--brand', set.brand);
    el.style.setProperty('--brand-dark', set.dark);
    el.style.setProperty('--brand-tint', set.tint);
    el.style.setProperty('--brand-line', set.line);
    el.style.setProperty('--brand-on', set.on);
    el.style.setProperty('--focus', set.brand);
  }

  function applyTheme() {
    var el = document.documentElement;
    if (mode === 'auto') el.removeAttribute('data-theme');
    else el.setAttribute('data-theme', mode);
    paintBar();
    applyAccent();
  }

  applyTheme();

  window.Theme = {
    accents: ACCENTS,
    current: function () { return accent; },

    mount: function (themeBtn, paletteBtn, popover) {
      if (themeBtn) {
        var paintThemeBtn = function () {
          themeBtn.innerHTML = svg(THEME_ICON[mode]);
          themeBtn.setAttribute('aria-label', THEME_LABEL[mode]);
          themeBtn.setAttribute('title', THEME_LABEL[mode]);
        };
        themeBtn.addEventListener('click', function () {
          mode = ORDER[(ORDER.indexOf(mode) + 1) % ORDER.length];
          try { localStorage.setItem(THEME_KEY, mode); } catch (e) {}
          applyTheme();
          paintThemeBtn();
        });
        paintThemeBtn();
      }

      if (!paletteBtn || !popover) return;

      paletteBtn.innerHTML = svg(PALETTE_ICON);
      paletteBtn.setAttribute('aria-label', 'Accent colour');
      paletteBtn.setAttribute('title', 'Accent colour');
      paletteBtn.setAttribute('aria-expanded', 'false');

      Object.keys(ACCENTS).forEach(function (key) {
        var a = ACCENTS[key];
        var sw = document.createElement('button');
        sw.type = 'button';
        sw.className = 'swatch' + (key === accent ? ' on' : '');
        sw.style.background = a.dot;
        sw.setAttribute('aria-label', a.name);
        sw.setAttribute('title', a.name);
        sw.dataset.accent = key;
        sw.addEventListener('click', function () {
          accent = key;
          try { localStorage.setItem(ACCENT_KEY, accent); } catch (e) {}
          applyAccent();
          popover.querySelectorAll('.swatch').forEach(function (n) {
            n.classList.toggle('on', n.dataset.accent === accent);
          });
          close();
        });
        popover.append(sw);
      });

      function open() {
        popover.hidden = false;
        paletteBtn.setAttribute('aria-expanded', 'true');
        document.addEventListener('click', onOutside, true);
        document.addEventListener('keydown', onEsc);
      }
      function close() {
        popover.hidden = true;
        paletteBtn.setAttribute('aria-expanded', 'false');
        document.removeEventListener('click', onOutside, true);
        document.removeEventListener('keydown', onEsc);
      }
      function onOutside(e) {
        if (!popover.contains(e.target) && e.target !== paletteBtn) close();
      }
      function onEsc(e) { if (e.key === 'Escape') { close(); paletteBtn.focus(); } }

      paletteBtn.addEventListener('click', function () {
        popover.hidden ? open() : close();
      });
    }
  };

  function svg(inner) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + inner + '</svg>';
  }

  // Follow the system while on auto — the accent has a light and a dark half,
  // so this has to repaint the colours too, not just the bar.
  if (window.matchMedia) {
    var mq = window.matchMedia('(prefers-color-scheme: dark)');
    var onChange = function () { if (mode === 'auto') { paintBar(); applyAccent(); } };
    if (mq.addEventListener) mq.addEventListener('change', onChange);
    else if (mq.addListener) mq.addListener(onChange);
  }
})();
