export interface ChatMessageUpdatedEvent {
  eventId: string;
  eventType: 'chat.message.updated';
  occurredAt: string;

  conversation: {
    externalId: string;
    unreadCount: number;
  };

  message: {
    messageId: string;
    direction: string;
    type: string;
    status: string;
    body: string | null;
    mediaAssetId?: string | null;
    mediaStatus?: string | null;
    mediaUrl?: string | null;
    mediaErrorMessage?: string | null;
    deliveredAt?: string | null;
    readAt?: string | null;
    errorMessage?: string | null;
    timestamp: string;
  };

  contact: {
    waId: string;
  };

  metadata?: {
    agentId?: string | null;
  };
}
