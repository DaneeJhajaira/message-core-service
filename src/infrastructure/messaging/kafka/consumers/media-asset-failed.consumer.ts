import { Controller, Logger } from '@nestjs/common';
import {
  Ctx,
  EventPattern,
  KafkaContext,
  Payload,
} from '@nestjs/microservices';
import type { MediaAssetFailedEvent } from '../../../../shared/contracts/media-asset-failed.contract';
import { UpdateMessageMediaFromFailedEventUseCase } from '../../../../app/use-cases/update-message-media-from-failed-event.use-case';

@Controller()
export class MediaAssetFailedConsumer {
  private readonly logger = new Logger(MediaAssetFailedConsumer.name);

  constructor(
    private readonly updateMessageMediaFromFailedEventUseCase: UpdateMessageMediaFromFailedEventUseCase,
  ) {}

  @EventPattern('media.asset.failed')
  async handle(
    @Payload() payload: MediaAssetFailedEvent,
    @Ctx() context: KafkaContext,
  ) {
    const topic = context.getTopic();
    const partition = context.getPartition();
    const offset = context.getMessage().offset;

    this.logger.log(
      `Evento media.asset.failed recibido topic=${topic} messageId=${payload?.mediaJob?.messageId}`,
    );

    try {
      await this.updateMessageMediaFromFailedEventUseCase.execute(payload);
    } catch (error) {
      this.logger.error(
        `Error procesando mensaje topic=${topic} partition=${partition} offset=${offset}: ${error.message}`,
        error.stack,
      );
    }
  }
}
