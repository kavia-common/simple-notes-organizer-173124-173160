import { useState } from "react";
import clsx from "clsx";

/**
 * PUBLIC_INTERFACE
 * TagInput
 * Props:
 *  - tags: string[]
 *  - onChange: (tags: string[]) => void
 */
export default function TagInput({ tags, onChange }) {
  const [value, setValue] = useState("");

  const addTag = (t) => {
    const tag = t.trim();
    if (!tag) return;
    if (tags.includes(tag)) {
      setValue("");
      return;
    }
    onChange([...tags, tag]);
    setValue("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(value);
    } else if (e.key === "Backspace" && !value && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  };

  const removeTag = (t) => {
    onChange(tags.filter((x) => x !== t));
  };

  return (
    <div className="o-card p-2 flex flex-wrap items-center gap-2">
      {tags.map((t) => (
        <span key={t} className="o-tag">
          {t}
          <button
            aria-label={`Remove tag ${t}`}
            onClick={() => removeTag(t)}
            className={clsx("text-blue-700/70 hover:text-blue-800")}
          >
            ×
          </button>
        </span>
      ))}
      <input
        aria-label="Add tag"
        className="flex-1 min-w-[140px] outline-none border-0 focus:ring-0 px-1 py-1"
        placeholder="Add tag and press Enter"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => addTag(value)}
      />
    </div>
  );
}
