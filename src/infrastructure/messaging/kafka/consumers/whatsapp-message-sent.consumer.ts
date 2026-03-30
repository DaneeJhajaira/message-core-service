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
    this.logger.log(
      `Evento ${context.getTopic()} recibido originalEventId=${payload.originalEventId}`,
    );

    await this.registerSentOutboundMessageUseCase.execute(payload);
  }
}
