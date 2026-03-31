import { Controller, Get, Param, Query } from '@nestjs/common';
import { GetConversationsUseCase } from '../../app/use-cases/get-conversations.use-case';
import {
  GetConversationMessagesUseCase,
  MessageCursor,
} from '../../app/use-cases/get-conversation-messages.use-case';
import { ConversationResponseDto } from '../dto/conversation-response.dto';
import { MessageResponseDto } from '../dto/message-response.dto';
import { PaginatedResponseDto } from '../../shared/dto/paginated-response.dto';
import { CursorPaginatedResponseDto } from '../../shared/dto/cursor-paginated-response.dto';

@Controller('conversations')
export class ConversationsController {
  constructor(
    private readonly getConversationsUseCase: GetConversationsUseCase,
    private readonly getConversationMessagesUseCase: GetConversationMessagesUseCase,
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

    const lastItem = data[data.length - 1];
    const nextCursor =
      hasMore && lastItem
        ? Buffer.from(
            JSON.stringify({
              t: lastItem.messageTimestamp.toISOString(),
              id: lastItem.id,
            }),
          ).toString('base64')
        : null;

    return {
      data: data.map((item) => ({
        id: item.id,
        conversationId: item.conversationId,
        contactId: item.contactId,
        messageId: item.messageId,
        originalEventId: item.originalEventId,
        direction: item.direction,
        messageType: item.messageType,
        body: item.body,
        providerName: item.providerName,
        providerPhoneNumberId: item.providerPhoneNumberId,
        agentId: item.agentId,
        providerMediaId: item.providerMediaId,
        mediaAssetId: item.mediaAssetId,
        mediaStatus: item.mediaStatus,
        mediaUrl: item.mediaUrl,
        mediaMimeType: item.mediaMimeType,
        mediaStorageBucket: item.mediaStorageBucket,
        mediaStorageObjectKey: item.mediaStorageObjectKey,
        mediaErrorMessage: item.mediaErrorMessage,
        errorMessage: item.errorMessage,
        status: item.status,
        deliveredAt: item.deliveredAt,
        readAt: item.readAt,
        messageTimestamp: item.messageTimestamp,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })),
      total,
      limit,
      nextCursor,
      hasMore,
    };
  }
}
