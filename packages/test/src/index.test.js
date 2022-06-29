import { expect } from 'chai';
import ElectronApp from './utils/ElectronApp.js';

/* 客户端主界面入口测试 */
describe('Index Page', function() {
  let app;

  before(async function() {
    app = new ElectronApp();
    await app.init();
  });

  after(async function() {
    await app.close();
  });

  // 测试导航的正常显示
  it('Should display 4 navs', async function() {
    await app.win.waitForSelector('nav', { state: 'attached' });

    const imageLength = await app.win.evaluate(function() {
      const navs = document.querySelectorAll('nav');

      return navs.length;
    });

    expect(imageLength).to.be.equal(4);
  });

  // 测试二维码图片的正常显示
  it('Should display 2 images', async function() {
    await app.win.waitForSelector('.ant-image', { state: 'attached' });

    const imageLength = await app.win.evaluate(function() {
      const antImages = document.querySelectorAll('.ant-image');

      return antImages.length;
    });

    expect(imageLength).to.be.equal(2);
  });
});