import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RegisterIncomingMessageUseCase } from '../app/use-cases/register-incoming-message.use-case';
import { MessageReceivedConsumer } from '../infrastructure/messaging/kafka/consumers/message-received.consumer';

import { ContactOrmEntity } from '../infrastructure/persistence/postgres/entities/contact.orm-entity';
import { ConversationOrmEntity } from '../infrastructure/persistence/postgres/entities/conversation.orm-entity';
import { MessageOrmEntity } from '../infrastructure/persistence/postgres/entities/message.orm-entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ContactOrmEntity,
      ConversationOrmEntity,
      MessageOrmEntity,
    ]),
  ],
  controllers: [MessageReceivedConsumer],
  providers: [RegisterIncomingMessageUseCase],
})
export class MessageCoreModule {}