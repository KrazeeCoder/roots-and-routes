import { useId, useMemo, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { cn } from "../ui/utils";

export interface CategoryPickerProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
  allowCustom: boolean;
  placeholder?: string;
  disabled?: boolean;
  label?: string;
  emptySearchMessage?: string;
}

export function CategoryPicker({
  id,
  value,
  onChange,
  options,
  allowCustom,
  placeholder = "Select…",
  disabled,
  label,
  emptySearchMessage = "No matches",
}: CategoryPickerProps) {
  const autoSearchId = useId();
  const searchFieldId = id ? `${id}-search` : autoSearchId;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [...options];
    return options.filter((option) => option.toLowerCase().includes(q));
  }, [options, query]);

  const exactPresetMatch = useMemo(
    () => filtered.some((o) => o.toLowerCase() === query.trim().toLowerCase()),
    [filtered, query],
  );

  const customCandidate = query.trim();
  const showCustomRow =
    allowCustom && customCandidate.length > 0 && !exactPresetMatch;

  const displayValue = value.trim() || null;

  return (
    <div className="space-y-1.5">
      <Popover
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setQuery("");
        }}
      >
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className="h-auto min-h-9 w-full justify-between gap-2 px-3 py-2 font-normal"
          >
            {displayValue ? (
              <span className="inline-flex max-w-[calc(100%-1.5rem)] items-center rounded-full border border-input bg-muted/50 px-3 py-0.5 text-left text-sm font-medium">
                {displayValue}
              </span>
            ) : (
              <span className="truncate text-muted-foreground">{placeholder}</span>
            )}
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="z-[100] min-w-[280px] w-[var(--radix-popover-trigger-width)] max-w-none p-3"
          align="start"
        >
          <Label htmlFor={searchFieldId} className="sr-only">
            {label ?? "Search categories"}
          </Label>
          <Input
            id={searchFieldId}
            autoFocus
            placeholder="Search…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="mb-2"
          />
          <div className="max-h-56 space-y-0.5 overflow-y-auto">
            {filtered.length === 0 && !showCustomRow ? (
              <p className="py-3 text-center text-sm text-muted-foreground">{emptySearchMessage}</p>
            ) : null}
            {filtered.map((option) => (
              <button
                key={option}
                type="button"
                className={cn(
                  "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent",
                  option === value ? "bg-accent/70" : null,
                )}
                onClick={() => {
                  onChange(option);
                  setOpen(false);
                }}
              >
                <Check className={cn("h-4 w-4 shrink-0", option === value ? "opacity-100" : "opacity-0")} />
                <span className="min-w-0 flex-1">{option}</span>
              </button>
            ))}
            {showCustomRow ? (
              <button
                type="button"
                className="flex w-full flex-col items-start gap-0.5 rounded-sm border border-dashed border-input px-2 py-2 text-left text-sm hover:bg-accent"
                onClick={() => {
                  onChange(customCandidate);
                  setOpen(false);
                }}
              >
                <span className="font-medium">Use custom</span>
                <span className="text-xs text-muted-foreground">&ldquo;{customCandidate}&rdquo;</span>
              </button>
            ) : null}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
