import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { ChatMessageCreatedEvent } from '../../shared/contracts/chat-message-created.contract';
import { ChatMessageUpdatedEvent } from '../../shared/contracts/chat-message-updated.contract';

@Injectable()
export class ChatEventsPublisher implements OnModuleInit {
  constructor(
    @Inject('KAFKA_PUBLISHER_SERVICE')
    private readonly kafkaClient: ClientKafka,
  ) {}

  async onModuleInit() {
    await this.kafkaClient.connect();
  }

  async publishMessageCreated(event: ChatMessageCreatedEvent): Promise<void> {
    await firstValueFrom(this.kafkaClient.emit('chat.message.created', event));
  }

  async publishMessageUpdated(event: ChatMessageUpdatedEvent): Promise<void> {
    await firstValueFrom(this.kafkaClient.emit('chat.message.updated', event));
  }
}