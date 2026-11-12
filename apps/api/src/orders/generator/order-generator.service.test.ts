import { BadGatewayException, Logger, ServiceUnavailableException } from '@nestjs/common';
import { LambdaClient } from '@aws-sdk/client-lambda';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { OrderGeneratorService } from './order-generator.service';

function setup() {
  const orders = { clearStatsCache: vi.fn(), findByNumber: vi.fn() };
  const send = vi.spyOn(LambdaClient.prototype, 'send');
  const service = new OrderGeneratorService(orders as never);
  return { orders, send, service };
}

function payload(value: unknown) {
  return new TextEncoder().encode(JSON.stringify(value));
}

describe('OrderGeneratorService', () => {
  beforeEach(() => {
    vi.stubEnv('GENERATOR_LAMBDA_NAME', 'order-generator');
    vi.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('returns 503 when the lambda name is not configured', async () => {
    vi.stubEnv('GENERATOR_LAMBDA_NAME', '');
    const { send, service } = setup();

    await expect(service.generate()).rejects.toBeInstanceOf(ServiceUnavailableException);
    expect(send).not.toHaveBeenCalled();
  });

  it('invokes the lambda, clears the stats cache and returns the new order', async () => {
    const { orders, send, service } = setup();
    send.mockResolvedValue({ Payload: payload({ number: 'FR001777' }) } as never);
    orders.findByNumber.mockResolvedValue({ number: 'FR001777' });

    expect(await service.generate()).toEqual({ number: 'FR001777' });
    expect(send.mock.calls[0][0].input).toEqual({ FunctionName: 'order-generator' });
    expect(orders.clearStatsCache).toHaveBeenCalled();
    expect(orders.findByNumber).toHaveBeenCalledWith('FR001777');
  });

  it('returns 502 when the lambda reports an error', async () => {
    const { orders, send, service } = setup();
    send.mockResolvedValue({ FunctionError: 'Unhandled', Payload: payload({ errorMessage: 'OpenAI timeout' }) } as never);

    await expect(service.generate()).rejects.toBeInstanceOf(BadGatewayException);
    expect(orders.clearStatsCache).not.toHaveBeenCalled();
  });

  it('returns 502 when the lambda cannot be called', async () => {
    const { send, service } = setup();
    send.mockRejectedValue(new Error('AccessDenied'));

    await expect(service.generate()).rejects.toBeInstanceOf(BadGatewayException);
  });
});
