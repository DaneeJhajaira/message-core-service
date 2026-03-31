export class ConversationResponseDto {
  id: number;
  contactId: number;
  externalId: string;
  status: string;
  lastMessageAt: Date | null;
  lastMessageId: string | null;
  lastMessagePreview: string | null;
  lastMessageType: string | null;
  lastMessageDirection: string | null;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
}
