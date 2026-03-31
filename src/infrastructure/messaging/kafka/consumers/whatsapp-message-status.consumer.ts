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
    const topic = context.getTopic();
    const partition = context.getPartition();
    const offset = context.getMessage().offset;

    this.logger.log(
      `Evento ${topic} recibido wamid=${payload?.message?.messageId} status=${payload?.message?.status}`,
    );

    try {
      await this.updateMessageFromStatusEventUseCase.execute(payload);
    } catch (error) {
      this.logger.error(
        `Error procesando mensaje topic=${topic} partition=${partition} offset=${offset}: ${error.message}`,
        error.stack,
      );
    }
  }
}
