import { describe, expect, it } from 'vitest';
import type { OrderCard } from './api';
import { formatMoney, formatPallets } from './format';

function pallets(std: number, xl: number): OrderCard {
  return { pallets: { std, xl } } as OrderCard;
}

describe('format', () => {
  it('formats cents as dollars', () => {
    expect(formatMoney(71800)).toBe('$718.00');
    expect(formatMoney(123456)).toBe('$1,234.56');
    expect(formatMoney(0)).toBe('$0.00');
  });

  it('formats pallets by type', () => {
    expect(formatPallets(pallets(15, 3))).toBe('15 × Std + 3 × XL');
    expect(formatPallets(pallets(0, 10))).toBe('10 × XL');
    expect(formatPallets(pallets(23, 0))).toBe('23 × Standard');
  });
});
