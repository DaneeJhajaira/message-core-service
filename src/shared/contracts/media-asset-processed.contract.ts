export interface MediaAssetProcessedEvent {
  eventId: string;
  eventType: 'media.asset.processed';
  occurredAt: string;

  mediaJob: {
    id: string;
    messageId: string;
    providerMediaId: string;
    status: 'STORED';
    progress: 100;
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

  storage: {
    bucket: string;
    objectKey: string;
    publicUrl: string;
  };

  processedAt: string;
}
