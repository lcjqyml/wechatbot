export interface IConfig {
  chatbotProxy: string,
  autoAcceptFriendShip: boolean,
  autoAcceptRoomInvite: boolean,
  privateChatTrigger: string,
  groupChatTrigger: string,
  responseQuote: boolean,
  checkOnlineTrigger: string,
  checkOnlineCommand: string,
  checkOnlineInterval: number,
}
