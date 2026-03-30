export type OutboundMessageType =
  | 'text'
  | 'image'
  | 'video'
  | 'audio'
  | 'document'
  | 'template';

export interface WhatsappMessageSendEvent {
  eventId: string;
  eventType: 'whatsapp.message.send';
  occurredAt: string;

  channel: 'whatsapp';
  provider: 'meta';

  recipient: {
    waId: string;
    phone?: string;
  };

  message: {
    type: OutboundMessageType;
  };

  content: {
    text?: {
      body: string;
    } | null;

    media?: {
      mediaAssetId: string;
      caption?: string | null;
    } | null;
  };

  metadata?: {
    conversationId?: string;
    agentId?: string;
  };
}
