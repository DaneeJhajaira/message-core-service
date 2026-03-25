import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MessageOrmEntity } from '../../infrastructure/persistence/postgres/entities/message.orm-entity';
import { MediaAssetFailedEvent } from '../../shared/contracts/media-asset-failed.contract';

@Injectable()
export class UpdateMessageMediaFromFailedEventUseCase {
  private readonly logger = new Logger(
    UpdateMessageMediaFromFailedEventUseCase.name,
  );

  constructor(
    @InjectRepository(MessageOrmEntity)
    private readonly messageRepository: Repository<MessageOrmEntity>,
  ) {}

  async execute(event: MediaAssetFailedEvent): Promise<void> {
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
    message.mediaErrorMessage = event.error.message;
    message.mediaMimeType = event.media.mimeType;
    message.mediaUrl = null;
    message.mediaStorageBucket = null;
    message.mediaStorageObjectKey = null;

    await this.messageRepository.save(message);

    this.logger.log(
      `Mensaje actualizado con media fallida: messageId=${message.messageId}`,
    );
  }
}