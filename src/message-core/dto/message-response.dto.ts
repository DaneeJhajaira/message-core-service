export class MessageContentDto {
  type: string;
  body: string | null;
}

export class MessageMediaDto {
  assetId: string | null;
  status: string | null;
  mimeType: string | null;
}

export class MessageErrorDto {
  message: string;
}

export class MessageResponseDto {
  id: number;
  messageId: string;
  direction: 'inbound' | 'outbound';
  status: string;
  timestamp: Date;
  content: MessageContentDto;
  media: MessageMediaDto | null;
  error: MessageErrorDto | null;
}
