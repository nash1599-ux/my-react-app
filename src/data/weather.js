export const DEFAULT_WEATHER_LOCATION = {
  name: "Casselberry / Orlando, FL",
  latitude: 28.6775,
  longitude: -81.3278,
  timezone: "America/New_York",
};

const WMO = {
  0: { label: "Clear skies", emoji: ":sunny:" },
  1: { label: "Mostly sunny", emoji: ":mostly_sunny:" },
  2: { label: "Partly cloudy", emoji: ":partly_sunny:" },
  3: { label: "Overcast", emoji: ":cloud:" },
  45: { label: "Fog", emoji: ":fog:" },
  48: { label: "Icy fog", emoji: ":fog:" },
  51: { label: "Light drizzle", emoji: ":rain_cloud:" },
  53: { label: "Drizzle", emoji: ":rain_cloud:" },
  55: { label: "Heavy drizzle", emoji: ":rain_cloud:" },
  61: { label: "Rain", emoji: ":rain_cloud:" },
  63: { label: "Rain", emoji: ":rain_cloud:" },
  65: { label: "Heavy rain", emoji: ":thunder_cloud_and_rain:" },
  71: { label: "Snow", emoji: ":snowflake:" },
  80: { label: "Showers", emoji: ":rain_cloud:" },
  81: { label: "Rain showers", emoji: ":rain_cloud:" },
  82: { label: "Heavy showers", emoji: ":thunder_cloud_and_rain:" },
  95: { label: "Thunderstorms", emoji: ":thunder_cloud_and_rain:" },
};

export function cToF(celsius) {
  return Math.round((Number(celsius) * 9) / 5 + 32);
}

export function describeWeatherCode(code) {
  return WMO[Number(code)] || { label: "Field weather", emoji: ":sun_small_cloud:" };
}

export function formatWeatherLine(snapshot) {
  if (!snapshot) return "Weather: loading the field check.";
  const current = describeWeatherCode(snapshot.currentCode);
  const later = describeWeatherCode(snapshot.todayCode);
  const rain = snapshot.rainChance == null ? "" : ` · ${snapshot.rainChance}% rain`;
  return `:sun_with_face: *${snapshot.location}* · ${snapshot.tempF}° now, high ${snapshot.highF}° / low ${snapshot.lowF}° · ${current.label} now, ${later.label} later${rain}. Water up. Attitude up.`;
}

export function fieldTip(snapshot) {
  if (!snapshot) return "Work the process. Weather is just another test.";
  if ((snapshot.rainChance || 0) >= 40) {
    return "Showers in the mix. Pack the rain jacket, keep the smile, and stay on the houses with cars. Wet days thin the amateurs.";
  }
  if ((snapshot.highF || 0) >= 88) {
    return "Heat is a filter. Hydrate every lap, protect the attitude, and let the money lap belong to the people who stay out.";
  }
  return "Good field day. No excuses. Full shift. Full territory.";
}

export function parseForecast(payload, location = DEFAULT_WEATHER_LOCATION) {
  const current = payload?.current || {};
  const daily = payload?.daily || {};
  return {
    location: location.name,
    tempF: cToF(current.temperature_2m),
    highF: cToF(daily.temperature_2m_max?.[0]),
    lowF: cToF(daily.temperature_2m_min?.[0]),
    rainChance: daily.precipitation_probability_max?.[0] ?? null,
    currentCode: current.weather_code,
    todayCode: daily.weather_code?.[0],
    humidity: current.relative_humidity_2m,
    windMph: Math.round((Number(current.wind_speed_10m) || 0) * 0.621371),
  };
}

export async function fetchWeather(location = DEFAULT_WEATHER_LOCATION) {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}` +
    `&longitude=${location.longitude}` +
    `&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m` +
    `&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code` +
    `&timezone=${encodeURIComponent(location.timezone)}&forecast_days=2`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Weather request failed (${response.status})`);
  }
  return parseForecast(await response.json(), location);
}

export const THURSDAY_FIELD_SNAPSHOT = {
  location: DEFAULT_WEATHER_LOCATION.name,
  tempF: 76,
  highF: 88,
  lowF: 76,
  rainChance: 44,
  currentCode: 1,
  todayCode: 81,
  humidity: 96,
  windMph: 2,
};
