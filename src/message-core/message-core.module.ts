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
import { WhatsappMessageSendConsumer } from 'src/infrastructure/messaging/kafka/consumers/whatsapp-message-send.consumer';
import { RegisterPendingOutboundMessageUseCase } from 'src/app/use-cases/register-pending-outbound-message.use-case';
import { WhatsappMessageStatusConsumer } from 'src/infrastructure/messaging/kafka/consumers/whatsapp-message-status.consumer';
import { UpdateMessageFromStatusEventUseCase } from 'src/app/use-cases/update-message-from-status-event.use-case';
import { ConversationsController } from './controllers/conversations.controller';
import { GetConversationsUseCase } from '../app/use-cases/get-conversations.use-case';
import { GetConversationMessagesUseCase } from '../app/use-cases/get-conversation-messages.use-case';
import { ChatEventsPublisher } from './services/chat-events.publisher';
import { ConversationAccessController } from './controllers/conversation-access.controller';
import { CheckConversationAccessUseCase } from 'src/app/use-cases/check-conversation-access.use-case';
import { GetConversationContextUseCase } from '../app/use-cases/get-conversation-context.use-case';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ContactOrmEntity,
      ConversationOrmEntity,
      MessageOrmEntity,
    ]),
  ],
  controllers: [
    MessageReceivedConsumer,
    MediaAssetProcessedConsumer,
    MediaAssetFailedConsumer,
    WhatsappMessageSentConsumer,
    WhatsappMessageFailedConsumer,
    WhatsappMessageSendConsumer,
    WhatsappMessageStatusConsumer,
    ConversationsController,
    ConversationAccessController,
  ],
  providers: [
    RegisterIncomingMessageUseCase,
    UpdateMessageMediaFromProcessedEventUseCase,
    UpdateMessageMediaFromFailedEventUseCase,
    RegisterSentOutboundMessageUseCase,
    RegisterFailedOutboundMessageUseCase,
    RegisterPendingOutboundMessageUseCase,
    UpdateMessageFromStatusEventUseCase,
    GetConversationsUseCase,
    GetConversationMessagesUseCase,
    ChatEventsPublisher,
    CheckConversationAccessUseCase,
    GetConversationContextUseCase,
  ],
})
export class MessageCoreModule {}
