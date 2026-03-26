import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConversationOrmEntity } from '../../infrastructure/persistence/postgres/entities/conversation.orm-entity';
import { MessageOrmEntity } from '../../infrastructure/persistence/postgres/entities/message.orm-entity';

@Injectable()
export class GetConversationMessagesUseCase {
  constructor(
    @InjectRepository(ConversationOrmEntity)
    private readonly conversationRepository: Repository<ConversationOrmEntity>,

    @InjectRepository(MessageOrmEntity)
    private readonly messageRepository: Repository<MessageOrmEntity>,
  ) {}

  async execute(externalId: string): Promise<MessageOrmEntity[]> {
    const conversation = await this.conversationRepository.findOne({
      where: { externalId },
    });

    if (!conversation) {
      throw new NotFoundException(
        `No existe conversación con externalId=${externalId}`,
      );
    }

    return this.messageRepository.find({
      where: { conversationId: conversation.id },
      order: {
        messageTimestamp: 'ASC',
        id: 'ASC',
      },
    });
  }
}