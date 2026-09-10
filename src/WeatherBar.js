import { useEffect, useState } from "react";
import {
  DEFAULT_WEATHER_LOCATION,
  fetchWeather,
  fieldTip,
  formatWeatherLine,
  THURSDAY_FIELD_SNAPSHOT,
} from "./data/weather";

export default function WeatherBar() {
  const [snapshot, setSnapshot] = useState(THURSDAY_FIELD_SNAPSHOT);
  const [status, setStatus] = useState("live snapshot");

  useEffect(() => {
    if (process.env.NODE_ENV === "test") return undefined;
    let cancelled = false;
    fetchWeather(DEFAULT_WEATHER_LOCATION)
      .then((next) => {
        if (!cancelled) {
          setSnapshot(next);
          setStatus("updated");
        }
      })
      .catch(() => {
        if (!cancelled) setStatus("cached field check");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="weather-bar" aria-label="Field weather">
      <p className="weather-line">{formatWeatherLine(snapshot)}</p>
      <p className="weather-tip">{fieldTip(snapshot)}</p>
      <span className="weather-status">{status}</span>
    </section>
  );
}
