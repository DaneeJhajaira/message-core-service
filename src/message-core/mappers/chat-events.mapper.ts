import { randomUUID } from 'crypto';
import { ContactOrmEntity } from '../../infrastructure/persistence/postgres/entities/contact.orm-entity';
import { ConversationOrmEntity } from '../../infrastructure/persistence/postgres/entities/conversation.orm-entity';
import { MessageOrmEntity } from '../../infrastructure/persistence/postgres/entities/message.orm-entity';
import { ChatMessageCreatedEvent } from '../../shared/contracts/chat-message-created.contract';
import { ChatMessageUpdatedEvent } from '../../shared/contracts/chat-message-updated.contract';

export function toChatMessageCreatedEvent(params: {
  conversation: ConversationOrmEntity;
  contact: ContactOrmEntity;
  message: MessageOrmEntity;
}): ChatMessageCreatedEvent {
  const { conversation, contact, message } = params;

  return {
    eventId: randomUUID(),
    eventType: 'chat.message.created',
    occurredAt: new Date().toISOString(),
    conversation: {
      externalId: conversation.externalId,
    },
    message: {
      messageId: message.messageId,
      direction: message.direction,
      type: message.messageType,
      body: message.body,
      status: message.status,
      timestamp: message.messageTimestamp.toISOString(),
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

  return {
    eventId: randomUUID(),
    eventType: 'chat.message.updated',
    occurredAt: new Date().toISOString(),
    conversation: {
      externalId: conversation.externalId,
    },
    message: {
      messageId: message.messageId,
      direction: message.direction,
      type: message.messageType,
      status: message.status,
      body: message.body,
      mediaStatus: message.mediaStatus ?? null,
      mediaUrl: message.mediaUrl ?? null,
      mediaErrorMessage: message.mediaErrorMessage ?? null,
      deliveredAt: message.deliveredAt?.toISOString() ?? null,
      readAt: message.readAt?.toISOString() ?? null,
      errorMessage: message.errorMessage ?? null,
      timestamp: message.messageTimestamp.toISOString(),
    },
    contact: {
      waId: contact.waId,
    },
    metadata: {
      agentId: message.agentId ?? null,
    },
  };
}
