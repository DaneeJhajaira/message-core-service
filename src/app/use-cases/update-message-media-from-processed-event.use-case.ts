import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MessageOrmEntity } from '../../infrastructure/persistence/postgres/entities/message.orm-entity';
import { MediaAssetProcessedEvent } from '../../shared/contracts/media-asset-processed.contract';
import { ContactOrmEntity } from '../../infrastructure/persistence/postgres/entities/contact.orm-entity';
import { ConversationOrmEntity } from '../../infrastructure/persistence/postgres/entities/conversation.orm-entity';
import { ChatEventsPublisher } from '../../message-core/services/chat-events.publisher';
import { toChatMessageUpdatedEvent } from '../../message-core/mappers/chat-events.mapper';

@Injectable()
export class UpdateMessageMediaFromProcessedEventUseCase {
  private readonly logger = new Logger(
    UpdateMessageMediaFromProcessedEventUseCase.name,
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

  async execute(event: MediaAssetProcessedEvent): Promise<void> {
    const message = await this.messageRepository.findOne({
      where: { messageId: event.mediaJob.messageId },
      relations: ['messageTemplate'],
    });

    if (!message) {
      this.logger.warn(
        `Mensaje no encontrado, ignorando media.asset.processed: messageId=${event.mediaJob.messageId}`,
      );
      return;
    }

    message.mediaAssetId = event.mediaJob.id;
    message.providerMediaId = event.mediaJob.providerMediaId;
    message.mediaStatus = event.mediaJob.status;
    message.mediaUrl = event.storage.publicUrl;
    message.mediaMimeType = event.media.mimeType;
    message.mediaStorageBucket = event.storage.bucket;
    message.mediaStorageObjectKey = event.storage.objectKey;

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
      `Mensaje actualizado con media procesada: messageId=${message.messageId}`,
    );
  }
}
