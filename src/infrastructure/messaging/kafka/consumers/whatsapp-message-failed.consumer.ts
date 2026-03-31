import { Controller, Logger } from '@nestjs/common';
import {
  Ctx,
  EventPattern,
  KafkaContext,
  Payload,
} from '@nestjs/microservices';
import type { WhatsappMessageFailedEvent } from '../../../../shared/contracts/whatsapp-message-failed.contract';
import { RegisterFailedOutboundMessageUseCase } from '../../../../app/use-cases/register-failed-outbound-message.use-case';

@Controller()
export class WhatsappMessageFailedConsumer {
  private readonly logger = new Logger(WhatsappMessageFailedConsumer.name);

  constructor(
    private readonly registerFailedOutboundMessageUseCase: RegisterFailedOutboundMessageUseCase,
  ) {}

  @EventPattern('whatsapp.message.failed')
  async handle(
    @Payload() payload: WhatsappMessageFailedEvent,
    @Ctx() context: KafkaContext,
  ) {
    const topic = context.getTopic();
    const partition = context.getPartition();
    const offset = context.getMessage().offset;

    this.logger.log(
      `Evento ${topic} recibido originalEventId=${payload.originalEventId}`,
    );

    try {
      await this.registerFailedOutboundMessageUseCase.execute(payload);
    } catch (error) {
      this.logger.error(
        `Error procesando mensaje topic=${topic} partition=${partition} offset=${offset}: ${error.message}`,
        error.stack,
      );
    }
  }
}
