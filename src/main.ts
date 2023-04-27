import QRCode from "qrcode";
import { WechatyBuilder } from "wechaty";
import { ChatBot } from "./chatbot.js";
import {Config, Logger} from "./config.js";

// Wechaty instance
const weChatBot = WechatyBuilder.build({
  name: "my-wechat-bot",
});
// chat bot instance
const chatBot = new ChatBot(weChatBot);
const launchTime = new Date().getTime();
const READY_TIME = 15 * 1000;

async function main() {
  weChatBot
    // scan QR code for login
    .on("scan", async (qrcode, status) => {
      const url = `https://wechaty.js.org/qrcode/${encodeURIComponent(qrcode)}`;
      Logger.log(`💡 Scan QR Code to login: ${status}\n${url}`);
      Logger.log(
        await QRCode.toString(qrcode, { type: "terminal", small: true })
      );
    })
    // login to WeChat desktop account
    .on("login", async (user: any) => {
      chatBot.setBotName(user.name());
      Logger.log(`✅ User ${user} has logged in`);
    })
    // message handler
    .on("message", async (message: any) => {
      try {
        const currentTime = new Date().getTime();
        if (currentTime - launchTime <= READY_TIME) {
          Logger.log(`📨 Skip message --> ${message}`);
          return;
        }
        Logger.log(`📨 ${message}`);
        // handle message for chatGPT bot
        await chatBot.onMessage(message);
      } catch (e) {
        Logger.error(`❌ ${(e as Error).stack}`);
      }
    }).on('friendship', async (friendship) => {
      const currentTime = new Date().getTime();
      if (currentTime - launchTime <= READY_TIME) {
        Logger.log(`📨 Skip friendship --> ${friendship.contact().name()}`);
        return;
      }
      if (friendship.type() === weChatBot.Friendship.Type.Receive && Config.autoAcceptFriendShip) {
        await friendship.accept();
        Logger.log(`Accepted friend request from ${friendship.contact().name()} automatically.`);
      }
      if (friendship.type() === weChatBot.Friendship.Type.Confirm) {
        Logger.log(`Confirmed friend request from ${friendship.contact().name()}.`);
      }
    }).on('room-invite', async (roomInvitation) => {
      const inviter = await roomInvitation.inviter();
      const currentTime = new Date().getTime();
      if (currentTime - launchTime <= READY_TIME) {
        Logger.log(`📨 Skip room invite --> ${inviter} -- ${roomInvitation.topic()}`);
        return;
      }
      if (Config.autoAcceptRoomInvite) {
        await roomInvitation.accept();
        Logger.log(`Accepted room invitation from ${inviter} in room ${roomInvitation.topic()}`);
      }
    });

  try {
    await weChatBot.start();
  } catch (e) {
    Logger.error(`❌ Your Bot failed to start: ${(e as Error).stack}`);
    Logger.log(
      "🤔 Can you login WeChat in browser? The bot works on the desktop WeChat"
    );
  }
}
main();
