import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fetcher from '../utils/fetcher.js';
import { AttomService } from '../services/attomService.js';

// Create a spy on fetchAttom that we can use across tests
const fetchMock = vi.spyOn(fetcher, 'fetchAttom');

describe('AttomService – sales comparables', () => {
  const service = new AttomService();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('retries once for propId query when no comps found', async () => {
    const noCompsErr = new Error('No comps');
    (noCompsErr as any).details = { body: 'Unable to locate a property record' };

    fetchMock.mockRejectedValueOnce(noCompsErr);
    fetchMock.mockResolvedValueOnce({ success: true });

    const result = await service.getSalesComparablesPropId({
      propId: '51593484',
    });

    expect(result).toEqual({ success: true });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
