import { RenderedTemplate } from './rendered-template.types';

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

  content?: {
    text?: {
      body: string;
    } | null;
    renderedTemplate?: RenderedTemplate | null;
  };

  error: {
    message: string;
  };

  metadata?: {
    conversationId?: string;
    agentId?: string;
  };
}
