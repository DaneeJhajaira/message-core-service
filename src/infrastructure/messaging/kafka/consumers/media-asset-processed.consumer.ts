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
    this.logger.log(
      `Evento media.asset.processed recibido topic=${context.getTopic()} messageId=${payload?.mediaJob?.messageId}`,
    );

    await this.updateMessageMediaFromProcessedEventUseCase.execute(payload);
  }
}
