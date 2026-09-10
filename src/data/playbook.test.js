import { adviceForDate, FIELD_STEPS, quoteForDate, slackCulturePost, slackHypePost, slackNewStartPost } from "./playbook";
import { OFFICIAL_SNAPSHOT } from "./board";

test("9 steps include attitude, full shift, and take control", () => {
  expect(FIELD_STEPS).toHaveLength(9);
  expect(FIELD_STEPS[0].title).toMatch(/attitude/i);
  expect(FIELD_STEPS[7].title).toMatch(/take control/i);
  expect(FIELD_STEPS[8].title).toMatch(/don.?t be a bitch/i);
});

test("builds slack culture and new-start posts", () => {
  const culture = slackCulturePost({
    weatherLine: "Orlando 88°",
    quote: quoteForDate(new Date("2026-09-10")),
    advice: adviceForDate(new Date("2026-09-10")),
  });
  expect(culture).toMatch(/G-UNIT MORNING BRIEF/);
  expect(culture).toMatch(/9 Steps for Success/);
  expect(culture).toMatch(/C\.O\.E/);
  expect(slackNewStartPost()).toMatch(/Money Lap/);
  expect(slackNewStartPost()).toMatch(/S\.E\.E/);
});

test("hype post uses live board leaders", () => {
  const post = slackHypePost(OFFICIAL_SNAPSHOT);
  expect(post).toMatch(/Mackenzie Faith/);
  expect(post).toMatch(/55 NL left/);
  expect(post).toMatch(/Sale → CPR → Sale/);
});
