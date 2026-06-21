import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NoteEditor } from './NoteEditor';
import type { Note } from '../types/note';

const { createNote, updateNote, mockState } = vi.hoisted(() => ({
  createNote: vi.fn(),
  updateNote: vi.fn(),
  mockState: { notes: [] as Note[] },
}));

vi.mock('../context/NotesContext', () => ({
  useNotes: () => ({
    notes: mockState.notes,
    loading: false,
    error: null,
    createNote,
    updateNote,
    deleteNote: vi.fn(),
  }),
}));

function makeNote(overrides: Partial<Note>): Note {
  return {
    id: '1',
    title: 'title',
    content: 'content',
    tags: [],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  } as Note;
}

describe('NoteEditor', () => {
  beforeEach(() => {
    createNote.mockReset();
    updateNote.mockReset();
    mockState.notes = [];
  });

  it('should render TagInput below the content textarea when the editor is open', () => {
    render(<NoteEditor selectedNoteId={null} isCreating={true} onDone={vi.fn()} />);

    const textarea = screen.getByPlaceholderText('내용을 입력하세요...');
    const tagInput = screen.getByPlaceholderText('태그 입력 후 Enter');

    expect(
      textarea.compareDocumentPosition(tagInput) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it('should restore "vue" and "typescript" chips when opening a note whose tags is ["vue", "typescript"]', () => {
    mockState.notes = [makeNote({ id: '1', tags: ['vue', 'typescript'] })];

    render(<NoteEditor selectedNoteId="1" isCreating={false} onDone={vi.fn()} />);

    expect(screen.getByText('vue')).toBeInTheDocument();
    expect(screen.getByText('typescript')).toBeInTheDocument();
  });

  it('should pass tags ["react"] into createNote/updateNote payload when the save button is clicked', async () => {
    const user = userEvent.setup();
    render(<NoteEditor selectedNoteId={null} isCreating={true} onDone={vi.fn()} />);

    await user.type(screen.getByPlaceholderText('제목'), '제목');
    await user.type(screen.getByPlaceholderText('태그 입력 후 Enter'), 'react{Enter}');
    await user.click(screen.getByRole('button', { name: '저장' }));

    expect(createNote).toHaveBeenCalledWith(expect.any(String), expect.any(String), ['react']);
  });

  it('should pass tags ["vue", "react"] into updateNote payload when saving an existing note', async () => {
    const user = userEvent.setup();
    mockState.notes = [makeNote({ id: '1', tags: ['vue'] })];

    render(<NoteEditor selectedNoteId="1" isCreating={false} onDone={vi.fn()} />);

    await user.type(screen.getByPlaceholderText('태그 입력 후 Enter'), 'react{Enter}');
    await user.click(screen.getByRole('button', { name: '저장' }));

    expect(updateNote).toHaveBeenCalledWith(
      '1',
      expect.objectContaining({ tags: ['vue', 'react'] }),
    );
  });

  it('should not call updateNote when another note is selected before saving', () => {
    mockState.notes = [
      makeNote({ id: '1', tags: ['vue'] }),
      makeNote({ id: '2', tags: ['react'] }),
    ];

    const { rerender } = render(
      <NoteEditor selectedNoteId="1" isCreating={false} onDone={vi.fn()} />,
    );
    rerender(<NoteEditor selectedNoteId="2" isCreating={false} onDone={vi.fn()} />);

    expect(updateNote).not.toHaveBeenCalled();
  });

  it('should not call updateNote when a tag is added but then another note is selected before saving', async () => {
    const user = userEvent.setup();
    mockState.notes = [
      makeNote({ id: '1', tags: ['vue'] }),
      makeNote({ id: '2', tags: ['react'] }),
    ];

    const { rerender } = render(
      <NoteEditor selectedNoteId="1" isCreating={false} onDone={vi.fn()} />,
    );

    await user.type(screen.getByPlaceholderText('태그 입력 후 Enter'), 'typescript{Enter}');
    rerender(<NoteEditor selectedNoteId="2" isCreating={false} onDone={vi.fn()} />);

    expect(updateNote).not.toHaveBeenCalled();
  });
});
