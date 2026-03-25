import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WhatsappMessageReceivedEvent } from '../../shared/contracts/whatsapp-message-received.contract';
import { ContactOrmEntity } from '../../infrastructure/persistence/postgres/entities/contact.orm-entity';
import { ConversationOrmEntity } from '../../infrastructure/persistence/postgres/entities/conversation.orm-entity';
import { MessageOrmEntity } from '../../infrastructure/persistence/postgres/entities/message.orm-entity';

@Injectable()
export class RegisterIncomingMessageUseCase {
  private readonly logger = new Logger(RegisterIncomingMessageUseCase.name);

  constructor(
    @InjectRepository(ContactOrmEntity)
    private readonly contactRepository: Repository<ContactOrmEntity>,

    @InjectRepository(ConversationOrmEntity)
    private readonly conversationRepository: Repository<ConversationOrmEntity>,

    @InjectRepository(MessageOrmEntity)
    private readonly messageRepository: Repository<MessageOrmEntity>,
  ) {}

  async execute(event: WhatsappMessageReceivedEvent): Promise<void> {
    const existingMessage = await this.messageRepository.findOne({
      where: { messageId: event.message.messageId },
    });

    if (existingMessage) {
      this.logger.warn(
        `Mensaje duplicado ignorado: ${event.message.messageId}`,
      );
      return;
    }

    let contact = await this.contactRepository.findOne({
      where: { waId: event.contact.waId },
    });

    const messageDate = new Date(event.message.timestamp);

    if (!contact) {
      contact = this.contactRepository.create({
        waId: event.contact.waId,
        phone: event.contact.phone,
        name: event.contact.name ?? null,
        lastMessageAt: messageDate,
      });

      contact = await this.contactRepository.save(contact);
    } else {
      contact.phone = event.contact.phone;
      contact.name = event.contact.name ?? contact.name;
      contact.lastMessageAt = messageDate;

      contact = await this.contactRepository.save(contact);
    }

    let conversation = await this.conversationRepository.findOne({
      where: { externalId: event.conversation.externalId },
    });

    if (!conversation) {
      conversation = this.conversationRepository.create({
        contactId: contact.id,
        externalId: event.conversation.externalId,
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
      messageId: event.message.messageId,
      direction: event.message.direction,
      messageType: event.message.type,
      body: event.content.text?.body ?? event.content.media?.caption ?? null,
      providerMediaId: event.content.media?.providerMediaId ?? null,
      mediaStatus: event.content.media?.providerMediaId ? 'PENDING' : null,
      mediaUrl: null,
      mediaMimeType: event.content.media?.mimeType ?? null,
      mediaStorageBucket: null,
      mediaStorageObjectKey: null,
      status: 'received',
      messageTimestamp: messageDate,
      rawPayload: event.rawPayload,
    });

    await this.messageRepository.save(message);

    this.logger.log(`Mensaje registrado: ${event.message.messageId}`);
  }
}