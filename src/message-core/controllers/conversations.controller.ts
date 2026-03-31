import { Controller, Get, Param } from '@nestjs/common';
import { GetConversationsUseCase } from '../../app/use-cases/get-conversations.use-case';
import { GetConversationMessagesUseCase } from '../../app/use-cases/get-conversation-messages.use-case';
import { ConversationResponseDto } from '../dto/conversation-response.dto';
import { MessageResponseDto } from '../dto/message-response.dto';

@Controller('conversations')
export class ConversationsController {
  constructor(
    private readonly getConversationsUseCase: GetConversationsUseCase,
    private readonly getConversationMessagesUseCase: GetConversationMessagesUseCase,
  ) {}

  @Get()
  async getConversations(): Promise<ConversationResponseDto[]> {
    const conversations = await this.getConversationsUseCase.execute();

    return conversations.map((item) => ({
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
    }));
  }

  @Get(':externalId/messages')
  async getMessages(
    @Param('externalId') externalId: string,
  ): Promise<MessageResponseDto[]> {
    const messages =
      await this.getConversationMessagesUseCase.execute(externalId);

    return messages.map((item) => ({
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
    }));
  }
}
