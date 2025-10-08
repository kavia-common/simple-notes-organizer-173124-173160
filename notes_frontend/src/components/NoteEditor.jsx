import { useEffect, useMemo, useState } from "react";
import { subscribe, getState, updateNote, deleteNote, createNote } from "../lib/storage.ts";
import TagInput from "./TagInput.jsx";
import { marked } from "marked";

/**
 * PUBLIC_INTERFACE
 * NoteEditor
 * Renders the main panel for editing/viewing a note.
 */
export default function NoteEditor() {
  const [state, setState] = useState(getState());
  const [preview, setPreview] = useState(false);

  useEffect(() => subscribe(setState), []);

  const note = useMemo(
    () => state.notes.find((n) => n.id === state.selectedId) || null,
    [state]
  );

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e) => {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key.toLowerCase() === "s") {
        e.preventDefault();
        const el = document.getElementById("save-flash");
        if (el) {
          el.classList.remove("opacity-0");
          void el.offsetWidth;
          setTimeout(() => el.classList.add("opacity-0"), 700);
        }
      } else if (meta && e.key.toLowerCase() === "n") {
        e.preventDefault();
        createNote();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!note) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="o-card p-8 text-center max-w-md">
          <h2 className="text-lg font-semibold mb-2">Welcome to Simple Notes</h2>
          <p className="text-gray-600">
            Create a new note to get started. Your notes will be saved automatically in your browser.
          </p>
          <div className="mt-4">
            <button className="o-btn-primary" onClick={() => createNote()}>New note</button>
          </div>
        </div>
      </div>
    );
  }

  const onTitle = (e) => updateNote(note.id, { title: e.target.value });
  const onContent = (e) => updateNote(note.id, { content: e.target.value });
  const onTags = (tags) => updateNote(note.id, { tags });

  const onDelete = () => {
    const modal = document.getElementById("confirm-modal");
    modal?.classList.remove("hidden");
    const yesListener = () => {
      deleteNote(note.id);
      document.removeEventListener("confirm:yes", yesListener);
      document.removeEventListener("confirm:no", noListener);
    };
    const noListener = () => {
      document.removeEventListener("confirm:yes", yesListener);
      document.removeEventListener("confirm:no", noListener);
    };
    document.addEventListener("confirm:yes", yesListener, { once: true });
    document.addEventListener("confirm:no", noListener, { once: true });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 p-3 border-b border-gray-200">
        <input
          aria-label="Note title"
          className="o-input text-xl font-medium"
          value={note.title}
          onChange={onTitle}
          placeholder="Title"
        />
        <div className="ml-auto flex items-center gap-2">
          <div id="save-flash" className="text-sm text-green-700 bg-green-50 border border-green-200 px-2 py-1 rounded opacity-0 transition-opacity">
            Saved
          </div>
          <button
            className={`o-btn ${preview ? "bg-gray-100" : "bg-primary text-white hover:bg-blue-600"}`}
            onClick={() => setPreview((p) => !p)}
            aria-pressed={preview}
          >
            {preview ? "Edit" : "Preview"}
          </button>
          <button className="o-btn bg-red-500 text-white hover:bg-red-600" onClick={onDelete} aria-label="Delete note">
            Delete
          </button>
        </div>
      </div>
      <div className="p-3 space-y-3 overflow-y-auto">
        <TagInput tags={note.tags} onChange={onTags} />
        {preview ? (
          <div className="o-card p-4 prose max-w-none">
            <div dangerouslySetInnerHTML={{ __html: marked.parse(note.content || "") }} />
          </div>
        ) : (
          <textarea
            aria-label="Note content"
            className="o-input min-h-[50vh]"
            placeholder="Write your note in Markdown..."
            value={note.content}
            onChange={onContent}
          />
        )}
      </div>
    </div>
  );
}
