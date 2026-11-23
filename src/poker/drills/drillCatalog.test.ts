import { describe, expect, test } from 'vitest';

import { describeDrillResult } from './drillCatalog';

describe('describeDrillResult', () => {
  test('says when the decision matches the drill', () => {
    expect(describeDrillResult('raise', 'raise', 'Raise the nut low.')).toBe(
      'You chose to raise. That matches this drill. Raise the nut low.',
    );
  });

  test('names the recommended action when the decision differs', () => {
    expect(describeDrillResult('fold', 'raise', 'Raise the nut low.')).toBe(
      'You chose to fold. This drill plays a raise. Raise the nut low.',
    );
  });

  test('keeps a reviewed hand free of a recommended action', () => {
    expect(describeDrillResult('call', null, 'Compare with your note.')).toBe(
      'You chose to call. Compare with your note.',
    );
  });
});
