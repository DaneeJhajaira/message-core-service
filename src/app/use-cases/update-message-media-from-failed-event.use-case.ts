import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MessageOrmEntity } from '../../infrastructure/persistence/postgres/entities/message.orm-entity';
import { MediaAssetFailedEvent } from '../../shared/contracts/media-asset-failed.contract';
import { ContactOrmEntity } from '../../infrastructure/persistence/postgres/entities/contact.orm-entity';
import { ConversationOrmEntity } from '../../infrastructure/persistence/postgres/entities/conversation.orm-entity';
import { ChatEventsPublisher } from '../../message-core/services/chat-events.publisher';
import { toChatMessageUpdatedEvent } from '../../message-core/mappers/chat-events.mapper';

@Injectable()
export class UpdateMessageMediaFromFailedEventUseCase {
  private readonly logger = new Logger(
    UpdateMessageMediaFromFailedEventUseCase.name,
  );

  constructor(
    @InjectRepository(MessageOrmEntity)
    private readonly messageRepository: Repository<MessageOrmEntity>,

    @InjectRepository(ConversationOrmEntity)
    private readonly conversationRepository: Repository<ConversationOrmEntity>,

    @InjectRepository(ContactOrmEntity)
    private readonly contactRepository: Repository<ContactOrmEntity>,

    private readonly chatEventsPublisher: ChatEventsPublisher,
  ) {}

  async execute(event: MediaAssetFailedEvent): Promise<void> {
    const message = await this.messageRepository.findOne({
      where: { messageId: event.mediaJob.messageId },
      relations: ['messageTemplate'],
    });

    if (!message) {
      this.logger.warn(
        `Mensaje no encontrado, ignorando media.asset.failed: messageId=${event.mediaJob.messageId}`,
      );
      return;
    }

    message.providerMediaId = event.mediaJob.providerMediaId;
    message.mediaStatus = event.mediaJob.status;
    message.mediaErrorMessage = event.error.message;
    message.mediaMimeType = event.media.mimeType;
    message.mediaUrl = null;
    message.mediaStorageBucket = null;
    message.mediaStorageObjectKey = null;

    await this.messageRepository.save(message);

    const conversation = await this.conversationRepository.findOne({
      where: { id: message.conversationId },
    });

    const contact = await this.contactRepository.findOne({
      where: { id: message.contactId },
    });

    if (conversation && contact) {
      await this.chatEventsPublisher.publishMessageUpdated(
        toChatMessageUpdatedEvent({
          conversation,
          contact,
          message,
        }),
      );
    }

    this.logger.log(
      `Mensaje actualizado con media fallida: messageId=${message.messageId}`,
    );
  }
}
