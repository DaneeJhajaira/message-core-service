import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConversationOrmEntity } from '../../infrastructure/persistence/postgres/entities/conversation.orm-entity';

@Injectable()
export class GetConversationsUseCase {
  constructor(
    @InjectRepository(ConversationOrmEntity)
    private readonly conversationRepository: Repository<ConversationOrmEntity>,
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

    return { data, total };
  }
}
