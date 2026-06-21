export interface TagInputProps {
  tags: string[];
  inputValue: string;
  onInputChange: (value: string) => void;
  onAddTag: (value: string) => void;
  placeholder?: string;
}

export function TagInput({
  tags,
  inputValue,
  onInputChange,
  onAddTag,
  placeholder = '태그 입력 후 Enter',
}: TagInputProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {tags.map((tag) => (
        <span
          key={tag}
          data-testid="tag-chip"
          className="rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground"
        >
          {tag}
        </span>
      ))}
      <input
        type="text"
        value={inputValue}
        onChange={(e) => onInputChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            onAddTag(inputValue);
          }
        }}
        placeholder={placeholder}
        className="flex-1 min-w-[8rem] text-sm text-foreground bg-transparent border-none outline-none placeholder:text-muted-foreground/50"
      />
    </div>
  );
}
