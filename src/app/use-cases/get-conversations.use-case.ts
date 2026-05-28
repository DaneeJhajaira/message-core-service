import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ConversationOrmEntity } from '../../infrastructure/persistence/postgres/entities/conversation.orm-entity';
import { MessageOrmEntity } from '../../infrastructure/persistence/postgres/entities/message.orm-entity';
import {
  isInteractiveReplyMessageType,
  resolveInboundMessageBody,
} from '../../shared/utils/resolve-message-body.util';

@Injectable()
export class GetConversationsUseCase {
  constructor(
    @InjectRepository(ConversationOrmEntity)
    private readonly conversationRepository: Repository<ConversationOrmEntity>,

    @InjectRepository(MessageOrmEntity)
    private readonly messageRepository: Repository<MessageOrmEntity>,
  ) {}

  async execute(params: {
    limit: number;
    offset: number;
  }): Promise<{ data: ConversationOrmEntity[]; total: number }> {
    const [data, total] = await this.conversationRepository.findAndCount({
      order: {
        lastMessageAt: 'DESC',
        updatedAt: 'DESC',
      },
      take: params.limit,
      skip: params.offset,
    });

    await this.hydrateInteractiveReplyPreviews(data);

    return { data, total };
  }

  private async hydrateInteractiveReplyPreviews(
    conversations: ConversationOrmEntity[],
  ): Promise<void> {
    const needsPreview = conversations.filter(
      (conversation) =>
        conversation.lastMessageId &&
        isInteractiveReplyMessageType(conversation.lastMessageType ?? '') &&
        !conversation.lastMessagePreview,
    );

    if (!needsPreview.length) {
      return;
    }

    const lastMessages = await this.messageRepository.find({
      where: {
        messageId: In(needsPreview.map((conversation) => conversation.lastMessageId!)),
      },
      select: ['messageId', 'messageType', 'body', 'rawPayload'],
    });

    const byMessageId = new Map(
      lastMessages.map((message) => [message.messageId, message]),
    );

    for (const conversation of needsPreview) {
      const lastMessage = byMessageId.get(conversation.lastMessageId!);
      if (!lastMessage) {
        continue;
      }

      conversation.lastMessagePreview = resolveInboundMessageBody(
        lastMessage.messageType,
        lastMessage.body,
        lastMessage.rawPayload,
      );
    }
  }
}
