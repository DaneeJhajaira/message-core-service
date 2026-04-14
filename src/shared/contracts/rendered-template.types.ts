export interface RenderedTemplateHeader {
  type: 'text' | 'image' | 'video' | 'document' | 'location';
  text?: string;
  mediaId?: string;
  mediaUrl?: string;
  location?: {
    latitude: string;
    longitude: string;
    name?: string;
    address?: string;
  };
}

export interface RenderedTemplateButton {
  type: string;
  text: string;
  url?: string;
  phoneNumber?: string;
}

export interface RenderedTemplate {
  name: string;
  language: string;
  header?: RenderedTemplateHeader | null;
  body: string;
  footer?: string | null;
  buttons?: RenderedTemplateButton[] | null;
}
