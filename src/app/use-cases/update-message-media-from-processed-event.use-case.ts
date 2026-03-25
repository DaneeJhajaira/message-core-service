import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MessageOrmEntity } from '../../infrastructure/persistence/postgres/entities/message.orm-entity';
import { MediaAssetProcessedEvent } from '../../shared/contracts/media-asset-processed.contract';

@Injectable()
export class UpdateMessageMediaFromProcessedEventUseCase {
  private readonly logger = new Logger(
    UpdateMessageMediaFromProcessedEventUseCase.name,
  );

  constructor(
    @InjectRepository(MessageOrmEntity)
    private readonly messageRepository: Repository<MessageOrmEntity>,
  ) {}

  async execute(event: MediaAssetProcessedEvent): Promise<void> {
    const message = await this.messageRepository.findOne({
      where: { messageId: event.mediaJob.messageId },
    });

    if (!message) {
      throw new NotFoundException(
        `No existe mensaje base con messageId=${event.mediaJob.messageId}`,
      );
    }

    message.providerMediaId = event.mediaJob.providerMediaId;
    message.mediaStatus = event.mediaJob.status;
    message.mediaUrl = event.storage.publicUrl;
    message.mediaMimeType = event.media.mimeType;
    message.mediaStorageBucket = event.storage.bucket;
    message.mediaStorageObjectKey = event.storage.objectKey;

    await this.messageRepository.save(message);

    this.logger.log(
      `Mensaje actualizado con media procesada: messageId=${message.messageId}`,
    );
  }
}