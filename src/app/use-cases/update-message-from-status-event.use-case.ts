import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MessageOrmEntity } from '../../infrastructure/persistence/postgres/entities/message.orm-entity';
import { WhatsappMessageStatusEvent } from '../../shared/contracts/whatsapp-message-status.contract';

@Injectable()
export class UpdateMessageFromStatusEventUseCase {
  private readonly logger = new Logger(UpdateMessageFromStatusEventUseCase.name);

  constructor(
    @InjectRepository(MessageOrmEntity)
    private readonly messageRepository: Repository<MessageOrmEntity>,
  ) {}

  async execute(event: WhatsappMessageStatusEvent): Promise<void> {
    const message = await this.messageRepository.findOne({
      where: { messageId: event.message.messageId },
    });

    if (!message) {
      throw new NotFoundException(
        `No existe mensaje con wamid=${event.message.messageId}`,
      );
    }

    message.status = event.message.status;
    message.messageTimestamp = new Date(event.message.timestamp);
    message.rawPayload = event.rawPayload;

    if (event.message.status === 'delivered') {
      message.deliveredAt = new Date(event.message.timestamp);
    }

    if (event.message.status === 'read') {
      message.readAt = new Date(event.message.timestamp);
    }

    if (event.message.status === 'failed') {
      message.errorMessage = event.error?.message ?? message.errorMessage;
      message.statusErrorCode = event.error?.code ?? null;
      message.statusErrorTitle = event.error?.title ?? null;
    }

    await this.messageRepository.save(message);

    this.logger.log(
      `Estado actualizado para wamid=${message.messageId} status=${message.status}`,
    );
  }
}