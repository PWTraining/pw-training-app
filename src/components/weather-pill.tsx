"use client";

import { useEffect, useState } from "react";
import { FALLBACK_LOCATION } from "@/lib/weather-location";

const WEATHER_CODES: Record<number, { emoji: string; label: string }> = {
  0: { emoji: "☀️", label: "Sunny" },
  1: { emoji: "🌤️", label: "Mostly sunny" },
  2: { emoji: "⛅", label: "Sunny with a bit of cloud" },
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
  return WEATHER_CODES[code] ?? { emoji: "🌡️", label: "Current conditions" };
}

type Weather = { tempC: number; emoji: string; label: string };

// Open-Meteo is keyless, so this runs straight from the browser with no
// server route or API key to manage.
async function fetchWeather(latitude: number, longitude: number): Promise<Weather> {
  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&timezone=auto`,
  );
  const data = await res.json();
  return {
    tempC: Math.round(data.current.temperature_2m),
    ...describeWeather(data.current.weather_code),
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

  // Nothing rendered until it resolves — a placeholder pill in the header
  // reads as a broken control more than an empty gap does.
  if (!weather) return null;

  return (
    <span
      className="flex items-center gap-1 text-sm font-medium tabular-nums"
      style={{ color: "var(--color-text)" }}
      title={weather.label}
    >
      <span aria-hidden>{weather.emoji}</span>
      {weather.tempC}&deg;
      <span className="sr-only">, {weather.label}</span>
    </span>
  );
}
