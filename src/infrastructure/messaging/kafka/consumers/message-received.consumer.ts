import { Controller, Logger } from '@nestjs/common';
import {
  Ctx,
  EventPattern,
  KafkaContext,
  Payload,
} from '@nestjs/microservices';
import { RegisterIncomingMessageUseCase } from '../../../../app/use-cases/register-incoming-message.use-case';
import type { WhatsappMessageReceivedEvent } from '../../../../shared/contracts/whatsapp-message-received.contract';

@Controller()
export class MessageReceivedConsumer {
  private readonly logger = new Logger(MessageReceivedConsumer.name);

  constructor(
    private readonly registerIncomingMessageUseCase: RegisterIncomingMessageUseCase,
  ) {}

  @EventPattern('whatsapp.message.received')
  async handle(
    @Payload() payload: WhatsappMessageReceivedEvent,
    @Ctx() context: KafkaContext,
  ) {
    const topic = context.getTopic();
    const partition = context.getPartition();
    const offset = context.getMessage().offset;

    this.logger.log(
      `Evento recibido topic=${topic} partition=${partition} messageId=${payload?.message?.messageId}`,
    );

    try {
      await this.registerIncomingMessageUseCase.execute(payload);
    } catch (error) {
      this.logger.error(
        `Error procesando mensaje topic=${topic} partition=${partition} offset=${offset}: ${error.message}`,
        error.stack,
      );
    }
  }
}
