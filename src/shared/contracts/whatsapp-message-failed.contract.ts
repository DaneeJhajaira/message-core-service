export interface WhatsappMessageFailedEvent {
  eventId: string;
  eventType: 'whatsapp.message.failed';
  occurredAt: string;

  originalEventId: string;

  recipient: {
    waId: string;
  };

  message: {
    type: string;
    status: 'failed';
  };

  error: {
    message: string;
  };

  metadata?: {
    conversationId?: string;
    agentId?: string;
  };
}