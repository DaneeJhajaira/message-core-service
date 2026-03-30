import { Controller, Get, Param } from '@nestjs/common';
import { CheckConversationAccessUseCase } from '../../app/use-cases/check-conversation-access.use-case';

@Controller('internal/conversations')
export class ConversationAccessController {
  constructor(
    private readonly checkConversationAccessUseCase: CheckConversationAccessUseCase,
  ) {}

  @Get(':externalId/access')
  async checkAccess(@Param('externalId') externalId: string) {
    return this.checkConversationAccessUseCase.execute({
      conversationExternalId: externalId,
    });
  }
}