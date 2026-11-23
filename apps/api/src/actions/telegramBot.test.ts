import type { Telegraf } from 'telegraf';
import { launchWithRetry } from './telegramBot';

jest.mock('../db/client', () => ({ prisma: {} }));

describe('launchWithRetry', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });
  afterEach(() => jest.useRealTimers());

  it('survives launch failures (e.g. 409 Conflict during a deploy) and retries until it connects', async () => {
    const launch = jest
      .fn()
      .mockRejectedValueOnce(new Error('409: Conflict: terminated by other getUpdates request'))
      .mockRejectedValueOnce(new Error('409: Conflict'))
      .mockResolvedValue(undefined);
    const bot = { launch } as unknown as Telegraf;

    launchWithRetry(bot, 1000);
    await Promise.resolve(); // let the first rejection be handled
    expect(launch).toHaveBeenCalledTimes(1);

    await jest.advanceTimersByTimeAsync(1000);
    expect(launch).toHaveBeenCalledTimes(2);

    await jest.advanceTimersByTimeAsync(1000);
    expect(launch).toHaveBeenCalledTimes(3);

    await jest.advanceTimersByTimeAsync(5000);
    expect(launch).toHaveBeenCalledTimes(3); // connected, so no more retries
  });
});
