import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegisterIncomingMessageUseCase } from '../app/use-cases/register-incoming-message.use-case';
import { MessageReceivedConsumer } from '../infrastructure/messaging/kafka/consumers/message-received.consumer';
import { ContactOrmEntity } from '../infrastructure/persistence/postgres/entities/contact.orm-entity';
import { ConversationOrmEntity } from '../infrastructure/persistence/postgres/entities/conversation.orm-entity';
import { MessageOrmEntity } from '../infrastructure/persistence/postgres/entities/message.orm-entity';
import { UpdateMessageMediaFromProcessedEventUseCase } from 'src/app/use-cases/update-message-media-from-processed-event.use-case';
import { MediaAssetProcessedConsumer } from 'src/infrastructure/messaging/kafka/consumers/media-asset-processed.consumer';
import { UpdateMessageMediaFromFailedEventUseCase } from 'src/app/use-cases/update-message-media-from-failed-event.use-case';
import { MediaAssetFailedConsumer } from 'src/infrastructure/messaging/kafka/consumers/media-asset-failed.consumer';
import { RegisterFailedOutboundMessageUseCase } from 'src/app/use-cases/register-failed-outbound-message.use-case';
import { RegisterSentOutboundMessageUseCase } from 'src/app/use-cases/register-sent-outbound-message.use-case';
import { WhatsappMessageFailedConsumer } from 'src/infrastructure/messaging/kafka/consumers/whatsapp-message-failed.consumer';
import { WhatsappMessageSentConsumer } from 'src/infrastructure/messaging/kafka/consumers/whatsapp-message-sent.consumer';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ContactOrmEntity,
      ConversationOrmEntity,
      MessageOrmEntity,
    ]),
  ],
  controllers: [MessageReceivedConsumer,  MediaAssetProcessedConsumer, MediaAssetFailedConsumer, WhatsappMessageSentConsumer, WhatsappMessageFailedConsumer],
  providers: [RegisterIncomingMessageUseCase, UpdateMessageMediaFromProcessedEventUseCase,UpdateMessageMediaFromFailedEventUseCase, RegisterSentOutboundMessageUseCase, RegisterFailedOutboundMessageUseCase,],
})
export class MessageCoreModule {}