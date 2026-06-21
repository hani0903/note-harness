import type { ReactElement } from 'react';

export interface TagInputProps {
  tags: string[];
  inputValue: string;
  onInputChange: (value: string) => void;
  onAddTag: (value: string) => void;
  placeholder?: string;
}

export function TagInput(props: TagInputProps): ReactElement {
  void props;
  throw new Error('not implemented');
}
