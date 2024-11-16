import * as dotenv from "dotenv";
dotenv.config();
import fs from "fs";
import { parse } from "yaml";
import { IConfig } from "./interface";

export const Logger = {
  log: function (...args: any[]) {
    console.log(`[${new Date().toLocaleString()}]`, ...args);
  },
  error: function (...args: any[]) {
    console.error(`[${new Date().toLocaleString()}]`, ...args);
  },
}

let configFile: any = {};

// get configurations from 'config.yaml' first
if (fs.existsSync("./config.yaml")) {
  const file = fs.readFileSync("./config.yaml", "utf8");
  configFile = parse(file);
}
// if 'config.yaml' not exist, read them from env
else {
  configFile = {
    chatbotProxy: process.env.CHATBOT_PROXY,
    autoAcceptFriendShip: process.env.AUTO_ACCEPT_FRIEND_SHIP,
    autoAcceptRoomInvite: process.env.AUTO_ACCEPT_ROOM_INVITE,
    privateChatTrigger: process.env.PRIVATE_CHAT_TRIGGER,
    groupChatTrigger: process.env.GROUP_CHAT_TRIGGER,
    responseQuote: process.env.RESPONSE_QUOTE,
    checkOnlineTrigger: process.env.CHECK_ONLINE_TRIGGER,
    checkOnlineCommand: process.env.CHECK_ONLINE_COMMAND,
    checkOnlineInterval: process.env.CHECK_ONLINE_INTERVAL,
  };
}

// warning if no OpenAI API key found
if (configFile.chatbotProxy === undefined) {
  Logger.error(
    "⚠️ No CHATGPT_PROXY found in env, please export to env or configure in config.yaml"
  );
}

export const Config: IConfig = {
  chatbotProxy: configFile.chatbotProxy || "",
  autoAcceptFriendShip: configFile.autoAcceptFriendShip == "true",
  autoAcceptRoomInvite: configFile.autoAcceptRoomInvite == "true",
  privateChatTrigger: configFile.privateChatTrigger || "",
  groupChatTrigger:  configFile.groupChatTrigger || "",
  responseQuote: configFile.responseQuote == "true",
  checkOnlineTrigger: configFile.checkOnlineTrigger || "__check__",
  checkOnlineCommand: configFile.checkOnlineCommand || "ping",
  checkOnlineInterval: configFile.checkOnlineInterval || 60 * 60 * 1000,
};

Logger.log("Config ->")
Object.entries(Config).forEach(([key, value]) => {
  Logger.log(`${key}: ${value}`);
});

export const Constants = {
  imageTypeReg: /data:image\/(\w+);base64,/g,
  voiceTypeReg: /data:audio\/(\w+);base64,/g,
  responseStatus: {
    success: "SUCESS",
    failed: "FAILED",
    done: "DONE"
  }
}
