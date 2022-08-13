## babel-plugin-delay-require

将指定Node模块延迟加载，用于优化Electron程序的启动性能。   

编译前：

```javascript
import got from 'got';

async function requestAPI() {
  const res = await got.get(uri);
  
  return res.body;
}
```

编译后：

```javascript
let __ELECTRON__DELAY_REQUIRE__got;

async function requestAPI() {
  __ELECTRON__DELAY_REQUIRE__got ??= global.require('got');
  const res = await __ELECTRON__DELAY_REQUIRE__got.default.get(uri);
  
  return res.body;
}
```

### Debug

为了编译查看AST树，可以在浏览器内Debug。   

Debug url: edge://inspect/#devices