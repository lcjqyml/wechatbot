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
| responseQuote  | RESPONSE_QUOTE   | 群聊中回复时是否引用触发的消息   | NO   | false | 

### lss233/chatgpt-mirai-qq-bot 项目配置说明
本项目与lss233项目部署在同一服务器时：
<details>

* 为config.cfg增加以下配置：
    ```toml
    [http]
    host = "0.0.0.0"
    port = 8080
    debug = false
    ```
* cd至docker-compose.yaml目录，重启服务：
    ```bash
    docker-compose restart
    ```
* 查看日志，出现以下日志则表示http服务配置成功：
    ```bash
    docker-compose logs -f
    ```
    ```
    ......
    ... Running on http://0.0.0.0:8080 (CTRL + C to quit)
    ......
    ```
</details>

本项目与lss233项目部署在不同服务器时：
<details>
关键需要开放lss233服务的端口访问，以运行在云服务器为例：

* 为config.cfg增加以下配置：
  ```toml
  [http]
  host = "0.0.0.0"
  port = 8080
  debug = false
  ```
* cd至docker-compose.yaml目录，为docker-compose.yaml增加以下配置：
  ```yaml
  version: '3.4'
  services:
    ...
    chatgpt:
      image: lss233/chatgpt-mirai-qq-bot:browser-version
      ports:
        - "8080:8080"  # 关键是增加这个
      ...
  ```
* 重启服务docker-compose服务。
* 进入云服务商控制台，编辑安全组规则，入站规则增加8080端口。然后可以通过以下命令确认是否配置成功：
  ```bash
  # <server-ip>需要替换为部署机器人bot的服务器IP
  curl -i http://<server-ip>:8080/v1/chat -H 'Content-Type: application/json' -d '{"message":"ping"}'
  ```

</details>

## 运行说明

快速启动：
```bash
docker run -e CHATBOT_PROXY="<your-proxy>" lcjqyml/wechatbot:latest
```
* `<your-proxy>` 需要替换为你自己搭建的http服务，例如：
    ```bash
    docker run -e CHATBOT_PROXY="http://127.0.0.1:8080" lcjqyml/wechatbot:latest
    ```
或者：
```bash
# <path-to-config> 需要替换为配置所在的实际路径
docker run -v /<path-to-config>/config.yaml:/app/config.yaml lcjqyml/wechatbot:latest
```
* 配置文件参考`config.yaml.example`

本项目与lss233项目部署在同一服务器时，执行以下命令：

```bash
docker run -e CHATBOT_PROXY="http://chatgpt-qq-chatgpt-1:8080" --network chatgpt-qq_default lcjqyml/wechatbot:latest
```
_PS: 以上chatgpt-qq-chatgpt-1, chatgpt-qq_default由docker-compose启动lss233项目时默认创建。_

启动后扫码登陆即可：
* 扫码的微信号需要进过实名认证，否则会异常。
* 尽量避免国外登陆或者异地登陆，防止封号。
* 若二维码不清晰，可将二维码上方的链接copy至浏览器打开扫码。

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
