export class MessageTemplateHeaderDto {
  type: string;
  text?: string;
  mediaId?: string;
  mediaUrl?: string;
  location?: Record<string, any>;
}

export class MessageTemplateButtonDto {
  type: string;
  text: string;
  url?: string;
  phoneNumber?: string;
}

export class MessageTemplateDto {
  name: string;
  language: string;
  header?: MessageTemplateHeaderDto | null;
  body: string;
  footer?: string | null;
  buttons?: MessageTemplateButtonDto[] | null;
}

export class MessageContentDto {
  type: string;
  body: string | null;
  template?: MessageTemplateDto | null;
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
