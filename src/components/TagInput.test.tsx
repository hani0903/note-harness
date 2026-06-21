import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TagInput } from './TagInput';

describe('TagInput', () => {
  it('should render "태그 입력 후 Enter" placeholder when tags is []', () => {
    render(<TagInput tags={[]} inputValue="" onInputChange={vi.fn()} onAddTag={vi.fn()} />);

    expect(screen.getByPlaceholderText('태그 입력 후 Enter')).toBeInTheDocument();
  });

  it('should render zero chips when tags is []', () => {
    render(<TagInput tags={[]} inputValue="" onInputChange={vi.fn()} onAddTag={vi.fn()} />);

    expect(screen.queryAllByTestId('tag-chip')).toHaveLength(0);
  });

  it('should render "vue" and "react" chips when tags is ["vue", "react"]', () => {
    render(
      <TagInput tags={['vue', 'react']} inputValue="" onInputChange={vi.fn()} onAddTag={vi.fn()} />,
    );

    expect(screen.getByText('vue')).toBeInTheDocument();
    expect(screen.getByText('react')).toBeInTheDocument();
    expect(screen.getAllByTestId('tag-chip')).toHaveLength(2);
  });

  it('should call onAddTag with "react" when Enter is pressed and inputValue is "react"', async () => {
    const onAddTag = vi.fn();
    const user = userEvent.setup();
    render(<TagInput tags={[]} inputValue="react" onInputChange={vi.fn()} onAddTag={onAddTag} />);

    await user.type(screen.getByPlaceholderText('태그 입력 후 Enter'), '{Enter}');

    expect(onAddTag).toHaveBeenCalledWith('react');
  });

  it('should call onAddTag with "" when Enter is pressed and inputValue is ""', async () => {
    const onAddTag = vi.fn();
    const user = userEvent.setup();
    render(<TagInput tags={[]} inputValue="" onInputChange={vi.fn()} onAddTag={onAddTag} />);

    await user.type(screen.getByPlaceholderText('태그 입력 후 Enter'), '{Enter}');

    expect(onAddTag).toHaveBeenCalledWith('');
  });
});
