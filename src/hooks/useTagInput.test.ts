import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTagInput } from './useTagInput';

describe('useTagInput', () => {
  it('should initialize tags with ["vue"] when called with initialTags ["vue"]', () => {
    const { result } = renderHook(() => useTagInput(['vue']));

    expect(result.current.tags).toEqual(['vue']);
  });

  it('should initialize tags as [] when initialTags is undefined', () => {
    const { result } = renderHook(() => useTagInput());

    expect(result.current.tags).toEqual([]);
  });

  it('should append "react" to tags and reset inputValue to "" when addTag("react") is called', () => {
    const { result } = renderHook(() => useTagInput([]));

    act(() => {
      result.current.setInputValue('react');
    });
    act(() => {
      result.current.addTag('react');
    });

    expect(result.current.tags).toContain('react');
    expect(result.current.inputValue).toBe('');
  });
});
