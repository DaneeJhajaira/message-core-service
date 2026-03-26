export class MessageResponseDto {
  id: number;
  conversationId: number;
  contactId: number;
  messageId: string;
  originalEventId: string | null;
  direction: string;
  messageType: string;
  body: string | null;
  providerName: string | null;
  providerPhoneNumberId: string | null;
  agentId: string | null;
  providerMediaId: string | null;
  mediaAssetId: string | null;
  mediaStatus: string | null;
  mediaUrl: string | null;
  mediaMimeType: string | null;
  mediaStorageBucket: string | null;
  mediaStorageObjectKey: string | null;
  mediaErrorMessage: string | null;
  errorMessage: string | null;
  status: string;
  deliveredAt: Date | null;
  readAt: Date | null;
  messageTimestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}