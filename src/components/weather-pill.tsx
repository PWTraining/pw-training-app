"use client";

import { useEffect, useState } from "react";
import { FALLBACK_LOCATION } from "@/lib/weather-location";

const WEATHER_CODES: Record<number, { emoji: string; label: string }> = {
  0: { emoji: "☀️", label: "clear" },
  1: { emoji: "🌤️", label: "mostly sunny" },
  2: { emoji: "⛅", label: "partly cloudy" },
  3: { emoji: "☁️", label: "overcast" },
  45: { emoji: "🌫️", label: "foggy" },
  48: { emoji: "🌫️", label: "foggy" },
  51: { emoji: "🌦️", label: "light drizzle" },
  53: { emoji: "🌦️", label: "drizzle" },
  55: { emoji: "🌦️", label: "heavy drizzle" },
  61: { emoji: "🌧️", label: "light rain" },
  63: { emoji: "🌧️", label: "rain" },
  65: { emoji: "🌧️", label: "heavy rain" },
  71: { emoji: "🌨️", label: "light snow" },
  73: { emoji: "🌨️", label: "snow" },
  75: { emoji: "❄️", label: "heavy snow" },
  80: { emoji: "🌦️", label: "showers" },
  81: { emoji: "🌦️", label: "showers" },
  82: { emoji: "⛈️", label: "heavy showers" },
  95: { emoji: "⛈️", label: "thunderstorms" },
  96: { emoji: "⛈️", label: "thunderstorms" },
  99: { emoji: "⛈️", label: "thunderstorms" },
};

function describeWeather(code: number) {
  return WEATHER_CODES[code] ?? { emoji: "🌡️", label: "current conditions" };
}

type Weather = {
  tempC: number;
  emoji: string;
  label: string;
  place: string;
  summary: string;
  highC: number;
  lowC: number;
  rainChance: number;
};

// The worst code in a stretch of hours is what people remember about it, so
// "showers" wins over the sunny hours either side of it.
function dominantCode(codes: number[]): number | null {
  if (codes.length === 0) return null;
  return codes.reduce((worst, code) => (code > worst ? code : worst), codes[0]);
}

// Turns the raw numbers into the sentence you'd actually say: what the day is
// like overall, and the part of it that's different.
function buildSummary(dayCode: number, hourlyCodes: number[], hours: number[]): string {
  const dayLabel = describeWeather(dayCode).label;

  const at = (from: number, to: number) =>
    dominantCode(hourlyCodes.filter((_, i) => hours[i] >= from && hours[i] < to));

  const morning = at(6, 12);
  const afternoon = at(12, 18);
  const evening = at(18, 22);

  // Only worth naming a part of the day when it's meaningfully worse than
  // the rest of it. Otherwise the sentence just repeats itself.
  const parts: string[] = [];
  if (afternoon !== null && morning !== null && afternoon > morning + 1) {
    parts.push(`afternoon ${describeWeather(afternoon).label}`);
  } else if (morning !== null && afternoon !== null && morning > afternoon + 1) {
    parts.push(`morning ${describeWeather(morning).label}`);
  }
  if (evening !== null && afternoon !== null && evening > afternoon + 1) {
    parts.push(`${describeWeather(evening).label} into the evening`);
  }

  const sentence = parts.length ? `${dayLabel} with ${parts.join(", then ")}` : dayLabel;
  return sentence.charAt(0).toUpperCase() + sentence.slice(1);
}

// Open-Meteo for conditions and BigDataCloud for the place name — both are
// keyless, so this runs straight from the browser with nothing to manage.
async function fetchWeather(latitude: number, longitude: number): Promise<Weather> {
  const [weatherRes, placeRes] = await Promise.all([
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
        `&current=temperature_2m,weather_code&hourly=weather_code` +
        `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max` +
        `&forecast_days=1&timezone=auto`,
    ),
    fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
    ),
  ]);

  const weather = await weatherRes.json();
  const place = await placeRes.json();

  const hourly: string[] = weather.hourly?.time ?? [];
  const hours = hourly.map((t: string) => Number(t.slice(11, 13)));
  const dayCode = weather.daily?.weather_code?.[0] ?? weather.current.weather_code;

  return {
    tempC: Math.round(weather.current.temperature_2m),
    ...describeWeather(weather.current.weather_code),
    place: place.city || place.locality || place.principalSubdivision || "Your area",
    summary: buildSummary(dayCode, weather.hourly?.weather_code ?? [], hours),
    highC: Math.round(weather.daily?.temperature_2m_max?.[0] ?? weather.current.temperature_2m),
    lowC: Math.round(weather.daily?.temperature_2m_min?.[0] ?? weather.current.temperature_2m),
    rainChance: Math.round(weather.daily?.precipitation_probability_max?.[0] ?? 0),
  };
}

const COORDS_KEY = "pw-weather-coords";

type Coords = { latitude: number; longitude: number };

// The permission prompt should happen once, ever. Whatever the answer, the
// resulting coordinates are kept and reused on every later visit, so opening
// the app doesn't re-ask — and a decline is remembered as the fallback
// location rather than prompting again.
function rememberedCoords(): Coords | null {
  try {
    const stored = window.localStorage.getItem(COORDS_KEY);
    return stored ? (JSON.parse(stored) as Coords) : null;
  } catch {
    return null;
  }
}

function remember(coords: Coords) {
  try {
    window.localStorage.setItem(COORDS_KEY, JSON.stringify(coords));
  } catch {
    // Not being able to remember only costs one extra prompt next time.
  }
}

async function currentCoords(): Promise<Coords> {
  const saved = rememberedCoords();
  if (saved) return saved;

  if (!("geolocation" in navigator)) {
    remember(FALLBACK_LOCATION);
    return FALLBACK_LOCATION;
  }

  // If the user already refused at the browser level, asking again just
  // throws the same prompt at them.
  try {
    const status = await navigator.permissions?.query({ name: "geolocation" });
    if (status?.state === "denied") {
      remember(FALLBACK_LOCATION);
      return FALLBACK_LOCATION;
    }
  } catch {
    // Permissions API unavailable — fall through and ask directly.
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const next = { latitude: coords.latitude, longitude: coords.longitude };
        remember(next);
        resolve(next);
      },
      () => {
        remember(FALLBACK_LOCATION);
        resolve(FALLBACK_LOCATION);
      },
      { timeout: 8000 },
    );
  });
}

// Wraps whatever sits beside it in the header so the forecast can open as a
// real drop-down: the panel is part of the page flow, so everything below it
// moves down instead of being covered by a floating bubble.
export function WeatherHeader({ children }: { children: React.ReactNode }) {
  const [weather, setWeather] = useState<Weather | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    currentCoords()
      .then(({ latitude, longitude }) => fetchWeather(latitude, longitude))
      .then((next) => {
        if (!cancelled) setWeather(next);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        {children}

        {weather && (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={`${weather.tempC} degrees, ${weather.summary}. Tap for the day's forecast`}
            className="flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3 text-sm font-medium tabular-nums"
            style={{
              borderColor: open ? "var(--color-brand)" : "var(--color-border)",
              background: "var(--color-surface)",
              color: "var(--color-text)",
            }}
          >
            <span aria-hidden>{weather.emoji}</span>
            {weather.tempC}&deg;
            <span className="text-[9px]" style={{ color: "var(--color-text-muted)" }} aria-hidden>
              {open ? "▲" : "▼"}
            </span>
          </button>
        )}
      </div>

      {weather && open && (
        <div
          className="rounded-[var(--radius-md)] border p-3.5"
          style={{
            borderColor: "var(--color-border)",
            background: "var(--color-surface-raised)",
          }}
        >
          <div className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>
            {weather.place} <span aria-hidden>📍</span>
          </div>
          <p className="mt-1 text-sm leading-relaxed" style={{ color: "var(--color-text)" }}>
            {weather.summary}.
          </p>
          <p className="mt-1.5 text-xs tabular-nums" style={{ color: "var(--color-text-muted)" }}>
            {weather.lowC}&deg; to {weather.highC}&deg; &middot; {weather.rainChance}% chance of
            rain &middot; {weather.tempC}&deg; right now
          </p>
        </div>
      )}
    </section>
  );
}
