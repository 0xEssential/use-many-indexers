import { renderHook } from '@testing-library/react-hooks';
import { useMetadataRescue } from '../src';

describe('useMetadataRescue', () => {
  it('exists', () => {
    renderHook(() => {
      useMetadataRescue();
    });
    expect(true).toEqual(true);
  });
});
