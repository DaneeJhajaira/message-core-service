import { RenderedTemplate } from './rendered-template.types';

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

  content?: {
    text?: {
      body: string;
    } | null;
    renderedTemplate?: RenderedTemplate | null;
  };

  metadata?: {
    conversationId?: string;
    agentId?: string;
  };
}
