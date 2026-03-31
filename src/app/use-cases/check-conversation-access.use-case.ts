import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConversationOrmEntity } from '../../infrastructure/persistence/postgres/entities/conversation.orm-entity';

@Injectable()
export class CheckConversationAccessUseCase {
  constructor(
    @InjectRepository(ConversationOrmEntity)
    private readonly conversationRepository: Repository<ConversationOrmEntity>,
  ) {}

  async execute(params: {
    conversationExternalId: string;
  }): Promise<{ allowed: boolean }> {
    const conversation = await this.conversationRepository.findOne({
      where: { externalId: params.conversationExternalId },
    });
    console.log(`Check access for conversation with externalId=${params.conversationExternalId}: ${
      conversation ? 'ALLOWED' : 'DENIED'
    }`);
    console.log('Existing conversations in DB:', conversation);
    return {
      allowed: !!conversation,
    };
  }
}