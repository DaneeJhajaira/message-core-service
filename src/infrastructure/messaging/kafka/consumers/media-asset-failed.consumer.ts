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
    this.logger.log(
      `Evento media.asset.failed recibido topic=${context.getTopic()} messageId=${payload?.mediaJob?.messageId}`,
    );

    await this.updateMessageMediaFromFailedEventUseCase.execute(payload);
  }
}
