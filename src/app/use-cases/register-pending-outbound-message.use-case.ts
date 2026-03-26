import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContactOrmEntity } from '../../infrastructure/persistence/postgres/entities/contact.orm-entity';
import { ConversationOrmEntity } from '../../infrastructure/persistence/postgres/entities/conversation.orm-entity';
import { MessageOrmEntity } from '../../infrastructure/persistence/postgres/entities/message.orm-entity';
import { WhatsappMessageSendEvent } from '../../shared/contracts/whatsapp-message-send.contract';

@Injectable()
export class RegisterPendingOutboundMessageUseCase {
  private readonly logger = new Logger(RegisterPendingOutboundMessageUseCase.name);

  constructor(
    @InjectRepository(ContactOrmEntity)
    private readonly contactRepository: Repository<ContactOrmEntity>,

    @InjectRepository(ConversationOrmEntity)
    private readonly conversationRepository: Repository<ConversationOrmEntity>,

    @InjectRepository(MessageOrmEntity)
    private readonly messageRepository: Repository<MessageOrmEntity>,
  ) {}

  async execute(event: WhatsappMessageSendEvent): Promise<void> {
    const existing = await this.messageRepository.findOne({
      where: { originalEventId: event.eventId },
    });

    if (existing) {
      this.logger.warn(
        `Mensaje outbound pending ya existe para originalEventId=${event.eventId}`,
      );
      return;
    }

    let contact = await this.contactRepository.findOne({
      where: { waId: event.recipient.waId },
    });

    const messageDate = new Date(event.occurredAt);

    if (!contact) {
      contact = this.contactRepository.create({
        waId: event.recipient.waId,
        phone: event.recipient.phone ?? event.recipient.waId,
        name: null,
        lastMessageAt: messageDate,
      });

      contact = await this.contactRepository.save(contact);
    } else {
      contact.phone = event.recipient.phone ?? contact.phone;
      contact.lastMessageAt = messageDate;
      contact = await this.contactRepository.save(contact);
    }

    let conversation = await this.conversationRepository.findOne({
      where: { externalId: event.recipient.waId },
    });

    if (!conversation) {
      conversation = this.conversationRepository.create({
        contactId: contact.id,
        externalId: event.recipient.waId,
        status: 'open',
        lastMessageAt: messageDate,
      });

      conversation = await this.conversationRepository.save(conversation);
    } else {
      conversation.contactId = contact.id;
      conversation.lastMessageAt = messageDate;
      conversation = await this.conversationRepository.save(conversation);
    }

    const message = this.messageRepository.create({
      conversationId: conversation.id,
      contactId: contact.id,
      messageId: `pending:${event.eventId}`,
      originalEventId: event.eventId,
      direction: 'outbound',
      messageType: event.message.type,
      body:
        event.content.text?.body ??
        event.content.media?.caption ??
        null,
      providerName: event.provider,
      providerPhoneNumberId: null,
      agentId: event.metadata?.agentId ?? null,
      providerMediaId: null,
      mediaStatus: event.content.media?.mediaAssetId ? 'PENDING' : null,
      mediaUrl: null,
      mediaMimeType: null,
      mediaStorageBucket: null,
      mediaStorageObjectKey: null,
      mediaErrorMessage: null,
      errorMessage: null,
      status: 'pending',
      messageTimestamp: messageDate,
      rawPayload: event as unknown as Record<string, any>,
    });

    await this.messageRepository.save(message);

    this.logger.log(
      `Mensaje outbound pending registrado: originalEventId=${event.eventId}`,
    );
  }
}