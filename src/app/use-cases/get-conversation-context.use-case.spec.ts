import { NotFoundException } from '@nestjs/common';
import { GetConversationContextUseCase } from './get-conversation-context.use-case';

describe('GetConversationContextUseCase', () => {
  let useCase: GetConversationContextUseCase;
  let conversationRepo: { findOne: jest.Mock };
  let messageRepo: { createQueryBuilder: jest.Mock };

  const mockQb = {
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    setParameters: jest.fn().mockReturnThis(),
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
    mockQb.addSelect.mockReturnThis();
    mockQb.where.mockReturnThis();
    mockQb.setParameters.mockReturnThis();
  });

  it('debe lanzar NotFoundException si la conversación no existe', async () => {
    conversationRepo.findOne.mockResolvedValue(null);

    await expect(useCase.execute('no-existe')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('debe retornar ventana cerrada si no hay mensajes inbound ni templates', async () => {
    conversationRepo.findOne.mockResolvedValue({ id: 1, externalId: 'conv-1' });
    mockQb.getRawOne.mockResolvedValue({
      lastInboundAt: null,
      lastTemplateSentAt: null,
    });

    const result = await useCase.execute('conv-1');

    expect(result).toEqual({
      externalId: 'conv-1',
      lastInboundAt: null,
      lastTemplateSentAt: null,
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
      lastTemplateSentAt: null,
    });

    const result = await useCase.execute('conv-2');

    expect(result.externalId).toBe('conv-2');
    expect(result.lastInboundAt).toEqual(twoHoursAgo);
    expect(result.lastTemplateSentAt).toBeNull();
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
      lastTemplateSentAt: null,
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
      lastTemplateSentAt: null,
    });

    const result = await useCase.execute('conv-4');

    expect(result.isWithin24h).toBe(false);
    expect(result.mustUseTemplate).toBe(true);
  });

  it('debe retornar lastTemplateSentAt cuando existe un template outbound exitoso', async () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const oneHourAgo = new Date(Date.now() - 1 * 60 * 60 * 1000);
    conversationRepo.findOne.mockResolvedValue({ id: 1, externalId: 'conv-5' });
    mockQb.getRawOne.mockResolvedValue({
      lastInboundAt: twoHoursAgo.toISOString(),
      lastTemplateSentAt: oneHourAgo.toISOString(),
    });

    const result = await useCase.execute('conv-5');

    expect(result.lastTemplateSentAt).toEqual(oneHourAgo);
    expect(result.lastInboundAt).toEqual(twoHoursAgo);
    expect(result.isWithin24h).toBe(true);
    expect(result.mustUseTemplate).toBe(false);
  });

  it('debe retornar lastTemplateSentAt incluso si la ventana 24h está cerrada', async () => {
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
    const thirtyHoursAgo = new Date(Date.now() - 30 * 60 * 60 * 1000);
    conversationRepo.findOne.mockResolvedValue({ id: 1, externalId: 'conv-6' });
    mockQb.getRawOne.mockResolvedValue({
      lastInboundAt: fortyEightHoursAgo.toISOString(),
      lastTemplateSentAt: thirtyHoursAgo.toISOString(),
    });

    const result = await useCase.execute('conv-6');

    expect(result.lastTemplateSentAt).toEqual(thirtyHoursAgo);
    expect(result.isWithin24h).toBe(false);
    expect(result.mustUseTemplate).toBe(true);
  });

  it('debe retornar lastTemplateSentAt sin inbound (solo template enviado)', async () => {
    const fiveHoursAgo = new Date(Date.now() - 5 * 60 * 60 * 1000);
    conversationRepo.findOne.mockResolvedValue({ id: 1, externalId: 'conv-7' });
    mockQb.getRawOne.mockResolvedValue({
      lastInboundAt: null,
      lastTemplateSentAt: fiveHoursAgo.toISOString(),
    });

    const result = await useCase.execute('conv-7');

    expect(result.lastInboundAt).toBeNull();
    expect(result.lastTemplateSentAt).toEqual(fiveHoursAgo);
    expect(result.isWithin24h).toBe(false);
    expect(result.mustUseTemplate).toBe(true);
  });
});
