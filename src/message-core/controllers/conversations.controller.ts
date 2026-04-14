import { Controller, Get, Param, Query } from '@nestjs/common';
import { GetConversationsUseCase } from '../../app/use-cases/get-conversations.use-case';
import {
  GetConversationMessagesUseCase,
  MessageCursor,
} from '../../app/use-cases/get-conversation-messages.use-case';
import { GetConversationContextUseCase } from '../../app/use-cases/get-conversation-context.use-case';
import { ConversationResponseDto } from '../dto/conversation-response.dto';
import { MessageResponseDto, MessageTemplateButtonDto } from '../dto/message-response.dto';
import { ConversationContextResponseDto } from '../dto/conversation-context-response.dto';
import { PaginatedResponseDto } from '../../shared/dto/paginated-response.dto';
import { CursorPaginatedResponseDto } from '../../shared/dto/cursor-paginated-response.dto';

@Controller('conversations')
export class ConversationsController {
  constructor(
    private readonly getConversationsUseCase: GetConversationsUseCase,
    private readonly getConversationMessagesUseCase: GetConversationMessagesUseCase,
    private readonly getConversationContextUseCase: GetConversationContextUseCase,
  ) {}

  @Get()
  async getConversations(
    @Query('limit') limitParam?: string,
    @Query('offset') offsetParam?: string,
  ): Promise<PaginatedResponseDto<ConversationResponseDto>> {
    const limit = Math.min(Math.max(Number(limitParam) || 10, 1), 50);
    const offset = Math.max(Number(offsetParam) || 0, 0);

    const { data, total } = await this.getConversationsUseCase.execute({
      limit,
      offset,
    });

    return {
      data: data.map((item) => ({
        id: item.id,
        contactId: item.contactId,
        externalId: item.externalId,
        status: item.status,
        lastMessageAt: item.lastMessageAt,
        lastMessageId: item.lastMessageId,
        lastMessagePreview: item.lastMessagePreview,
        lastMessageType: item.lastMessageType,
        lastMessageDirection: item.lastMessageDirection,
        unreadCount: item.unreadCount,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })),
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    };
  }

  @Get(':externalId/context')
  async getContext(
    @Param('externalId') externalId: string,
  ): Promise<ConversationContextResponseDto> {
    return this.getConversationContextUseCase.execute(externalId);
  }

  @Get(':externalId/messages')
  async getMessages(
    @Param('externalId') externalId: string,
    @Query('limit') limitParam?: string,
    @Query('cursor') cursorParam?: string,
  ): Promise<CursorPaginatedResponseDto<MessageResponseDto>> {
    const limit = Math.min(Math.max(Number(limitParam) || 30, 1), 100);

    let cursor: MessageCursor | undefined;
    if (cursorParam) {
      const decoded = JSON.parse(
        Buffer.from(cursorParam, 'base64').toString('utf-8'),
      );
      cursor = { timestamp: decoded.t, id: decoded.id };
    }

    const { data, total, hasMore } =
      await this.getConversationMessagesUseCase.execute(externalId, {
        limit,
        cursor,
      });

    const oldestItem = data[0];
    const nextCursor =
      hasMore && oldestItem
        ? Buffer.from(
            JSON.stringify({
              t: oldestItem.messageTimestamp.toISOString(),
              id: oldestItem.id,
            }),
          ).toString('base64')
        : null;

    return {
      data: data.map((item) => ({
        id: item.id,
        messageId: item.messageId,
        direction: item.direction as 'inbound' | 'outbound',
        status: item.status,
        timestamp: item.messageTimestamp,
        content: {
          type: item.messageType,
          body: item.body,
          template: item.messageTemplate
            ? {
                name: item.messageTemplate.name,
                language: item.messageTemplate.language,
                header: item.messageTemplate.headerType
                  ? {
                      type: item.messageTemplate.headerType,
                      text: item.messageTemplate.headerText ?? undefined,
                      mediaId: item.messageTemplate.headerMediaId ?? undefined,
                      mediaUrl: item.messageTemplate.headerMediaUrl ?? undefined,
                      location: item.messageTemplate.headerLocation ?? undefined,
                    }
                  : null,
                body: item.messageTemplate.body,
                footer: item.messageTemplate.footer ?? null,
                buttons: (item.messageTemplate.buttons as MessageTemplateButtonDto[]) ?? null,
              }
            : null,
        },
        media: item.mediaAssetId || item.mediaStatus
          ? {
              assetId: item.mediaAssetId,
              status: item.mediaStatus,
              mimeType: item.mediaMimeType,
            }
          : null,
        error: item.errorMessage
          ? { message: item.errorMessage }
          : null,
      })),
      total,
      limit,
      nextCursor,
      hasMore,
    };
  }
}
