import { NotFoundException } from '@nestjs/common';
import { GetConversationContextUseCase } from './get-conversation-context.use-case';

describe('GetConversationContextUseCase', () => {
  let useCase: GetConversationContextUseCase;
  let conversationRepo: { findOne: jest.Mock };
  let messageRepo: { createQueryBuilder: jest.Mock };

  const mockQb = {
    select: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getRawOne: jest.fn(),
  };

  beforeEach(() => {
    conversationRepo = { findOne: jest.fn() };
    messageRepo = { createQueryBuilder: jest.fn().mockReturnValue(mockQb) };

    useCase = new GetConversationContextUseCase(
      conversationRepo as any,
      messageRepo as any,
    );

    jest.restoreAllMocks();
    mockQb.select.mockReturnThis();
    mockQb.where.mockReturnThis();
    mockQb.andWhere.mockReturnThis();
  });

  it('debe lanzar NotFoundException si la conversación no existe', async () => {
    conversationRepo.findOne.mockResolvedValue(null);

    await expect(useCase.execute('no-existe')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('debe retornar ventana cerrada si no hay mensajes inbound', async () => {
    conversationRepo.findOne.mockResolvedValue({ id: 1, externalId: 'conv-1' });
    mockQb.getRawOne.mockResolvedValue({ lastInboundAt: null });

    const result = await useCase.execute('conv-1');

    expect(result).toEqual({
      externalId: 'conv-1',
      lastInboundAt: null,
      isWithin24h: false,
      windowExpiresAt: null,
      mustUseTemplate: true,
    });
  });

  it('debe retornar isWithin24h=true si el último inbound fue hace menos de 24h', async () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    conversationRepo.findOne.mockResolvedValue({ id: 1, externalId: 'conv-2' });
    mockQb.getRawOne.mockResolvedValue({
      lastInboundAt: twoHoursAgo.toISOString(),
    });

    const result = await useCase.execute('conv-2');

    expect(result.externalId).toBe('conv-2');
    expect(result.lastInboundAt).toEqual(twoHoursAgo);
    expect(result.isWithin24h).toBe(true);
    expect(result.mustUseTemplate).toBe(false);
    expect(result.windowExpiresAt).toEqual(
      new Date(twoHoursAgo.getTime() + 24 * 60 * 60 * 1000),
    );
  });

  it('debe retornar isWithin24h=false si el último inbound fue hace más de 24h', async () => {
    const thirtyHoursAgo = new Date(Date.now() - 30 * 60 * 60 * 1000);
    conversationRepo.findOne.mockResolvedValue({ id: 1, externalId: 'conv-3' });
    mockQb.getRawOne.mockResolvedValue({
      lastInboundAt: thirtyHoursAgo.toISOString(),
    });

    const result = await useCase.execute('conv-3');

    expect(result.isWithin24h).toBe(false);
    expect(result.mustUseTemplate).toBe(true);
    expect(result.windowExpiresAt).toEqual(
      new Date(thirtyHoursAgo.getTime() + 24 * 60 * 60 * 1000),
    );
  });

  it('debe retornar isWithin24h=false en el límite exacto de 24h', async () => {
    const exactly24hAgo = new Date(Date.now() - 24 * 60 * 60 * 1000 - 1);
    conversationRepo.findOne.mockResolvedValue({ id: 1, externalId: 'conv-4' });
    mockQb.getRawOne.mockResolvedValue({
      lastInboundAt: exactly24hAgo.toISOString(),
    });

    const result = await useCase.execute('conv-4');

    expect(result.isWithin24h).toBe(false);
    expect(result.mustUseTemplate).toBe(true);
  });
});
