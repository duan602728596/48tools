/* node模块 */
const node_require = require;

/* 全屏 */
const gui = node_require('nw.gui');
const win = gui.Window.get();
win.maximize();