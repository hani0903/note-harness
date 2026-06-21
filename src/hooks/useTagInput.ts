import { useState } from 'react';

export function useTagInput(initialTags: string[] = []): {
  tags: string[];
  inputValue: string;
  setInputValue: (value: string) => void;
  setTags: (tags: string[]) => void;
  addTag: (value: string) => void;
} {
  const [tags, setTags] = useState<string[]>(initialTags);
  const [inputValue, setInputValue] = useState('');

  const addTag = (value: string) => {
    setTags((prev) => [...prev, value]);
    setInputValue('');
  };

  return { tags, inputValue, setInputValue, setTags, addTag };
}
