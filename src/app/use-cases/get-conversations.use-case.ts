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

  async execute(): Promise<ConversationOrmEntity[]> {
    return this.conversationRepository.find({
      order: {
        lastMessageAt: 'DESC',
        updatedAt: 'DESC',
      },
    });
  }
}
