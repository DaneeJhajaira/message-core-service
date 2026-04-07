import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConversationOrmEntity } from '../../infrastructure/persistence/postgres/entities/conversation.orm-entity';
import { MessageOrmEntity } from '../../infrastructure/persistence/postgres/entities/message.orm-entity';

export interface ConversationContext {
  externalId: string;
  lastInboundAt: Date | null;
  lastTemplateSentAt: Date | null;
  isWithin24h: boolean;
  windowExpiresAt: Date | null;
  mustUseTemplate: boolean;
}

interface AggregatedResult {
  lastInboundAt: string | null;
  lastTemplateSentAt: string | null;
}

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;
const SUCCESSFUL_STATUSES = ['sent', 'delivered', 'read'];

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
      .select(
        "MAX(CASE WHEN m.direction = 'inbound' THEN m.message_timestamp END)",
        'lastInboundAt',
      )
      .addSelect(
        "MAX(CASE WHEN m.direction = 'outbound' AND m.message_type = 'template' AND m.status IN (:...sentStatuses) THEN m.message_timestamp END)",
        'lastTemplateSentAt',
      )
      .where('m.conversation_id = :convId', { convId: conversation.id })
      .setParameters({ sentStatuses: SUCCESSFUL_STATUSES })
      .getRawOne<AggregatedResult>();

    const lastInboundAt = result?.lastInboundAt
      ? new Date(result.lastInboundAt)
      : null;

    const lastTemplateSentAt = result?.lastTemplateSentAt
      ? new Date(result.lastTemplateSentAt)
      : null;

    const now = new Date();
    let isWithin24h = false;
    let windowExpiresAt: Date | null = null;

    if (lastInboundAt) {
      windowExpiresAt = new Date(
        lastInboundAt.getTime() + TWENTY_FOUR_HOURS_MS,
      );
      isWithin24h = now <= windowExpiresAt;
    }

    return {
      externalId,
      lastInboundAt,
      lastTemplateSentAt,
      isWithin24h,
      windowExpiresAt,
      mustUseTemplate: !isWithin24h,
    };
  }
}
