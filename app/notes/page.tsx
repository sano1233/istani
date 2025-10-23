import { createClient } from '@/utils/supabase/server';

import type { SupabaseClient } from '@supabase/supabase-js';

type Note = {
  id: string;
  title: string | null;
  content: string | null;
  created_at: string | null;
  updated_at?: string | null;
};

type NotesFetchResult = {
  notes: Note[];
  errorMessage: string | null;
};

async function fetchNotes(client: SupabaseClient): Promise<NotesFetchResult> {
  try {
    const { data, error } = await client
      .from<Note>('notes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to load notes from Supabase:', error);
      return { notes: [], errorMessage: 'Unable to load notes at the moment.' };
    }

    return { notes: data ?? [], errorMessage: null };
  } catch (error) {
    console.error('Unexpected error while loading notes:', error);
    return { notes: [], errorMessage: 'Something went wrong while loading notes.' };
  }
}

function formatTimestamp(value: string | null): string {
  if (!value) {
    return 'Unknown date';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(date);
}

export default async function NotesPage() {
  let errorMessage: string | null = null;
  let notes: Note[] = [];

  try {
    const supabase = await createClient();
    const result = await fetchNotes(supabase);
    notes = result.notes;
    errorMessage = result.errorMessage;
  } catch (error) {
    console.error('Unable to initialise Supabase client:', error);
    errorMessage = 'Supabase is not configured. Please check your environment variables.';
  }

  if (errorMessage) {
    return (
      <section className="mx-auto flex max-w-2xl flex-col gap-4 p-6">
        <header>
          <h1 className="text-3xl font-semibold text-zinc-900">Notes</h1>
          <p className="mt-1 text-sm text-zinc-600">Stay tuned while we fetch your latest notes.</p>
        </header>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {errorMessage}
        </div>
      </section>
    );
  }

  if (notes.length === 0) {
    return (
      <section className="mx-auto flex max-w-2xl flex-col gap-4 p-6">
        <header>
          <h1 className="text-3xl font-semibold text-zinc-900">Notes</h1>
          <p className="mt-1 text-sm text-zinc-600">Create your first note to get started.</p>
        </header>
        <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-6 text-center text-sm text-zinc-600">
          There are no notes to display right now.
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto flex max-w-2xl flex-col gap-6 p-6">
      <header>
        <h1 className="text-3xl font-semibold text-zinc-900">Notes</h1>
        <p className="mt-1 text-sm text-zinc-600">A snapshot of the latest entries stored in Supabase.</p>
      </header>
      <div className="flex flex-col gap-4">
        {notes.map(note => (
          <article
            key={note.id}
            className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:shadow-md"
          >
            <div className="flex flex-col gap-1">
              <h2 className="text-xl font-medium text-zinc-900">
                {note.title?.trim() || 'Untitled note'}
              </h2>
              <p className="text-xs uppercase tracking-wide text-zinc-500">
                Last updated {formatTimestamp(note.updated_at ?? note.created_at)}
              </p>
            </div>
            {note.content && (
              <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-zinc-700">
                {note.content}
              </p>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
