import { expect } from 'chai';
import ElectronApp from './utils/ElectronApp.js';

/* 口袋48录播下载测试 */
describe('48/Pocket48Record Page', function() {
  let app;

  before(async function() {
    app = new ElectronApp();
    await app.init();
    await app.win.waitForSelector('nav .ant-btn', { state: 'attached' });
    await app.win.evaluate(function() {
      const navBtns = document.querySelectorAll('nav .ant-btn');

      navBtns[1].click();
    });
  });

  after(async function() {
    await app.close();
  });

  // 测试能够正常加载数据
  it('Should get pocket48 record data', async function() {
    await app.win.waitForSelector('.ant-table-wrapper', { state: 'attached' });
    await app.win.evaluate(function() {
      const navBtns = document.querySelectorAll('.ant-btn');

      navBtns[2].click();
    });
    await app.win.waitForSelector('.ant-table-row', { state: 'attached' });

    const antTableRowsLength = await app.win.evaluate(function() {
      const antTableRows = document.querySelectorAll('.ant-table-row');

      return antTableRows.length;
    });

    expect(antTableRowsLength).to.be.equal(10);
  });
});