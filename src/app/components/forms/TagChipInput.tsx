import { useCallback, useState } from "react";
import { X } from "lucide-react";
import { Input } from "../ui/input";
import { cn } from "../ui/utils";

export interface TagChipInputProps {
  id?: string;
  values: string[];
  onChange: (values: string[]) => void;
  maxTags?: number;
  maxChars?: number;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  "aria-invalid"?: boolean;
}

function dedupePreserveOrder(next: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of next) {
    const t = raw.trim();
    if (!t) continue;
    const key = t.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(t);
  }
  return out;
}

/** Join tags the same way legacy comma fields did, for length/profanity validation. */
export function joinTagsForValidation(tags: string[]): string {
  return tags.join(", ");
}

export function TagChipInput({
  id,
  values,
  onChange,
  maxTags,
  maxChars,
  placeholder = "Add a tag",
  disabled,
  className,
  "aria-invalid": ariaInvalid,
}: TagChipInputProps) {
  const [draft, setDraft] = useState("");

  const commitDraft = useCallback(
    (piece: string) => {
      const segments = piece
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (segments.length === 0) return;

      let merged = [...values];
      for (const seg of segments) {
        if (maxTags != null && merged.length >= maxTags) break;
        merged = dedupePreserveOrder([...merged, seg]);
      }
      if (maxChars != null && joinTagsForValidation(merged).length > maxChars) {
        return;
      }
      onChange(merged);
      setDraft("");
    },
    [maxChars, maxTags, onChange, values],
  );

  const removeAt = (index: number) => {
    onChange(values.filter((_, i) => i !== index));
  };

  return (
    <div
      className={cn(
        "flex min-h-9 w-full flex-wrap gap-1.5 rounded-md border border-input bg-input-background px-2 py-1.5",
        "focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50",
        disabled ? "pointer-events-none opacity-50" : null,
        className,
      )}
    >
      {values.map((tag, index) => (
        <span
          key={`${tag}-${index}`}
          className="inline-flex max-w-full items-center gap-1 rounded-full border border-input bg-muted/60 px-2 py-0.5 text-xs font-medium"
        >
          <span className="truncate">{tag}</span>
          <button
            type="button"
            className="rounded-full p-0.5 text-muted-foreground hover:bg-background hover:text-foreground"
            onClick={() => removeAt(index)}
            aria-label={`Remove ${tag}`}
            disabled={disabled}
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <Input
        id={id}
        disabled={disabled}
        aria-invalid={ariaInvalid}
        placeholder={values.length === 0 ? placeholder : ""}
        value={draft}
        className="h-7 min-w-[8rem] flex-1 border-0 bg-transparent px-1 py-0 shadow-none focus-visible:ring-0"
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => commitDraft(draft)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            commitDraft(draft);
            return;
          }
          if (e.key === "Backspace" && draft === "" && values.length > 0) {
            e.preventDefault();
            onChange(values.slice(0, -1));
          }
        }}
      />
    </div>
  );
}
