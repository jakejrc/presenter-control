/**
 * presenter-control.js
 * 翻页笔/键盘/触摸 全兼容翻页控制器
 *
 * 特性：
 * - DOM0 + DOM2 三层事件绑定，兼容各类翻页笔设备
 * - 时间戳防抖（200ms），避免多监听器重复触发
 * - 支持 ArrowUp/ArrowDown/ArrowLeft/ArrowRight/PageUp/PageDown/Space/Enter/Home/End
 * - HTML5 Media Session API（媒体按键翻页笔）
 * - 触摸滑动翻页（>50px）
 * - 点击左右半屏翻页
 * - 快捷键面板（?键）
 * - 调试面板（Shift+F12）
 * - Textarea ESC 失焦
 *
 * 使用方式：
 * 1. 引入本脚本
 * 2. 定义全局函数 go(index) 和全局变量 current / total
 * 3. 可选：在 HTML 中添加 id="shortcutOverlay" 的快捷键面板
 */

(function() {
  // ===== 防抖锁 =====
  var _navLastTime = 0;

  // ===== 核心导航函数 =====
  function nav(e) {
    var now = Date.now();
    if (now - _navLastTime < 200) return;
    _navLastTime = now;

    var kc = e.keyCode || e.which || 0;
    var k = e.key || '';
    var ae = document.activeElement;

    // 在输入框内时，只响应翻页/Home/End/ESC
    if (ae && /input|textarea|select/i.test(ae.tagName)) {
      if (kc !== 33 && kc !== 34 && kc !== 38 && kc !== 40 && kc !== 36 && kc !== 35 && kc !== 27 &&
          k !== 'PageUp' && k !== 'PageDown' && k !== 'ArrowUp' && k !== 'ArrowDown' && k !== 'Home' && k !== 'End' && k !== 'Escape') return;
    }
    if (ae && ae.isContentEditable) return;

    // 快捷键面板（?键）
    if (kc === 191 || k === '?') {
      e.preventDefault();
      var so = document.getElementById('shortcutOverlay');
      if (so) so.classList.toggle('show');
      return;
    }
    var so = document.getElementById('shortcutOverlay');
    if (so && so.classList.contains('show')) {
      if (kc === 27 || k === 'Escape') { so.classList.remove('show'); e.preventDefault(); }
      return;
    }

    // 上一页
    if (kc === 33 || kc === 37 || kc === 38 || kc === 8 ||
        k === 'PageUp' || k === 'ArrowUp' || k === 'ArrowLeft' || k === 'MediaTrackPrevious') {
      e.preventDefault();
      if (typeof current !== 'undefined' && current > 0 && typeof go === 'function') go(current - 1);
      return;
    }
    // 下一页
    if (kc === 34 || kc === 39 || kc === 40 || kc === 32 || kc === 13 ||
        k === 'PageDown' || k === 'ArrowDown' || k === 'ArrowRight' || k === 'MediaTrackNext') {
      e.preventDefault();
      if (typeof current !== 'undefined' && typeof total !== 'undefined' && current < total - 1 && typeof go === 'function') go(current + 1);
      return;
    }
    // 首页
    if (kc === 36 || k === 'Home') { e.preventDefault(); if (typeof go === 'function') go(0); return; }
    // 末页
    if (kc === 35 || k === 'End') { e.preventDefault(); if (typeof go === 'function' && typeof total !== 'undefined') go(total - 1); return; }
  }

  // ===== HTML5 Media Session API =====
  try {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('previoustrack', function() {
        if (typeof current !== 'undefined' && current > 0 && typeof go === 'function') go(current - 1);
      });
      navigator.mediaSession.setActionHandler('nexttrack', function() {
        if (typeof current !== 'undefined' && typeof total !== 'undefined' && current < total - 1 && typeof go === 'function') go(current + 1);
      });
    }
  } catch(msErr) {}

  // ===== 三层事件绑定 =====
  // DOM0 — 最底层，不被安全策略拦截
  document.onkeydown = nav;
  // keyup — 兼容仅发keyup不发keydown的设备（如部分翻页笔）
  document.onkeyup = function(e) {
    var kc = (e||window.event).keyCode || 0;
    var k = (e||window.event).key || '';
    if ([33,34,37,39,38,40,36,35,8,32,13].indexOf(kc) >= 0 ||
        ['PageUp','PageDown','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Home','End','MediaTrackNext','MediaTrackPrevious'].indexOf(k) >= 0) {
      nav(e || window.event);
    }
  };
  // DOM2 捕获阶段 — 在事件到达目标前拦截
  document.addEventListener('keydown', nav, true);
  window.addEventListener('keydown', nav, false);
  document.addEventListener('keyup', nav, true);
  window.addEventListener('keyup', nav, false);

  // ===== 调试面板：Shift+F12 =====
  window.__presenterDebug = function() {
    var panel = document.getElementById('debug-key-panel');
    if (panel) { panel.remove(); return; }
    panel = document.createElement('div');
    panel.id = 'debug-key-panel';
    panel.innerHTML = '<div style="font-size:11px;font-weight:600;margin-bottom:6px;">Presenter Debug Panel</div>' +
      '<div id="debug-keys" style="font-size:13px;font-family:monospace;min-height:80px;">Waiting for key...</div>' +
      '<div style="margin-top:6px;font-size:10px;color:#888;">Click to close &middot; Shift+F12 to reopen</div>';
    panel.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);z-index:99999;' +
      'background:rgba(0,0,0,0.93);color:#0f0;padding:12px 20px;border-radius:10px;' +
      'border:1px solid rgba(255,255,255,0.15);font-family:monospace;font-size:13px;' +
      'max-width:90vw;min-width:320px;backdrop-filter:blur(12px);text-align:center;' +
      'box-shadow:0 8px 40px rgba(0,0,0,0.6);';
    document.body.appendChild(panel);

    function logKey(ee) {
      var el = document.getElementById('debug-keys');
      if (!el) return;
      el.innerHTML = 'key: ' + (ee.key||'?') + ' | keyCode: ' + (ee.keyCode||0) + ' | which: ' + (ee.which||0) +
        ' | code: ' + (ee.code||'?') + ' | type: ' + ee.type +
        '<br><span style="color:#888;font-size:11px;">target: ' + (ee.target.tagName||'?') + '</span>';
    }
    document.addEventListener('keydown', logKey, true);
    document.addEventListener('keyup', logKey, true);
    window.addEventListener('keydown', logKey, false);
    window.addEventListener('keyup', logKey, false);

    panel.addEventListener('click', function() {
      panel.remove();
      document.removeEventListener('keydown', logKey, true);
      document.removeEventListener('keyup', logKey, true);
      window.removeEventListener('keydown', logKey, false);
      window.removeEventListener('keyup', logKey, false);
    });
  };

  document.addEventListener('keydown', function(ee) {
    if (ee.key === 'F12' && ee.shiftKey) {
      ee.preventDefault();
      window.__presenterDebug();
    }
  });

  // ===== Textarea ESC 失焦 =====
  setTimeout(function() {
    var editors = document.querySelectorAll('textarea');
    [].slice.call(editors).forEach(function(el) {
      el.addEventListener('keydown', function(ee) {
        if (ee.key === 'Escape') {
          ee.preventDefault();
          el.blur();
        }
      });
    });
  }, 200);

  // ===== 点击左右半屏翻页 =====
  document.addEventListener('click', function(e) {
    if (e.target.closest('button, a, .card, textarea, input, select, .shortcut-overlay, .shortcut-panel, #debug-key-panel')) return;
    if (typeof current === 'undefined' || typeof go !== 'function') return;
    if (e.clientX > window.innerWidth / 2) {
      if (typeof total !== 'undefined' && current < total - 1) go(current + 1);
    } else {
      if (current > 0) go(current - 1);
    }
  });

  // ===== 触摸滑动翻页 =====
  var touchX = 0;
  document.addEventListener('touchstart', function(e) { touchX = e.touches[0].clientX; });
  document.addEventListener('touchend', function(e) {
    var diff = touchX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (typeof go !== 'function' || typeof current === 'undefined') return;
      diff > 0 ? go(current + 1) : go(current - 1);
    }
  });
})();
