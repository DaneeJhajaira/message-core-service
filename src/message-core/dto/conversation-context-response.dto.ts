export class ConversationContextResponseDto {
  externalId: string;
  lastInboundAt: Date | null;
  isWithin24h: boolean;
  windowExpiresAt: Date | null;
  mustUseTemplate: boolean;
}
