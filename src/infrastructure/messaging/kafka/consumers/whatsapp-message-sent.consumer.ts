import { Controller, Logger } from '@nestjs/common';
import {
  Ctx,
  EventPattern,
  KafkaContext,
  Payload,
} from '@nestjs/microservices';
import type { WhatsappMessageSentEvent } from '../../../../shared/contracts/whatsapp-message-sent.contract';
import { RegisterSentOutboundMessageUseCase } from '../../../../app/use-cases/register-sent-outbound-message.use-case';

@Controller()
export class WhatsappMessageSentConsumer {
  private readonly logger = new Logger(WhatsappMessageSentConsumer.name);

  constructor(
    private readonly registerSentOutboundMessageUseCase: RegisterSentOutboundMessageUseCase,
  ) {}

  @EventPattern('whatsapp.message.sent')
  async handle(
    @Payload() payload: WhatsappMessageSentEvent,
    @Ctx() context: KafkaContext,
  ) {
    const topic = context.getTopic();
    const partition = context.getPartition();
    const offset = context.getMessage().offset;

    this.logger.log(
      `Evento ${topic} recibido originalEventId=${payload.originalEventId}`,
    );

    try {
      await this.registerSentOutboundMessageUseCase.execute(payload);
    } catch (error) {
      this.logger.error(
        `Error procesando mensaje topic=${topic} partition=${partition} offset=${offset}: ${error.message}`,
        error.stack,
      );
    }
  }
}
