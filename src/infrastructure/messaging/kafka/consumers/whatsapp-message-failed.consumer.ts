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
    this.logger.log(
      `Evento ${context.getTopic()} recibido originalEventId=${payload.originalEventId}`,
    );

    await this.registerFailedOutboundMessageUseCase.execute(payload);
  }
}
