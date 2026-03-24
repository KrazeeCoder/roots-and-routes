import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useJsApiLoader } from "@react-google-maps/api";
import { Loader2, MapPin } from "lucide-react";
import { Input } from "../ui/input";
import { cn } from "../ui/utils";
import { GOOGLE_MAPS_API_KEY, GOOGLE_MAPS_LOADER_OPTIONS } from "../../../utils/googleMaps";

/** Bothell / north King-Snohomish area bias (~45 km). */
const LOCAL_AREA_CENTER = { lat: 47.7614, lng: -122.2052 };
const LOCAL_BIAS_RADIUS_M = 45_000;
const DEBOUNCE_MS = 300;

export interface AddressAutocompleteResolvedPlace {
  formattedAddress: string;
  lat: number | null;
  lng: number | null;
}

export interface AddressAutocompleteInputProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  onPlaceResolved?: (detail: AddressAutocompleteResolvedPlace) => void;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  "aria-invalid"?: boolean;
}

export function AddressAutocompleteInput({
  id: idProp,
  value,
  onChange,
  onPlaceResolved,
  required,
  placeholder,
  disabled,
  className,
  "aria-invalid": ariaInvalid,
}: AddressAutocompleteInputProps) {
  const autoId = useId();
  const inputId = idProp ?? autoId;
  const listId = `${inputId}-predictions`;

  const { isLoaded, loadError } = useJsApiLoader(GOOGLE_MAPS_LOADER_OPTIONS);

  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sessionTokenRef = useRef<unknown>(null);

  const [open, setOpen] = useState(false);
  const [predictions, setPredictions] = useState<
    Array<{ placeId: string; description: string; mainText: string; secondaryText: string }>
  >([]);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const [fetching, setFetching] = useState(false);
  const [placesBroken, setPlacesBroken] = useState(false);
  const [apiUnavailable, setApiUnavailable] = useState(false);

  const hasKey = Boolean(GOOGLE_MAPS_API_KEY);
  const mapsUsable = hasKey && isLoaded && !loadError && !placesBroken;

  const getSessionToken = useCallback(() => {
    const google = window.google;
    const ctor = google?.maps?.places?.AutocompleteSessionToken;
    if (!ctor) return undefined;
    if (!sessionTokenRef.current) {
      sessionTokenRef.current = new ctor();
    }
    return sessionTokenRef.current as google.maps.places.AutocompleteSessionToken;
  }, []);

  const resetSession = useCallback(() => {
    sessionTokenRef.current = null;
  }, []);

  const fetchPredictions = useCallback(
    (input: string) => {
      if (!mapsUsable || disabled) return;
      const trimmed = input.trim();
      if (trimmed.length < 2) {
        setPredictions([]);
        setApiUnavailable(false);
        setFetching(false);
        return;
      }

      const google = window.google;
      const Service = google?.maps?.places?.AutocompleteService;
      if (!Service) {
        setPlacesBroken(true);
        setPredictions([]);
        setApiUnavailable(true);
        setFetching(false);
        return;
      }

      setFetching(true);
      setApiUnavailable(false);
      const service = new Service();
      const location = new google.maps.LatLng(
        LOCAL_AREA_CENTER.lat,
        LOCAL_AREA_CENTER.lng,
      );

      service.getPlacePredictions(
        {
          input: trimmed,
          componentRestrictions: { country: "us" },
          location,
          radius: LOCAL_BIAS_RADIUS_M,
          types: ["address"],
          sessionToken: getSessionToken(),
        },
        (results, status) => {
          setFetching(false);

          // Compare with string statuses; enum objects are not always present on runtime globals.
          if (status === "OK" && results?.length) {
            setPredictions(
              results.map((r) => ({
                placeId: r.place_id,
                description: r.description,
                mainText: r.structured_formatting?.main_text ?? r.description,
                secondaryText: r.structured_formatting?.secondary_text ?? "",
              })),
            );
            setHighlightIndex(0);
            setApiUnavailable(false);
            return;
          }

          if (status === "ZERO_RESULTS") {
            setPredictions([]);
            setApiUnavailable(false);
            return;
          }

          console.warn("Address autocomplete unavailable", { status, input: trimmed });
          setPredictions([]);
          setApiUnavailable(true);
          setOpen(false);
        },
      );
    },
    [disabled, getSessionToken, mapsUsable],
  );

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    const onDoc = (event: MouseEvent) => {
      const el = containerRef.current;
      if (el && !el.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const scheduleFetch = useCallback(
    (input: string) => {
      if (!mapsUsable) return;
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(() => {
        fetchPredictions(input);
      }, DEBOUNCE_MS);
    },
    [fetchPredictions, mapsUsable],
  );

  const resolvePlace = useCallback(
    (placeId: string, fallbackDescription: string) => {
      const google = window.google;
      const PlacesService = google?.maps?.places?.PlacesService;
      if (!PlacesService) {
        if (onPlaceResolved) {
          onPlaceResolved({
            formattedAddress: fallbackDescription,
            lat: null,
            lng: null,
          });
        } else {
          onChange(fallbackDescription);
        }
        resetSession();
        setOpen(false);
        setPredictions([]);
        return;
      }

      const div = document.createElement("div");
      const svc = new PlacesService(div);

      svc.getDetails(
        {
          placeId,
          fields: ["formatted_address", "geometry"],
          sessionToken: getSessionToken() as google.maps.places.AutocompleteSessionToken | undefined,
        },
        (place, status) => {
          resetSession();

          const ok = status === "OK" && place;
          const formatted =
            ok && place.formatted_address
              ? place.formatted_address
              : fallbackDescription;
          let lat: number | null = null;
          let lng: number | null = null;
          if (ok && place.geometry?.location) {
            lat = place.geometry.location.lat();
            lng = place.geometry.location.lng();
          }

          if (onPlaceResolved) {
            onPlaceResolved({ formattedAddress: formatted, lat, lng });
          } else {
            onChange(formatted);
          }
          setOpen(false);
          setPredictions([]);
        },
      );
    },
    [getSessionToken, onChange, onPlaceResolved, resetSession],
  );

  const applyHighlight = useCallback(
    (index: number) => {
      if (!predictions.length) return;
      const next = (index + predictions.length) % predictions.length;
      setHighlightIndex(next);
    },
    [predictions.length],
  );

  const onInputChange = (next: string) => {
    onChange(next);
    if (!mapsUsable) return;
    setOpen(true);
    setPredictions([]);
    setApiUnavailable(false);
    if (next.trim().length < 2) {
      setFetching(false);
      return;
    }
    setFetching(true);
    scheduleFetch(next);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!mapsUsable || !open || predictions.length === 0) {
      if (event.key === "Escape") setOpen(false);
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      applyHighlight(highlightIndex + 1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      applyHighlight(highlightIndex - 1);
    } else if (event.key === "Enter") {
      event.preventDefault();
      const picked = predictions[highlightIndex];
      if (picked) {
        resolvePlace(picked.placeId, picked.description);
      }
    } else if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
    }
  };

  const helperMessage =
    (apiUnavailable || (hasKey && (loadError || placesBroken)))
      ? "Address suggestions are temporarily unavailable. You can still type a full address."
      : null;

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative">
        <Input
          id={inputId}
          value={value}
          disabled={disabled}
          required={required}
          placeholder={placeholder}
          aria-invalid={ariaInvalid}
          aria-expanded={mapsUsable ? open : undefined}
          aria-controls={mapsUsable && open ? listId : undefined}
          aria-autocomplete={mapsUsable ? "list" : undefined}
          role={mapsUsable ? "combobox" : undefined}
          className={mapsUsable ? "pr-9" : undefined}
          onChange={(e) => onInputChange(e.target.value)}
          onFocus={() => {
            if (mapsUsable && value.trim().length >= 2) {
              setOpen(true);
              scheduleFetch(value);
            }
          }}
          onKeyDown={onKeyDown}
        />
        {mapsUsable && fetching ? (
          <Loader2
            className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground"
            aria-hidden
          />
        ) : mapsUsable ? (
          <MapPin
            className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground opacity-60"
            aria-hidden
          />
        ) : null}
      </div>

      {mapsUsable && open && value.trim().length >= 2 ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-input bg-background py-1 text-sm shadow-md"
        >
          {fetching && predictions.length === 0 ? (
            <li className="px-3 py-2 text-muted-foreground">Searching addresses...</li>
          ) : null}
          {!fetching && !apiUnavailable && predictions.length === 0 ? (
            <li className="px-3 py-2 text-muted-foreground">No matching addresses</li>
          ) : null}
          {predictions.map((prediction, index) => (
            <li key={prediction.placeId} role="option" aria-selected={index === highlightIndex}>
              <button
                type="button"
                className={cn(
                  "flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left hover:bg-accent",
                  index === highlightIndex ? "bg-accent" : null,
                )}
                onMouseEnter={() => setHighlightIndex(index)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => resolvePlace(prediction.placeId, prediction.description)}
              >
                <span className="font-medium text-foreground">{prediction.mainText}</span>
                {prediction.secondaryText ? (
                  <span className="text-xs text-muted-foreground">{prediction.secondaryText}</span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {helperMessage ? (
        <p className="mt-1 text-xs text-muted-foreground">{helperMessage}</p>
      ) : null}
    </div>
  );
}
