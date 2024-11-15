import {Config, Constants, Logger} from "./config.js";
import {Message, Wechaty} from "wechaty";
import {ContactInterface, RoomInterface} from "wechaty/impls";
import {FileBox} from 'file-box';
import pinyin from "pinyin";

import axios from 'axios';

enum MessageType {
  Unknown = 0,
  Attachment = 1, // Attach(6),
  Audio = 2, // Audio(1), Voice(34)
  Contact = 3, // ShareCard(42)
  ChatHistory = 4, // ChatHistory(19)
  Emoticon = 5, // Sticker: Emoticon(15), Emoticon(47)
  Image = 6, // Img(2), Image(3)
  Text = 7, // Text(1)
  Location = 8, // Location(48)
  MiniProgram = 9, // MiniProgram(33)
  GroupNote = 10, // GroupNote(53)
  Transfer = 11, // Transfers(2000)
  RedEnvelope = 12, // RedEnvelopes(2001)
  Recalled = 13, // Recalled(10002)
  Url = 14, // Url(5)
  Video = 15, // Video(4), Video(43)
  Post = 16, // Moment, Channel, Tweet, etc
}

interface RequestBody {
  message: string;
  session_id: string;
  username: string;
}

interface ResponseData {
  result: string;
  message: string[];
  image: string[];
  voice: string[];
}

const getData = async (url: string): Promise<ResponseData> => {
  const response = await axios.get(url);
  return response.data;
}

const postData = async (url: string, requestBody: RequestBody): Promise<string> => {
  const response = await axios.post(url, requestBody);
  return response.data;
};

export class ChatBot {
  // chatbot name (WeChat account name)
  botName: string = "bot";

  // self-chat may cause some issue for some WeChat Account
  // please set to true if self-chat cause some errors
  disableSelfChat: boolean = false;

  // chatbot trigger keyword
  privateChatTrigger: string = Config.privateChatTrigger;
  groupChatTrigger: string = Config.groupChatTrigger;
  groupChatTriggerRegex: RegExp = this.groupChatTrigger ?
      new RegExp(`^(@${this.botName}\\s+)?${this.groupChatTrigger}`):
      new RegExp(`^@${this.botName}`);

  // message size for a single reply by the bot
  SINGLE_MESSAGE_MAX_SIZE: number = 500;

  weChatBot: Wechaty;

  errorResponse = "机器人异常，请稍后再试或联系管理员！";

  constructor(weChatBot: Wechaty) {
    this.weChatBot = weChatBot;
  }

  // set bot name during login stage
  setBotName(botName: string) {
    this.botName = botName;
    this.groupChatTriggerRegex = this.groupChatTrigger ?
        new RegExp(`^(@${this.botName}\\s+)?${this.groupChatTrigger}`):
        new RegExp(`^@${this.botName}`);
  }

  private static constructResponseData(result: string, message: string): ResponseData {
    return {
      result: result,
      message: [message],
      voice: [],
      image: []
    }
  }

  private cleanMessage(rawText: string, isPrivateChat: boolean): string {
    let text = rawText;
    const item = rawText.split("----------");
    if (item.length > 1) {
      text = item[item.length - 1].trim();
    }
    if (isPrivateChat && this.privateChatTrigger){
      return text.slice(this.privateChatTrigger.length).trim();
    }
    if (!isPrivateChat) {
      return text.replace(this.groupChatTriggerRegex, "").trim();
    }
    return text.trim();
  }

  // check whether chat bot can be triggered
  private triggerGPTMessage(
    text: string,
    isPrivateChat: boolean = false
  ): boolean {
    let triggered;
    if (isPrivateChat) {
      triggered = this.privateChatTrigger
        ? text.startsWith(this.privateChatTrigger)
        : true;
    } else {
      triggered = this.groupChatTriggerRegex.test(text);
    }
    if (triggered) {
      Logger.log(`🎯 ChatGPT triggered: ${text}`);
    }
    return triggered;
  }

  // filter out the message that does not need to be processed
  private isNonsense(
    talker: ContactInterface,
    messageType: MessageType,
    text: string
  ): boolean {
    return (
      (this.disableSelfChat && talker.self()) ||
      messageType != MessageType.Text ||
      talker.name() == "微信团队" ||
      // video or voice reminder
      text.includes("收到一条视频/语音聊天消息，请在手机上查看") ||
      // red pocket reminder
      text.includes("收到红包，请在手机上查看") ||
      // location information
      text.includes("/cgi-bin/mmwebwx-bin/webwxgetpubliclinkimg")
    );
  }

  private async onChat(text: string, sessionId: string, username: string, replyCallback: (responseData: ResponseData) => Promise<void>) {
    text = text.trim();
    sessionId = sessionId.replace(/[^a-zA-Z0-9-]/g, '');
    await this.ask(sessionId, username, text, replyCallback);
  }

  private askResponse(requestId: string, replyCallback: (responseData: ResponseData) => Promise<void>, intervalId: number) {
    const askUrl = `${Config.chatbotProxy}/v2/chat/response?request_id=${requestId}`;
    Logger.log(`🎯 Wait response: ${askUrl}`);
    getData(askUrl)
        .then((responseData: ResponseData) => {
          Logger.log(`🎯 Got response data data length ${JSON.stringify(responseData).length} -> ${JSON.stringify(responseData).substr(0, 100)}`)
          if (responseData.result === Constants.responseStatus.done || responseData.result === Constants.responseStatus.failed) {
            clearInterval(intervalId);
            if (responseData.result === Constants.responseStatus.failed) {
              return;
            }
          }
          replyCallback(responseData);
        }).catch((error) => {
          replyCallback(ChatBot.constructResponseData(Constants.responseStatus.failed, this.errorResponse));
          Logger.error(error);
        });
  }

  private async ask(sessionId: string, username: string, text: string, replyCallback: (responseData: ResponseData) => Promise<void>) {
    const askUrl = `${Config.chatbotProxy}/v2/chat`;
    const requestBody: RequestBody = {
      message: text,
      session_id: sessionId,
      username: username,
    };
    const chatbot = this;
    Logger.log(`🎯 Chatbot triggered: ${askUrl}`);
    await postData(askUrl, requestBody)
        .then((requestId: string) => {
          Logger.log(`🎯 Got request id: ${requestId}`)
          let intervalCnt = 0;
          const intervalId = setInterval(
              async function () {
                // @ts-ignore
                await chatbot.askResponse(requestId, replyCallback, intervalId)
                if (++intervalCnt >= 60){
                  clearInterval(intervalId);
                  replyCallback(ChatBot.constructResponseData(Constants.responseStatus.failed, "响应超时，请重新尝试！"));
                }
              }, 2000);
        }).catch((error) => {
          replyCallback(ChatBot.constructResponseData(Constants.responseStatus.failed, this.errorResponse));
          Logger.error(error);
        });
  }

  private async replyText(
      talker: RoomInterface | ContactInterface,
      mesasge: string
  ): Promise<void> {
    const messages: Array<string> = [];
    Logger.log(`Reply text -> ${mesasge.substr(0, 50)}`);
    let message = mesasge;
    while (message.length > this.SINGLE_MESSAGE_MAX_SIZE) {
      messages.push(message.slice(0, this.SINGLE_MESSAGE_MAX_SIZE));
      message = message.slice(this.SINGLE_MESSAGE_MAX_SIZE);
    }
    messages.push(message);
    for (const msg of messages) {
      await talker.say(msg);
    }
  }

  private async replyVoice(
      talker: RoomInterface | ContactInterface,
      voice: string
  ): Promise<void> {
    const voiceType = this.getFirstMatchTextFromRegex(voice, Constants.voiceTypeReg);
    if (voiceType === "mpeg") {
      Logger.log(`Reply voice.mp3 -> ${voice.substr(0, 50)}`);
      const tmpName = await this.generateTmpName(talker) + ".mp3";
      await talker.say(FileBox.fromDataURL(voice, tmpName));
    }
  }

  private async replyImage(
      talker: RoomInterface | ContactInterface,
      image: string
  ): Promise<void> {
    const imageType = this.getFirstMatchTextFromRegex(image, Constants.imageTypeReg);
    if (imageType) {
      Logger.log(`Reply image.${imageType} -> ${image.substr(0, 50)}`);
      const tmpName = await this.generateTmpName(talker) + `.${imageType}`;
      await talker.say(FileBox.fromDataURL(image, tmpName));
    }
  }

  private async reply(talker: ContactInterface|RoomInterface, prompt: string, responseData: ResponseData) {
    if (responseData.message && responseData.message.length > 0) {
      for (let m of responseData.message) {
        if (Config.responseQuote && "topic" in talker) {
          m = `${prompt}\n----------\n${m}`;
        }
        await this.replyText(talker, m);
      }
    }
    if (responseData.voice && responseData.voice.length > 0) {
      for (const v of responseData.voice) {
        await this.replyVoice(talker, v);
      }
    }
    if (responseData.image && responseData.image.length > 0) {
      for (const i of responseData.image) {
        await this.replyImage(talker, i);
      }
    }
  }

  private triggerActions(talker: ContactInterface, text: string) {
    if (text !== Config.checkOnlineTrigger) {
      return false;
    }
    setInterval(async () => {
      await this.onPrivateMessage(talker, Config.checkOnlineCommand);
    }, Config.checkOnlineInterval);
    return true;
  }

  // reply to private message
  private async onPrivateMessage(talker: ContactInterface, text: string) {
    const sessionId = pinyin(talker.name(), {style: pinyin.STYLE_TONE2}).join("");
    const chatbot = this;
    if (this.triggerActions(talker, text)) {
      text = Config.checkOnlineCommand;
    }
    await this.onChat(text, `friend-${sessionId}`, sessionId,
        async function (responseData: ResponseData) {
      await chatbot.reply(talker, text, responseData);
    });
  }

  // reply to group message
  private async onGroupMessage(talker: ContactInterface, room: RoomInterface, text: string) {
    const sessionId = pinyin(await room.topic(), {style: pinyin.STYLE_TONE2}).join("");
    const username = pinyin(talker.name(), {style: pinyin.STYLE_TONE2}).join("");
    const chatbot = this;
    // get reply from chat bot
    await this.onChat(text, `group-${sessionId}`, username,
        async function (responseData: ResponseData) {
          await chatbot.reply(room, text, responseData);
        });
  }

  private getFirstMatchTextFromRegex(text: string, regex: RegExp): string {
    const results = Array.from(text.matchAll(regex), (match) => match[1]);
    if (results.length == 0) {
      return "";
    }
    return results[0];
  }

  // receive a message (main entry)
  async onMessage(message: Message) {
    const talker = message.talker();
    const rawText = message.text();
    const room = message.room();
    const messageType = message.type();
    const isPrivateChat = !room;
    Logger.log(`收到${isPrivateChat ? "" : room.topic()} > ${talker.name()}(${talker.id})的消息`)
    if (
      this.isNonsense(talker, messageType, rawText) ||
      !this.triggerGPTMessage(rawText, isPrivateChat)
    ) {
      return;
    }
    const text = this.cleanMessage(rawText, isPrivateChat);
    if (isPrivateChat) {
      return await this.onPrivateMessage(talker, text);
    } else {
      // @ts-ignore
      return await this.onGroupMessage(talker, room, text);
    }
  }

  private async generateTmpName(talker: RoomInterface | ContactInterface) {
    let tmpName = "";
    if ("topic" in talker) {
      tmpName = await talker.topic();
    } else {
      tmpName = talker.name();
    }
    tmpName = pinyin(tmpName, {style: pinyin.STYLE_FIRST_LETTER}).join("");
    const now = new Date();
    const hour = now.getHours().toString().padStart(2, "0");
    const minute = now.getMinutes().toString().padStart(2, "0");
    const second = now.getSeconds().toString().padStart(2, "0");
    tmpName += `-${hour}${minute}${second}`;
    return tmpName;
  }
}

