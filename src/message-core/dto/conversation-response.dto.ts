export class ConversationResponseDto {
  id: number;
  contactId: number;
  externalId: string;
  status: string;
  lastMessageAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}