## 微博相关接口

### 获取二维码

* url: https://login.sina.com.cn/sso/qrcode/image?entry=weibo&size=180&callback=STK_16110205581241
* response:
  * retcode: 20000000 扫码成功
  * data.qrid: qrid
  * data.image: 二维码地址
  
### 判断是否登陆

* url: https://login.sina.com.cn/sso/qrcode/check?entry=weibo&qrid={{ qrid }}&callback=STK_16110205581243
* response: 
  * retcode: 50114001 正在等待扫码，50114002 扫码后等待确认，20000000 扫码成功
  * msg: 消息
  * data.alt: 扫码成功后返回
  
### 获取cookie和其他相关信息

* url: https://login.sina.com.cn/sso/login.php?entry=weibo&returntype=TEXT&crossdomain=1&cdult=3&domain=weibo.com
  &alt={{ alt }}&savestate=30&callback=STK_161102055812411
* headers: 需要获取响应头里面的cookie
* response: 
  * retcode: 0 成功获取相关信息
  * uid: uid
  * nick: 用户昵称
  * crossDomainUrlList { Array<string> }: 需要依次请求的4个接口
  
### 超话列表接口

超话每页20条

* url: https://weibo.com/ajax/profile/topicContent?tabid=231093_-_chaohua&page={{ page }}
* response:
  * data:
    * total_number: 总数
    * list: 
      * title: 超话名
      * content1 / intro: 超话简介
      * content2: 超话粉丝数
      * link: 地址
      * pic: 头像
      * oid: 1022:oid，需要去掉前面的1022
  * ok: 1

### 超话签到接口

* url: https://weibo.com/p/aj/general/button?api=http://i.huati.weibo.com/aj/super/checkin&id={{ oid }}
* response:
  * code: '100000' 签到成功 382004 已签到 382010 不存在
  * msg: 状态消息
  * data:
    * tipMessage: "今日签到，经验值+4",
    * alert_title: "今日签到 第400名",
    * alert_subtitle: "经验值+4",
    * alert_activity: ""
  
### 获取用户信息接口

* url: https://weibo.com/ajax/profile/info?uid={{ id }}
* response:
  * ok: 1
  * data:
    * user:
      * id
      * idstr
      * screen_name
      * name: 昵称
      * location
      * description
  
### 获取uid接口

* url: https://weibo.com/ajax/side/cards/sideInterested?count=1