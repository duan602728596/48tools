/* node的require方法，避免和webpack的require方法发生冲突 */
const node_require = require;

/* 打开窗口全屏 */
const gui = node_require('nw.gui');
const win = gui.Window.get();
win.maximize();