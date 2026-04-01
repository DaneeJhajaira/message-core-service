import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConversationOrmEntity } from '../../infrastructure/persistence/postgres/entities/conversation.orm-entity';
import { MessageOrmEntity } from '../../infrastructure/persistence/postgres/entities/message.orm-entity';

export interface MessageCursor {
  timestamp: string;
  id: number;
}

@Injectable()
export class GetConversationMessagesUseCase {
  constructor(
    @InjectRepository(ConversationOrmEntity)
    private readonly conversationRepository: Repository<ConversationOrmEntity>,

    @InjectRepository(MessageOrmEntity)
    private readonly messageRepository: Repository<MessageOrmEntity>,
  ) {}

  async execute(
    externalId: string,
    params: { limit: number; cursor?: MessageCursor },
  ): Promise<{ data: MessageOrmEntity[]; total: number; hasMore: boolean }> {
    const conversation = await this.conversationRepository.findOne({
      where: { externalId },
    });

    if (!conversation) {
      throw new NotFoundException(
        `No existe conversación con externalId=${externalId}`,
      );
    }

    const qb = this.messageRepository
      .createQueryBuilder('m')
      .where('m.conversation_id = :convId', { convId: conversation.id });

    if (params.cursor) {
      qb.andWhere(
        '(m.message_timestamp, m.id) < (:cursorTs, :cursorId)',
        { cursorTs: params.cursor.timestamp, cursorId: params.cursor.id },
      );
    }

    const total = await this.messageRepository.count({
      where: { conversationId: conversation.id },
    });

    const data = await qb
      .orderBy('m.message_timestamp', 'DESC')
      .addOrderBy('m.id', 'DESC')
      .take(params.limit + 1)
      .getMany();

    const hasMore = data.length > params.limit;
    if (hasMore) {
      data.pop();
    }

    data.reverse();

    return { data, total, hasMore };
  }
}
