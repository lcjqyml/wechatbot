<p align="center">
  <h2 align="center">WeChat Bot</h2>
  <p align="center">
    一款基于Wechaty的聊天机器人！
    <br/>
  </p>
</p>

<p align="center">
  <a href="https://github.com/lcjqyml/wechatbot/stargazers"><img src="https://img.shields.io/github/stars/lcjqyml/wechatbot?color=E2CDBC&amp;logo=github&amp;style=for-the-badge" alt="Github stars"></a>
  <a href="https://github.com/lcjqyml/wechatbot/actions/workflows/docker-latest.yml"><img src="https://img.shields.io/github/actions/workflow/status/lcjqyml/wechatbot/docker-latest.yml?color=E2CDBC&amp;logo=docker&amp;logoColor=white&amp;style=for-the-badge" alt="Docker build latest"></a>
  <a href="https://hub.docker.com/r/lcjqyml/wechatbot/"><img src="https://img.shields.io/docker/pulls/lcjqyml/wechatbot?color=E2CDBC&amp;logo=docker&amp;logoColor=white&amp;style=for-the-badge" alt="Docker Pulls"></a>
  <a href="./LICENSE"><img src="https://img.shields.io/github/license/lcjqyml/wechatbot?&amp;color=E2CDBC&amp;style=for-the-badge" alt="License"></a>
</p>

## 配置说明

可以通过`config.yaml`或者环境变量进行配置：

| config.yaml | env | 说明 | 必须 | 默认 |
|----------|------|------|------|------|
| chatbotProxy    | CHATBOT_PROXY   | chatbot请求地址，参考[lss233/chatgpt-mirai-qq-bot][1]   | YES   |   |
| autoAcceptFriendShip   | AUTO_ACCEPT_FRIEND_SHIP   | 自动通过好友请求 | NO   | false   | 
| autoAcceptRoomInvite | AUTO_ACCEPT_ROOM_INVITE   | 自动通过群聊邀请   | NO   | false | 
| chatbotTriggerKeyword  | CHATBOT_TRIGGER_KEYWORD   | 机器人聊天触发器，默认@触发   | NO   | "" | 
| responseQuote  | RESPONSE_QUOTE   | 群聊中回复时是否引用触发的消息   | NO   | yes | 

## 运行说明

执行以下命令启动：
```bash
docker run -e CHATBOT_PROXY="<your-proxy>" lcjqyml/wechatbot:latest
```
* `<your-proxy>` 需要替换为你自己搭建的http服务，例如：
```bash
docker run -e CHATBOT_PROXY="http://127.0.0.1:8080" lcjqyml/wechatbot:latest
```

扫码登陆即可。
PS：
* 扫码的微信号需要进过实名认证，否则会异常。
* 尽量避免国外登陆或者异地登陆，防止封号。

## 关联项目
* [lss233/chatgpt-mirai-qq-bot][1] - （本项目需要配合此项目的http service使用）多平台、多AI引擎的AIGC整合项目。
* [kx-Huang/ChatGPT-on-WeChat](https://github.com/kx-Huang/ChatGPT-on-WeChat) - 访问ChatGPT的微信聊天机器人


## 贡献者名单

欢迎提出新的点子、 Pull Request。  

<a href="https://github.com/lcjqyml/wechatbot/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=lcjqyml/wechatbot"  alt=""/>
</a>
Made with [contrib.rocks](https://contrib.rocks).

## 支持我们

如果这个项目对你有所帮助，请给我们一颗星。

<p align="center">
  <a href="https://github.com/lcjqyml/wechatbot/stargazers">
    <img src="https://reporoster.com/stars/dark/lcjqyml/wechatbot" alt="Stargazers repo roster for @lcjqyml/wechatbot" />
  </a>
  <a href="https://github.com/lcjqyml/wechatbot/stargazers">
    <img src="https://api.star-history.com/svg?repos=lcjqyml/wechatbot&type=Date" alt="Star history chart for @lcjqyml/wechatbot"/>
  </a>
</p>

[1]: https://github.com/lss233/chatgpt-mirai-qq-bot
