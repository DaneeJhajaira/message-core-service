export interface ChatMessageCreatedEvent {
  eventId: string;
  eventType: 'chat.message.created';
  occurredAt: string;

  conversation: {
    externalId: string;
  };

  message: {
    messageId: string;
    direction: string;
    type: string;
    body: string | null;
    status: string;
    timestamp: string;
    mediaAssetId?: string | null;
  };

  contact: {
    waId: string;
  };

  metadata?: {
    agentId?: string | null;
  };
}
