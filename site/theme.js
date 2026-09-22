// Three states, not two: auto (follow the system), light, dark.
// The CSS carries all three — a bare :root, a prefers-color-scheme block for
// the un-stamped default, and a [data-theme] block that beats both — so "auto"
// is a real setting rather than a synonym for light.
//
// Loaded in <head> so the attribute is on <html> before the first paint.

(function () {
  var KEY = 'birly.theme';
  var BAR = { light: '#FAFAF9', dark: '#1E1C1B' };
  var ORDER = ['auto', 'light', 'dark'];

  var LABEL = {
    auto:  'Theme: system',
    light: 'Theme: light',
    dark:  'Theme: dark'
  };

  var ICON = {
    auto:  '<circle cx="12" cy="12" r="8"/><path d="M12 4a8 8 0 0 0 0 16z" fill="currentColor" stroke="none"/>',
    light: '<circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2M12 19.5v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2.5 12h2M19.5 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/>',
    dark:  '<path d="M20 13.5A8 8 0 0 1 10.5 4a8.2 8.2 0 1 0 9.5 9.5z"/>'
  };

  function read() {
    try {
      var v = localStorage.getItem(KEY);
      return ORDER.indexOf(v) > -1 ? v : 'auto';
    } catch (e) { return 'auto'; }
  }

  function resolved(mode) {
    if (mode !== 'auto') return mode;
    return window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function paintBar(mode) {
    var tag = document.querySelector('meta[name="theme-color"]');
    if (!tag) {
      tag = document.createElement('meta');
      tag.setAttribute('name', 'theme-color');
      document.head.appendChild(tag);
    }
    tag.setAttribute('content', BAR[resolved(mode)]);
  }

  function apply(mode) {
    var el = document.documentElement;
    if (mode === 'auto') el.removeAttribute('data-theme');
    else el.setAttribute('data-theme', mode);
    paintBar(mode);
  }

  var mode = read();
  apply(mode);

  // The button is optional — the resolver page applies the theme without one.
  window.Theme = {
    mount: function (btn) {
      if (!btn) return;

      function paintBtn() {
        btn.innerHTML =
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" ' +
          'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
          ICON[mode] + '</svg>';
        btn.setAttribute('aria-label', LABEL[mode]);
        btn.setAttribute('title', LABEL[mode]);
      }

      btn.addEventListener('click', function () {
        mode = ORDER[(ORDER.indexOf(mode) + 1) % ORDER.length];
        try { localStorage.setItem(KEY, mode); } catch (e) {}
        apply(mode);
        paintBtn();
      });

      paintBtn();
    }
  };

  // Follow the system while on auto.
  if (window.matchMedia) {
    var mq = window.matchMedia('(prefers-color-scheme: dark)');
    var onChange = function () { if (mode === 'auto') paintBar(mode); };
    if (mq.addEventListener) mq.addEventListener('change', onChange);
    else if (mq.addListener) mq.addListener(onChange);
  }
})();
