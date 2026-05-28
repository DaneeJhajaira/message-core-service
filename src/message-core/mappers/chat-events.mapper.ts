import { randomUUID } from 'crypto';
import { ContactOrmEntity } from '../../infrastructure/persistence/postgres/entities/contact.orm-entity';
import { ConversationOrmEntity } from '../../infrastructure/persistence/postgres/entities/conversation.orm-entity';
import { MessageOrmEntity } from '../../infrastructure/persistence/postgres/entities/message.orm-entity';
import { MessageTemplateOrmEntity } from '../../infrastructure/persistence/postgres/entities/message-template.orm-entity';
import { ChatMessageCreatedEvent } from '../../shared/contracts/chat-message-created.contract';
import { ChatMessageUpdatedEvent } from '../../shared/contracts/chat-message-updated.contract';
import {
  RenderedTemplate,
  RenderedTemplateButton,
  RenderedTemplateHeader,
} from '../../shared/contracts/rendered-template.types';
import {
  isInteractiveReplyMessageType,
  resolveInboundMessageBody,
} from '../../shared/utils/resolve-message-body.util';

function toRenderedTemplate(
  tpl: MessageTemplateOrmEntity | null | undefined,
): RenderedTemplate | null {
  if (!tpl) return null;

  let header: RenderedTemplateHeader | null = null;
  if (tpl.headerType) {
    header = {
      type: tpl.headerType as RenderedTemplateHeader['type'],
      text: tpl.headerText ?? undefined,
      mediaId: tpl.headerMediaId ?? undefined,
      mediaUrl: tpl.headerMediaUrl ?? undefined,
      location: (tpl.headerLocation as RenderedTemplateHeader['location']) ?? undefined,
    };
  }

  return {
    name: tpl.name,
    language: tpl.language,
    header,
    body: tpl.body,
    footer: tpl.footer ?? null,
    buttons: (tpl.buttons as RenderedTemplateButton[]) ?? null,
  };
}

export function toChatMessageCreatedEvent(params: {
  conversation: ConversationOrmEntity;
  contact: ContactOrmEntity;
  message: MessageOrmEntity;
}): ChatMessageCreatedEvent {
  const { conversation, contact, message } = params;
  const resolvedBody = resolveInboundMessageBody(
    message.messageType,
    message.body,
    message.rawPayload,
  );

  return {
    eventId: randomUUID(),
    eventType: 'chat.message.created',
    occurredAt: new Date().toISOString(),
    conversation: {
      externalId: conversation.externalId,
      unreadCount: conversation.unreadCount ?? 0,
    },
    message: {
      messageId: message.messageId,
      direction: message.direction,
      type: message.messageType,
      body: resolvedBody,
      ...(isInteractiveReplyMessageType(message.messageType)
        ? { rawPayload: message.rawPayload }
        : {}),
      status: message.status,
      timestamp: message.messageTimestamp.toISOString(),
      mediaAssetId: message.mediaAssetId ?? null,
      template: toRenderedTemplate(message.messageTemplate),
    },
    contact: {
      waId: contact.waId,
    },
    metadata: {
      agentId: message.agentId ?? null,
    },
  };
}

export function toChatMessageUpdatedEvent(params: {
  conversation: ConversationOrmEntity;
  contact: ContactOrmEntity;
  message: MessageOrmEntity;
}): ChatMessageUpdatedEvent {
  const { conversation, contact, message } = params;
  const resolvedBody = resolveInboundMessageBody(
    message.messageType,
    message.body,
    message.rawPayload,
  );

  return {
    eventId: randomUUID(),
    eventType: 'chat.message.updated',
    occurredAt: new Date().toISOString(),
    conversation: {
      externalId: conversation.externalId,
      unreadCount: conversation.unreadCount ?? 0,
    },
    message: {
      messageId: message.messageId,
      direction: message.direction,
      type: message.messageType,
      status: message.status,
      body: resolvedBody,
      ...(isInteractiveReplyMessageType(message.messageType)
        ? { rawPayload: message.rawPayload }
        : {}),
      mediaAssetId: message.mediaAssetId ?? null,
      mediaStatus: message.mediaStatus ?? null,
      mediaUrl: message.mediaUrl ?? null,
      mediaErrorMessage: message.mediaErrorMessage ?? null,
      deliveredAt: message.deliveredAt?.toISOString() ?? null,
      readAt: message.readAt?.toISOString() ?? null,
      errorMessage: message.errorMessage ?? null,
      timestamp: message.messageTimestamp.toISOString(),
      template: toRenderedTemplate(message.messageTemplate),
    },
    contact: {
      waId: contact.waId,
    },
    metadata: {
      agentId: message.agentId ?? null,
    },
  };
}
