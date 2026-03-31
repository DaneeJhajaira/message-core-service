import { Controller, Logger } from '@nestjs/common';
import {
  Ctx,
  EventPattern,
  KafkaContext,
  Payload,
} from '@nestjs/microservices';
import type { MediaAssetProcessedEvent } from '../../../../shared/contracts/media-asset-processed.contract';
import { UpdateMessageMediaFromProcessedEventUseCase } from '../../../../app/use-cases/update-message-media-from-processed-event.use-case';

@Controller()
export class MediaAssetProcessedConsumer {
  private readonly logger = new Logger(MediaAssetProcessedConsumer.name);

  constructor(
    private readonly updateMessageMediaFromProcessedEventUseCase: UpdateMessageMediaFromProcessedEventUseCase,
  ) {}

  @EventPattern('media.asset.processed')
  async handle(
    @Payload() payload: MediaAssetProcessedEvent,
    @Ctx() context: KafkaContext,
  ) {
    const topic = context.getTopic();
    const partition = context.getPartition();
    const offset = context.getMessage().offset;

    this.logger.log(
      `Evento media.asset.processed recibido topic=${topic} messageId=${payload?.mediaJob?.messageId}`,
    );

    try {
      await this.updateMessageMediaFromProcessedEventUseCase.execute(payload);
    } catch (error) {
      this.logger.error(
        `Error procesando mensaje topic=${topic} partition=${partition} offset=${offset}: ${error.message}`,
        error.stack,
      );
    }
  }
}
