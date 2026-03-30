import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContactOrmEntity } from '../../infrastructure/persistence/postgres/entities/contact.orm-entity';
import { ConversationOrmEntity } from '../../infrastructure/persistence/postgres/entities/conversation.orm-entity';
import { MessageOrmEntity } from '../../infrastructure/persistence/postgres/entities/message.orm-entity';
import { WhatsappMessageSentEvent } from '../../shared/contracts/whatsapp-message-sent.contract';
import { ChatEventsPublisher } from 'src/message-core/services/chat-events.publisher';
import { toChatMessageUpdatedEvent } from 'src/message-core/mappers/chat-events.mapper';

@Injectable()
export class RegisterSentOutboundMessageUseCase {
  private readonly logger = new Logger(RegisterSentOutboundMessageUseCase.name);

  constructor(
    @InjectRepository(ContactOrmEntity)
    private readonly contactRepository: Repository<ContactOrmEntity>,

    @InjectRepository(ConversationOrmEntity)
    private readonly conversationRepository: Repository<ConversationOrmEntity>,

    @InjectRepository(MessageOrmEntity)
    private readonly messageRepository: Repository<MessageOrmEntity>,

    private readonly chatEventsPublisher: ChatEventsPublisher,
  ) {}

  async execute(event: WhatsappMessageSentEvent): Promise<void> {
    let contact = await this.contactRepository.findOne({
      where: { waId: event.recipient.waId },
    });

    const messageDate = new Date(event.occurredAt);

    if (!contact) {
      contact = this.contactRepository.create({
        waId: event.recipient.waId,
        phone: event.recipient.waId,
        name: null,
        lastMessageAt: messageDate,
      });

      contact = await this.contactRepository.save(contact);
    } else {
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
        lastMessageId: event.provider.wamid,
        lastMessageType: event.message.type,
        lastMessageDirection: 'outbound',
      });

      conversation = await this.conversationRepository.save(conversation);
    } else {
      conversation.contactId = contact.id;
      conversation.lastMessageAt = messageDate;
      conversation.lastMessageId = event.provider.wamid;
      conversation.lastMessageType = event.message.type;
      conversation.lastMessageDirection = 'outbound';
      conversation = await this.conversationRepository.save(conversation);
    }

    let message = await this.messageRepository.findOne({
      where: { originalEventId: event.originalEventId },
    });

    if (!message) {
      message = this.messageRepository.create({
        conversationId: conversation.id,
        contactId: contact.id,
        messageId: event.provider.wamid,
        originalEventId: event.originalEventId,
        direction: 'outbound',
        messageType: event.message.type,
        body: null,
        providerName: event.provider.name,
        providerPhoneNumberId: event.provider.phoneNumberId,
        agentId: event.metadata?.agentId ?? null,
        providerMediaId: null,
        mediaStatus: null,
        mediaUrl: null,
        mediaMimeType: null,
        mediaStorageBucket: null,
        mediaStorageObjectKey: null,
        mediaErrorMessage: null,
        errorMessage: null,
        status: event.message.status,
        messageTimestamp: messageDate,
        rawPayload: event as unknown as Record<string, any>,
      });
    } else {
      message.messageId = event.provider.wamid;
      message.direction = 'outbound';
      message.messageType = event.message.type;
      message.providerName = event.provider.name;
      message.providerPhoneNumberId = event.provider.phoneNumberId;
      message.agentId = event.metadata?.agentId ?? null;
      message.errorMessage = null;
      message.status = event.message.status;
      message.messageTimestamp = messageDate;
      message.rawPayload = event as unknown as Record<string, any>;
    }

    await this.messageRepository.save(message);

    await this.chatEventsPublisher.publishMessageUpdated(
      toChatMessageUpdatedEvent({
        conversation,
        contact,
        message,
      }),
    );

    this.logger.log(
      `Mensaje outbound registrado/actualizado como sent: wamid=${event.provider.wamid}`,
    );
  }
}
