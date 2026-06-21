export function useTagInput(initialTags?: string[]): {
  tags: string[];
  inputValue: string;
  setInputValue: (value: string) => void;
  setTags: (tags: string[]) => void;
  addTag: (value: string) => void;
} {
  void initialTags;
  throw new Error('not implemented');
}
