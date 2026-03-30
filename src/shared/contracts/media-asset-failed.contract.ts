export interface MediaAssetFailedEvent {
  eventId: string;
  eventType: 'media.asset.failed';
  occurredAt: string;

  mediaJob: {
    id: string;
    messageId: string;
    providerMediaId: string;
    status: 'FAILED';
    progress: number;
  };

  media: {
    mediaType: string;
    mimeType: string | null;
    originalFileName: string | null;
  };

  owner: {
    contactWaId: string;
    conversationExternalId: string;
  };

  error: {
    message: string;
  };
}
