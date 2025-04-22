import { describe, it, expect, vi, beforeAll } from 'vitest';

import * as fetcher from '../utils/fetcher.js';
import { AttomService } from '../services/attomService.js';
import { endpoints } from '../config/endpointConfig.js';

// Helper to create minimal dummy params for a given set of required params
function buildDummyParams(required: string[]): Record<string, any> {
  const map: Record<string, any> = {
    address1: '123 Main St',
    address2: 'Anytown, CA 90210',
    street: '123 Main St',
    city: 'Anytown',
    county: '-',
    state: 'CA',
    zip: '90210',
    attomid: '184713191',
    geoIdV4: 'abcdef123456',
    id: '123456',
    format: 'geojson',
    categoryName: 'EDUCATION',
    radius: 5,
  };

  return required.reduce<Record<string, any>>((acc, param) => {
    if (map[param] !== undefined) {
      acc[param] = map[param];
    } else {
      acc[param] = 'test';
    }
    return acc;
  }, {});
}

describe('Endpoint coverage – executes every configured endpoint', () => {
  const fetchMock = vi.spyOn(fetcher, 'fetchAttom');
  const service = new AttomService();

  beforeAll(() => {
    fetchMock.mockResolvedValue({ ok: true });
  });

  const excluded = new Set([
    'salesComparablesAddress',
    'salesComparablesPropId', // Have dedicated tests already
  ]);

  for (const [key, cfg] of Object.entries(endpoints)) {
    if (excluded.has(key)) continue;

    it(`executes ${key}`, async () => {
      const params = buildDummyParams(cfg.requiredParams);
      await expect(service.executeQuery(key, params)).resolves.not.toThrow();
      expect(fetchMock).toHaveBeenCalled();
    });
  }
});
