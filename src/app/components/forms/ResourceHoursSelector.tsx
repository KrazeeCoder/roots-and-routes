import { useEffect, useMemo, useState } from "react";
import { cn } from "../ui/utils";

const DAY_META = [
  { key: "mon", short: "Mon", long: "Monday" },
  { key: "tue", short: "Tue", long: "Tuesday" },
  { key: "wed", short: "Wed", long: "Wednesday" },
  { key: "thu", short: "Thu", long: "Thursday" },
  { key: "fri", short: "Fri", long: "Friday" },
  { key: "sat", short: "Sat", long: "Saturday" },
  { key: "sun", short: "Sun", long: "Sunday" },
] as const;

type DayKey = (typeof DAY_META)[number]["key"];

const ALL_DAYS: DayKey[] = DAY_META.map((day) => day.key);
const WEEKDAYS: DayKey[] = ["mon", "tue", "wed", "thu", "fri"];
const MON_SAT: DayKey[] = ["mon", "tue", "wed", "thu", "fri", "sat"];
const WEEKEND: DayKey[] = ["sat", "sun"];

const DAY_ALIASES = new Map<string, DayKey>(
  DAY_META.flatMap((day) => [
    [day.short.toLowerCase(), day.key],
    [day.long.toLowerCase(), day.key],
  ]),
);

const TIME_OPTIONS = Array.from({ length: 48 }, (_, index) => {
  const totalMinutes = index * 30;
  const hour24 = Math.floor(totalMinutes / 60);
  const minute = totalMinutes % 60;
  const period = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 || 12;
  return `${hour12}:${String(minute).padStart(2, "0")} ${period}`;
});

const OPEN_TIME_OPTIONS = TIME_OPTIONS.slice(0, TIME_OPTIONS.length - 1);

type HoursMode = "not_listed" | "specific";

const DEFAULT_DAYS: DayKey[] = [...WEEKDAYS];
const DEFAULT_OPEN = "9:00 AM";
const DEFAULT_CLOSE = "5:00 PM";

interface ParsedHoursValue {
  mode: HoursMode;
  days: DayKey[];
  open: string;
  close: string;
  isLegacySpecific: boolean;
  legacyValue: string;
}

function sameDaySet(a: DayKey[], b: DayKey[]) {
  if (a.length !== b.length) return false;
  return a.every((day, index) => day === b[index]);
}

function orderDays(days: DayKey[]) {
  const picked = new Set<DayKey>(days);
  return DAY_META.map((day) => day.key).filter((day) => picked.has(day));
}

function normalizeCloseTime(open: string, preferredClose: string) {
  const openIdx = TIME_OPTIONS.indexOf(open);
  const preferredCloseIdx = TIME_OPTIONS.indexOf(preferredClose);
  if (openIdx < 0) return DEFAULT_CLOSE;
  if (preferredCloseIdx > openIdx) return preferredClose;
  return TIME_OPTIONS[Math.min(openIdx + 1, TIME_OPTIONS.length - 1)];
}

function parseDaysSegment(segmentRaw: string): DayKey[] | null {
  const segment = segmentRaw.trim();
  if (!segment) return null;

  if (segment === "Daily") return [...ALL_DAYS];
  if (segment === "Mon-Fri") return [...WEEKDAYS];
  if (segment === "Mon-Sat") return [...MON_SAT];
  if (segment === "Sat-Sun") return [...WEEKEND];

  const tokens = segment.split(",").map((token) => token.trim()).filter(Boolean);
  if (tokens.length === 0) return null;

  const days: DayKey[] = [];
  for (const token of tokens) {
    const mapped = DAY_ALIASES.get(token.toLowerCase());
    if (!mapped) return null;
    if (!days.includes(mapped)) {
      days.push(mapped);
    }
  }

  return orderDays(days);
}

function formatDays(daysRaw: DayKey[]) {
  const days = orderDays(daysRaw);
  if (sameDaySet(days, ALL_DAYS)) return "Daily";
  if (sameDaySet(days, WEEKDAYS)) return "Mon-Fri";
  if (sameDaySet(days, MON_SAT)) return "Mon-Sat";
  if (sameDaySet(days, WEEKEND)) return "Sat-Sun";

  return days
    .map((day) => DAY_META.find((item) => item.key === day)?.short ?? day)
    .join(", ");
}

function formatSpecificHours(days: DayKey[], open: string, close: string) {
  return `${formatDays(days)}: ${open} - ${close}`;
}

function parseHoursValue(raw: string): ParsedHoursValue {
  const value = raw.trim();
  if (!value) {
    return {
      mode: "not_listed",
      days: [...DEFAULT_DAYS],
      open: DEFAULT_OPEN,
      close: DEFAULT_CLOSE,
      isLegacySpecific: false,
      legacyValue: "",
    };
  }

  const fixedMatch = /^(.+): (\d{1,2}:\d{2} [AP]M) - (\d{1,2}:\d{2} [AP]M)$/.exec(value);
  if (fixedMatch) {
    const [, daySegment, open, close] = fixedMatch;
    const parsedDays = parseDaysSegment(daySegment);
    const openIdx = TIME_OPTIONS.indexOf(open);
    const closeIdx = TIME_OPTIONS.indexOf(close);

    if (parsedDays && parsedDays.length > 0 && openIdx >= 0 && closeIdx > openIdx) {
      return {
        mode: "specific",
        days: parsedDays,
        open,
        close,
        isLegacySpecific: false,
        legacyValue: "",
      };
    }
  }

  return {
    mode: "specific",
    days: [...DEFAULT_DAYS],
    open: DEFAULT_OPEN,
    close: DEFAULT_CLOSE,
    isLegacySpecific: true,
    legacyValue: value,
  };
}

export interface ResourceHoursSelectorProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export function ResourceHoursSelector({
  id,
  value,
  onChange,
  disabled,
  className,
}: ResourceHoursSelectorProps) {
  const parsed = useMemo(() => parseHoursValue(value), [value]);
  const [mode, setMode] = useState<HoursMode>(parsed.mode);
  const [days, setDays] = useState<DayKey[]>(parsed.days);
  const [open, setOpen] = useState(parsed.open);
  const [close, setClose] = useState(parsed.close);
  const [isLegacySpecific, setIsLegacySpecific] = useState(parsed.isLegacySpecific);
  const [legacyValue, setLegacyValue] = useState(parsed.legacyValue);

  useEffect(() => {
    setMode(parsed.mode);
    setDays(parsed.days);
    setOpen(parsed.open);
    setClose(parsed.close);
    setIsLegacySpecific(parsed.isLegacySpecific);
    setLegacyValue(parsed.legacyValue);
  }, [parsed]);

  const closeOptions = useMemo(() => {
    const openIdx = TIME_OPTIONS.indexOf(open);
    if (openIdx < 0) return TIME_OPTIONS;
    return TIME_OPTIONS.slice(openIdx + 1);
  }, [open]);

  const handleModeChange = (nextMode: HoursMode) => {
    setMode(nextMode);
    if (nextMode === "not_listed") {
      setIsLegacySpecific(false);
      onChange("");
      return;
    }

    const nextDays = days.length > 0 ? days : [...DEFAULT_DAYS];
    const normalizedClose = normalizeCloseTime(open, close);
    setDays(nextDays);
    setClose(normalizedClose);
    setIsLegacySpecific(false);
    onChange(formatSpecificHours(nextDays, open, normalizedClose));
  };

  const toggleDay = (day: DayKey) => {
    const exists = days.includes(day);
    if (exists && days.length === 1) {
      return;
    }

    const nextDays = exists
      ? days.filter((item) => item !== day)
      : orderDays([...days, day]);

    setDays(nextDays);
    setMode("specific");
    setIsLegacySpecific(false);
    onChange(formatSpecificHours(nextDays, open, close));
  };

  const handleOpenChange = (nextOpen: string) => {
    const normalizedClose = normalizeCloseTime(nextOpen, close);
    setOpen(nextOpen);
    setClose(normalizedClose);
    setMode("specific");
    setIsLegacySpecific(false);
    onChange(formatSpecificHours(days, nextOpen, normalizedClose));
  };

  const handleCloseChange = (nextClose: string) => {
    setClose(nextClose);
    setMode("specific");
    setIsLegacySpecific(false);
    onChange(formatSpecificHours(days, open, nextClose));
  };

  const openId = id ? `${id}-open` : undefined;
  const closeId = id ? `${id}-close` : undefined;

  return (
    <div className={cn("space-y-2", className)}>
      <select
        id={id}
        value={mode}
        onChange={(event) => handleModeChange(event.target.value as HoursMode)}
        disabled={disabled}
        className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
      >
        <option value="not_listed">Not listed</option>
        <option value="specific">Set specific hours</option>
      </select>

      {mode === "specific" ? (
        <div className="space-y-2">
          <div>
            <span className="mb-1 block text-xs text-[#6F7553]">Days (select one or more)</span>
            <div className="grid grid-cols-2 gap-2 rounded-md border border-input bg-transparent p-2 sm:grid-cols-4">
              {DAY_META.map((day) => (
                <label
                  key={day.key}
                  className="inline-flex items-center gap-2 text-sm text-[#334233]"
                >
                  <input
                    type="checkbox"
                    checked={days.includes(day.key)}
                    onChange={() => toggleDay(day.key)}
                    disabled={disabled}
                  />
                  <span>{day.short}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div>
              <span className="mb-1 block text-xs text-[#6F7553]">Opens</span>
              <select
                id={openId}
                value={open}
                onChange={(event) => handleOpenChange(event.target.value)}
                disabled={disabled}
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
              >
                {OPEN_TIME_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <span className="mb-1 block text-xs text-[#6F7553]">Closes</span>
              <select
                id={closeId}
                value={close}
                onChange={(event) => handleCloseChange(event.target.value)}
                disabled={disabled}
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
              >
                {closeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      ) : null}

      {mode === "specific" && isLegacySpecific ? (
        <p className="text-xs text-[#6F7553]">
          Existing value: {legacyValue}. Choose days/time to replace it.
        </p>
      ) : null}
    </div>
  );
}
