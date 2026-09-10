import { cToF, describeWeatherCode, formatWeatherLine, parseForecast } from "./weather";

test("converts C to F and labels showers", () => {
  expect(cToF(31)).toBe(88);
  expect(describeWeatherCode(81).label).toMatch(/shower/i);
});

test("formats a field weather line", () => {
  const snapshot = parseForecast({
    current: { temperature_2m: 24.4, weather_code: 1, wind_speed_10m: 4, relative_humidity_2m: 96 },
    daily: {
      temperature_2m_max: [31],
      temperature_2m_min: [24.4],
      precipitation_probability_max: [44],
      weather_code: [81],
    },
  });
  expect(snapshot.tempF).toBe(76);
  expect(snapshot.highF).toBe(88);
  expect(formatWeatherLine(snapshot)).toMatch(/Casselberry/);
  expect(formatWeatherLine(snapshot)).toMatch(/44% rain/);
});
