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

type Weather = { tempC: number; emoji: string; label: string; place: string };

// Open-Meteo for conditions and BigDataCloud for the place name — both are
// keyless, so this runs straight from the browser with nothing to manage.
async function fetchWeather(latitude: number, longitude: number): Promise<Weather> {
  const [weatherRes, placeRes] = await Promise.all([
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&timezone=auto`,
    ),
    fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
    ),
  ]);

  const weather = await weatherRes.json();
  const place = await placeRes.json();

  return {
    tempC: Math.round(weather.current.temperature_2m),
    ...describeWeather(weather.current.weather_code),
    place: place.city || place.locality || place.principalSubdivision || "Your area",
  };
}

// Resolves to the browser's coordinates, or the stored default location if
// the user declines the permission prompt (or it never resolves).
function currentCoords(): Promise<{ latitude: number; longitude: number }> {
  if (!("geolocation" in navigator)) return Promise.resolve(FALLBACK_LOCATION);

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => resolve({ latitude: coords.latitude, longitude: coords.longitude }),
      () => resolve(FALLBACK_LOCATION),
      { timeout: 8000 },
    );
  });
}

export function WeatherPill() {
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

  if (!weather) return null;

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex h-9 items-center gap-1.5 rounded-full border px-3 text-sm font-medium tabular-nums"
        style={{
          borderColor: "var(--color-border)",
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

      {open && (
        <div
          className="absolute right-0 top-11 z-20 w-max max-w-[15rem] rounded-[var(--radius-md)] border px-3 py-2 text-xs"
          style={{
            borderColor: "var(--color-border)",
            background: "var(--color-surface-raised)",
            color: "var(--color-text)",
            boxShadow: "0 6px 20px rgba(0,0,0,0.10)",
          }}
        >
          {weather.place}, {weather.label}
        </div>
      )}
    </div>
  );
}
