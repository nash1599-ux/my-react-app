import "@testing-library/jest-dom";
import { TRACKER_STORAGE_KEY } from "./data/weeklyTracker";

beforeEach(() => {
  window.localStorage.removeItem(TRACKER_STORAGE_KEY);
  Object.assign(navigator, {
    clipboard: { writeText: jest.fn(() => Promise.resolve()) },
  });
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          current: {
            temperature_2m: 24.4,
            weather_code: 1,
            wind_speed_10m: 4,
            relative_humidity_2m: 96,
          },
          daily: {
            temperature_2m_max: [31],
            temperature_2m_min: [24.4],
            precipitation_probability_max: [44],
            weather_code: [81],
          },
        }),
    })
  );
});
