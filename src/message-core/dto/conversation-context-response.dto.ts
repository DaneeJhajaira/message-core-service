export class ConversationContextResponseDto {
  externalId: string;
  lastInboundAt: Date | null;
  lastTemplateSentAt: Date | null;
  isWithin24h: boolean;
  windowExpiresAt: Date | null;
  mustUseTemplate: boolean;
}
