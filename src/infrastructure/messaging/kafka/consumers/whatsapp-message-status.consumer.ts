import { Controller, Logger } from '@nestjs/common';
import {
  Ctx,
  EventPattern,
  KafkaContext,
  Payload,
} from '@nestjs/microservices';
import type { WhatsappMessageStatusEvent } from '../../../../shared/contracts/whatsapp-message-status.contract';
import { UpdateMessageFromStatusEventUseCase } from '../../../../app/use-cases/update-message-from-status-event.use-case';

@Controller()
export class WhatsappMessageStatusConsumer {
  private readonly logger = new Logger(WhatsappMessageStatusConsumer.name);

  constructor(
    private readonly updateMessageFromStatusEventUseCase: UpdateMessageFromStatusEventUseCase,
  ) {}

  @EventPattern('whatsapp.message.status')
  async handle(
    @Payload() payload: WhatsappMessageStatusEvent,
    @Ctx() context: KafkaContext,
  ) {
    this.logger.log(
      `Evento ${context.getTopic()} recibido wamid=${payload?.message?.messageId} status=${payload?.message?.status}`,
    );

    await this.updateMessageFromStatusEventUseCase.execute(payload);
  }
}
