# Presenter Control

翻页笔/键盘/触摸 全兼容翻页控制器，适用于 HTML 幻灯片/教学演示场景。

## 特性

- **三层事件绑定**：DOM0 + DOM2 capture + DOM2 bubble，兼容各类翻页笔设备
- **时间戳防抖**（200ms）：避免多监听器重复触发导致的跳页
- **全按键支持**：ArrowUp/ArrowDown/ArrowLeft/ArrowRight/PageUp/PageDown/Space/Enter/Home/End/Backspace
- **HTML5 Media Session API**：支持媒体按键翻页笔
- **触摸滑动翻页**：>50px 滑动触发
- **点击左右半屏翻页**
- **快捷键面板**：按 `?` 键显示
- **调试面板**：`Shift+F12` 打开，实时显示按键事件详情
- **Textarea ESC 失焦**：在代码编辑器中按 ESC 退出编辑状态

## 使用方式

### 1. 引入脚本

```html
<script src="presenter-control.js"></script>
```

### 2. 定义全局变量和函数

```js
var current = 0;    // 当前页码（从0开始）
var total = 8;      // 总页数

function go(index) {
  // 切换到第 index 页
  // 实现你的翻页逻辑
}
```

### 3. 可选：快捷键面板

```html
<div id="shortcutOverlay" class="shortcut-overlay">
  <div class="shortcut-panel">
    <h2>Keyboard Shortcuts</h2>
    <div><span>Next</span><span>→ / Space / Enter / PageDown</span></div>
    <div><span>Prev</span><span>← / Backspace / PageUp</span></div>
    <div><span>Home</span><span>Home</span></div>
    <div><span>End</span><span>End</span></div>
  </div>
</div>
```

### 4. 调试面板

按 `Shift+F12` 打开调试面板，实时显示按键事件详情（key/keyCode/code/type/target），用于诊断翻页笔兼容性问题。

## 兼容性

| 设备类型 | 事件类型 | 支持情况 |
|---------|---------|---------|
| 普通键盘 | keydown | 完全支持 |
| 翻页笔（发keydown） | keydown | 完全支持 |
| 翻页笔（仅发keyup） | keyup | 支持（DOM0 + DOM2 keyup） |
| 翻页笔（媒体按键） | Media Session | 支持 |
| 触摸屏 | touch | 支持 |
| 鼠标点击 | click | 支持 |

## 调试技巧

如果翻页笔不工作，按 `Shift+F12` 打开调试面板，按下翻页笔按键，观察显示的 key/keyCode/code 值，确认设备发送的事件类型和键值，然后在 `nav()` 函数中添加对应的按键映射。

## License

MIT
