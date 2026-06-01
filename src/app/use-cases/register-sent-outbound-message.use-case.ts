import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContactOrmEntity } from '../../infrastructure/persistence/postgres/entities/contact.orm-entity';
import { ConversationOrmEntity } from '../../infrastructure/persistence/postgres/entities/conversation.orm-entity';
import { MessageOrmEntity } from '../../infrastructure/persistence/postgres/entities/message.orm-entity';
import { MessageTemplateOrmEntity } from '../../infrastructure/persistence/postgres/entities/message-template.orm-entity';
import { WhatsappMessageSentEvent } from '../../shared/contracts/whatsapp-message-sent.contract';
import { ChatEventsPublisher } from 'src/message-core/services/chat-events.publisher';
import {
  toChatMessageCreatedEvent,
  toChatMessageUpdatedEvent,
} from 'src/message-core/mappers/chat-events.mapper';

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

    @InjectRepository(MessageTemplateOrmEntity)
    private readonly messageTemplateRepository: Repository<MessageTemplateOrmEntity>,

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
      relations: ['messageTemplate'],
    });

    const isNewMessage = !message;
    const textBody = event.content?.text?.body ?? null;

    if (!message) {
      message = this.messageRepository.create({
        conversationId: conversation.id,
        contactId: contact.id,
        messageId: event.provider.wamid,
        originalEventId: event.originalEventId,
        direction: 'outbound',
        messageType: event.message.type,
        body: textBody,
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
      if (textBody) {
        message.body = textBody;
      }
    }

    await this.messageRepository.save(message);

    const rt = event.content?.renderedTemplate;
    if (rt && !message.messageTemplate) {
      try {
        const templateEntity = this.messageTemplateRepository.create({
          messageId: message.id,
          name: rt.name,
          language: rt.language,
          headerType: rt.header?.type ?? null,
          headerText: rt.header?.text ?? null,
          headerMediaId: rt.header?.mediaId ?? null,
          headerMediaUrl: rt.header?.mediaUrl ?? null,
          headerLocation: rt.header?.location ?? null,
          body: rt.body,
          footer: rt.footer ?? null,
          buttons: rt.buttons ?? null,
        });
        message.messageTemplate =
          await this.messageTemplateRepository.save(templateEntity);
      } catch (err) {
        this.logger.error(
          `Error guardando template para message=${message.id}: ${err.message}`,
          err.stack,
        );
      }
    }

    if (isNewMessage) {
      await this.chatEventsPublisher.publishMessageCreated(
        toChatMessageCreatedEvent({
          conversation,
          contact,
          message,
        }),
      );
    } else {
      await this.chatEventsPublisher.publishMessageUpdated(
        toChatMessageUpdatedEvent({
          conversation,
          contact,
          message,
        }),
      );
    }

    this.logger.log(
      `Mensaje outbound ${isNewMessage ? 'registrado' : 'actualizado'} como sent: wamid=${event.provider.wamid}`,
    );
  }
}
