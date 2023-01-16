export enum ChatParticipantType {
  USER = "USER",
  BOT = "BOT"
}

export enum MessageType {
  TEXT_MESSAGE = "TEXT_MESSAGE",
  SINGLE_SELECT = "SINGLE_SELECT",
  MULTI_SELECT = "MULTI_SELECT",
  MULTI_DROPDOWN = "MULTI_DROPDOWN",
  FEEDBACK = "FEEDBACK",
  EDUCATIONAL_CONTENT = "EDUCATIONAL_CONTENT",
  PROVIDER_PROMPT = "PROVIDER_PROMPT"
}

export interface DirectlineContext {
  token: string;
  botContext: string;
}

export interface ChatParticipant {
  id: string;
  name: string;
  avatar: string;
  type: ChatParticipantType;
}

export interface Message {
  from: ChatParticipant;
  to: ChatParticipant;
  type: MessageType;
  attachment: any;
}

export default interface Chat {
  isBot: boolean;
  directlineContext: DirectlineContext;
  conversationContext: string;
  chatMessages: Message[];
}
