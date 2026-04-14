import { RenderedTemplate } from './rendered-template.types';

export interface ChatMessageCreatedEvent {
  eventId: string;
  eventType: 'chat.message.created';
  occurredAt: string;

  conversation: {
    externalId: string;
    unreadCount: number;
  };

  message: {
    messageId: string;
    direction: string;
    type: string;
    body: string | null;
    status: string;
    timestamp: string;
    mediaAssetId?: string | null;
    template?: RenderedTemplate | null;
  };

  contact: {
    waId: string;
  };

  metadata?: {
    agentId?: string | null;
  };
}
