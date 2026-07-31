"use client";

import { useCallback, useEffect, useState } from "react";

const WEATHER_CODES: Record<number, { emoji: string; label: string }> = {
  0: { emoji: "☀️", label: "Clear" },
  1: { emoji: "🌤️", label: "Mostly clear" },
  2: { emoji: "⛅", label: "Partly cloudy" },
  3: { emoji: "☁️", label: "Overcast" },
  45: { emoji: "🌫️", label: "Foggy" },
  48: { emoji: "🌫️", label: "Foggy" },
  51: { emoji: "🌦️", label: "Light drizzle" },
  53: { emoji: "🌦️", label: "Drizzle" },
  55: { emoji: "🌦️", label: "Heavy drizzle" },
  61: { emoji: "🌧️", label: "Light rain" },
  63: { emoji: "🌧️", label: "Rain" },
  65: { emoji: "🌧️", label: "Heavy rain" },
  71: { emoji: "🌨️", label: "Light snow" },
  73: { emoji: "🌨️", label: "Snow" },
  75: { emoji: "❄️", label: "Heavy snow" },
  80: { emoji: "🌦️", label: "Showers" },
  81: { emoji: "🌦️", label: "Showers" },
  82: { emoji: "⛈️", label: "Heavy showers" },
  95: { emoji: "⛈️", label: "Thunderstorms" },
  96: { emoji: "⛈️", label: "Thunderstorms" },
  99: { emoji: "⛈️", label: "Thunderstorms" },
};

function describeWeather(code: number) {
  return WEATHER_CODES[code] ?? { emoji: "🌡️", label: "" };
}

type WeatherState =
  | { status: "loading" }
  | { status: "denied" }
  | { status: "unavailable" }
  | { status: "ready"; tempC: number; emoji: string; label: string; place: string };

export function WeatherPill() {
  const [state, setState] = useState<WeatherState>({ status: "loading" });
  const [expanded, setExpanded] = useState(false);

  const runFetch = useCallback(() => {
    if (!("geolocation" in navigator)) {
      Promise.resolve().then(() => setState({ status: "unavailable" }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const [weatherRes, placeRes] = await Promise.all([
            fetch(
              `https://api.open-meteo.com/v1/forecast?latitude=${coords.latitude}&longitude=${coords.longitude}&current=temperature_2m,weather_code`,
            ),
            fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${coords.latitude}&longitude=${coords.longitude}&localityLanguage=en`,
            ),
          ]);

          const weather = await weatherRes.json();
          const place = await placeRes.json();
          const { emoji, label } = describeWeather(weather.current.weather_code);

          setState({
            status: "ready",
            tempC: Math.round(weather.current.temperature_2m),
            emoji,
            label,
            place: place.city || place.locality || place.principalSubdivision || "your area",
          });
        } catch {
          setState({ status: "unavailable" });
        }
      },
      (error) => {
        setState({ status: error.code === error.PERMISSION_DENIED ? "denied" : "unavailable" });
      },
      { timeout: 8000 },
    );
  }, []);

  useEffect(() => {
    runFetch();
  }, [runFetch]);

  function retry() {
    setState({ status: "loading" });
    runFetch();
  }

  if (state.status === "loading") {
    return (
      <span
        className="flex h-9 items-center rounded-full border px-3 text-xs"
        style={{ borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}
      >
        &hellip;
      </span>
    );
  }

  if (state.status === "denied") {
    return (
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex flex-col items-end gap-1"
      >
        <span
          className="flex h-9 items-center gap-1 rounded-full border px-3 text-xs"
          style={{ borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}
        >
          📍 Location blocked
        </span>
        {expanded && (
          <span
            className="max-w-[180px] text-right text-[11px]"
            style={{ color: "var(--color-text-muted)" }}
          >
            Enable location for this site in your browser settings, then reopen the app.
          </span>
        )}
      </button>
    );
  }

  if (state.status === "unavailable") {
    return (
      <button
        type="button"
        onClick={retry}
        className="flex h-9 items-center gap-1 rounded-full border px-3 text-xs"
        style={{ borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}
      >
        📍 Weather unavailable, tap to retry
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setExpanded((v) => !v)}
      className="flex flex-col items-end gap-1"
    >
      <span
        className="flex h-9 items-center gap-1.5 rounded-full border px-3 text-sm font-medium"
        style={{
          borderColor: "var(--color-border)",
          background: "var(--color-surface)",
          color: "var(--color-text)",
        }}
      >
        <span aria-hidden>{state.emoji}</span>
        {state.tempC}&deg;C
        <span className="text-[9px]" style={{ color: "var(--color-text-muted)" }} aria-hidden>
          {expanded ? "▲" : "▼"}
        </span>
      </span>
      {expanded && (
        <span className="pr-1 text-[11px]" style={{ color: "var(--color-text-muted)" }}>
          {state.place}, {state.label.toLowerCase()}
        </span>
      )}
    </button>
  );
}
