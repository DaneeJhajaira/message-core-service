export interface WhatsappMessageSentEvent {
  eventId: string;
  eventType: 'whatsapp.message.sent';
  occurredAt: string;

  originalEventId: string;

  recipient: {
    waId: string;
  };

  provider: {
    name: 'meta';
    phoneNumberId: string;
    wamid: string;
  };

  message: {
    type: string;
    status: 'sent';
  };

  metadata?: {
    conversationId?: string;
    agentId?: string;
  };
}