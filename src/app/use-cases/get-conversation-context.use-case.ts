import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConversationOrmEntity } from '../../infrastructure/persistence/postgres/entities/conversation.orm-entity';
import { MessageOrmEntity } from '../../infrastructure/persistence/postgres/entities/message.orm-entity';

export interface ConversationContext {
  externalId: string;
  lastInboundAt: Date | null;
  isWithin24h: boolean;
  windowExpiresAt: Date | null;
  mustUseTemplate: boolean;
}

@Injectable()
export class GetConversationContextUseCase {
  constructor(
    @InjectRepository(ConversationOrmEntity)
    private readonly conversationRepository: Repository<ConversationOrmEntity>,

    @InjectRepository(MessageOrmEntity)
    private readonly messageRepository: Repository<MessageOrmEntity>,
  ) {}

  async execute(externalId: string): Promise<ConversationContext> {
    const conversation = await this.conversationRepository.findOne({
      where: { externalId },
    });

    if (!conversation) {
      throw new NotFoundException(
        `No existe conversación con externalId=${externalId}`,
      );
    }

    const result = await this.messageRepository
      .createQueryBuilder('m')
      .select('MAX(m.message_timestamp)', 'lastInboundAt')
      .where('m.conversation_id = :convId', { convId: conversation.id })
      .andWhere('m.direction = :direction', { direction: 'inbound' })
      .getRawOne<{ lastInboundAt: string | null }>();

    const lastInboundAt = result?.lastInboundAt
      ? new Date(result.lastInboundAt)
      : null;

    const now = new Date();
    let isWithin24h = false;
    let windowExpiresAt: Date | null = null;

    if (lastInboundAt) {
      windowExpiresAt = new Date(
        lastInboundAt.getTime() + 24 * 60 * 60 * 1000,
      );
      isWithin24h = now <= windowExpiresAt;
    }

    return {
      externalId,
      lastInboundAt,
      isWithin24h,
      windowExpiresAt,
      mustUseTemplate: !isWithin24h,
    };
  }
}
