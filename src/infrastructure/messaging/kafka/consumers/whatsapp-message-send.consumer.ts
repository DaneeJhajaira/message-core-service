import { Controller, Logger } from '@nestjs/common';
import { Ctx, EventPattern, KafkaContext, Payload } from '@nestjs/microservices';
import { RegisterPendingOutboundMessageUseCase } from '../../../../app/use-cases/register-pending-outbound-message.use-case';
import type { WhatsappMessageSendEvent } from '../../../../shared/contracts/whatsapp-message-send.contract';

@Controller()
export class WhatsappMessageSendConsumer {
  private readonly logger = new Logger(WhatsappMessageSendConsumer.name);

  constructor(
    private readonly registerPendingOutboundMessageUseCase: RegisterPendingOutboundMessageUseCase,
  ) {}

  @EventPattern('whatsapp.message.send')
  async handle(
    @Payload() payload: WhatsappMessageSendEvent,
    @Ctx() context: KafkaContext,
  ) {
    this.logger.log(
      `Evento ${context.getTopic()} recibido para originalEventId=${payload.eventId}`,
    );

    await this.registerPendingOutboundMessageUseCase.execute(payload);
  }
}