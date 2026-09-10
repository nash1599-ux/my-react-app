export const TEAM_NAME = "G-UNIT";
export const TEAM_EMOJI = ":military_helmet::saluting_face::moneybag::fire::bar_chart:";

export const FIELD_STEPS = [
  {
    n: 1,
    title: "Have a great attitude",
    note: "Start each day with a positive mindset.",
  },
  {
    n: 2,
    title: "Be on time",
    note: "Punctuality shows respect and sets a positive tone.",
  },
  {
    n: 3,
    title: "Be prepared",
    note: "Be prepared with all necessary tools and information.",
  },
  {
    n: 4,
    title: "Work your full shift",
    note: "Commit fully to your scheduled hours and maintain consistent effort.",
  },
  {
    n: 5,
    title: "Work your full territory correctly",
    note: "Focus on your assigned area, follow the process, and maximize opportunities.",
  },
  {
    n: 6,
    title: "Maintain your attitude",
    note: "Stay positive despite setbacks.",
  },
  {
    n: 7,
    title: "Know why you’re here and where you’re going",
    note: "Understand your purpose and motivation for long-term success.",
  },
  {
    n: 8,
    title: "Take control!!!!!",
    note: "Own your results, make proactive decisions, and handle situations confidently.",
  },
  {
    n: 9,
    title: "DON’T BE A BITCH",
    note: "Stay resilient and push through negativity and frustration.",
  },
];

export const CODE_OF_ETHICS = [
  { title: "Standards", detail: "Be the example. New starts copy what they see, not what they hear." },
  { title: "Dress the part", detail: "Start-up energy. Look like money before you make money." },
  { title: "Loudest in the room", detail: "Energy is contagious. Bring the volume that makes the office feel alive." },
  { title: "Punctuality / Communication", detail: "On time. Clear. No ghosting the team, the customer, or yourself." },
  { title: "Professionalism", detail: "We represent AT&T and G-Unit on every door. Respect the brand." },
  { title: "UNITY (Healthy)", detail: "Protect the culture. Compete hard, celebrate louder, never tear a teammate down." },
  { title: "Accountability", detail: "If you said you would, you do. Numbers do not lie." },
  { title: "Ownership", detail: "Your territory is your business. Your results are yours to own." },
];

export const LAW_OF_AVERAGES = {
  title: "L.O.A · Law of Averages",
  summary:
    "Staying connected with those you’ve spoken to and sharing clear opportunities builds trust and future benefits. Providing meaningful information now, even without immediate results, strengthens relationships and demonstrates professionalism, supporting the 9 Steps for Success and C.O.E principles.",
  field:
    "Not every door is a yes today. The yes is hiding behind the next knock, the follow-up text, and the family that was not home the first lap. Stay in the averages. Do not get emotional about one no.",
};

export const SEE_FACTORS = [
  { letter: "S", title: "Smile", detail: "The door opens to a face, not a pitch. Smile first." },
  { letter: "E", title: "Eye", detail: "Eye contact builds trust faster than any script." },
  { letter: "E", title: "Enthusiasm", detail: "People buy belief. If you are not fired up, they will not be either." },
];

export const LAP_SYSTEM = {
  hints: ["No cars", "Unkept yards", "Abandoned houses"],
  lookingFor: ["Open doors / garages", "People sitting outside", "Cars"],
  notLookingFor: ["No car at house", "Unkept property (abandoned, grown-out vegetation, etc.)"],
  laps: [
    { name: "1st Lap", window: "1:30 – 4:30", code: "1:3–4:3" },
    { name: "2nd Lap", window: "4:30 – 6:30", code: "4:3–6:3" },
    { name: "Money Lap", window: "6:30 – 8:30", code: "6:3–8:3" },
  ],
};

export const SALE_CYCLE =
  "Sale → CPR → Sale → CPR. Close it. Celebrate it. Pull the referral. Hunt the next one. Never come down after a yes.";

export const QUOTES = [
  {
    text: "You do not get paid for the doors you skip. You get paid for the ones you work correctly.",
    by: "G-Unit",
  },
  {
    text: "A great attitude is not a mood. It is a decision you make before the first knock.",
    by: "G-Unit",
  },
  {
    text: "The money lap is not magic. It is the same territory, worked by someone who refused to quit at 6:30.",
    by: "G-Unit",
  },
  {
    text: "New starts: you are not behind. You are early. Pour into the process and the numbers will catch up.",
    by: "G-Unit",
  },
  {
    text: "Whether you think you can or you think you can’t, you’re right.",
    by: "Henry Ford",
  },
  {
    text: "Success is nothing more than a few simple disciplines, practiced every day.",
    by: "Jim Rohn",
  },
  {
    text: "Your territory is a store with no rent. Treat it like a business, not a walk.",
    by: "G-Unit",
  },
  {
    text: "Be so consistent that luck has no choice but to show up.",
    by: "G-Unit",
  },
];

export const ADVICE = [
  "You are not collecting hours. You are building a book of business. Every honest conversation is inventory.",
  "Protect the morning. Attitude, on time, prepared. If those three slip, the whole day leaks.",
  "Work the house that looks lived-in. Cars, open garages, people outside. Do not romanticize empty driveways.",
  "After the sale, CPR is the next sale. Referrals are cheaper than cold knocks.",
  "Follow up is how amateurs become professionals. The Law of Averages rewards the rep who stays connected.",
  "Take control of the door, the pitch, and the close. Customers do not want a shy salesperson. They want a leader.",
  "Your why has to be louder than the heat, the rain, and the no. Write it down. Read it at 4:30.",
  "Unity means we hype every sale in the chat. One person’s win raises the office average.",
];

export function quoteForDate(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 0);
  const day = Math.floor((date - start) / 86400000);
  return QUOTES[day % QUOTES.length];
}

export function adviceForDate(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 0);
  const day = Math.floor((date - start) / 86400000);
  return ADVICE[day % ADVICE.length];
}

export function slackCulturePost({ weatherLine, quote, advice } = {}) {
  const q = quote || quoteForDate();
  const a = advice || adviceForDate();
  const weather = weatherLine || "Check the sky, then check your attitude.";
  const steps = FIELD_STEPS.map((step) => `${step.n}. ${step.title}`).join("\n");
  return [
    `${TEAM_EMOJI} *G-UNIT MORNING BRIEF*`,
    weather,
    "",
    `> "${q.text}"`,
    `> — ${q.by}`,
    "",
    `*Entrepreneurial shot:* ${a}`,
    "",
    "*9 Steps for Success*",
    steps,
    "",
    "*C.O.E* · Standards · Dress the part · Loudest in the room · Punctuality · Professionalism · UNITY · Accountability · Ownership",
    "",
    `*Sale cycle:* ${SALE_CYCLE}`,
    "",
    "New starts: copy the culture, then copy the numbers. Let’s go.",
  ].join("\n");
}

export function slackNewStartPost() {
  const laps = LAP_SYSTEM.laps
    .map((lap) => `• *${lap.name}:* ${lap.window}`)
    .join("\n");
  return [
    `${TEAM_EMOJI} *NEW START PLAYBOOK*`,
    "Pour into this. This is how G-Unit eats.",
    "",
    "*Lap System*",
    laps,
    "",
    `*Looking for:* ${LAP_SYSTEM.lookingFor.join(" · ")}`,
    `*Not looking for:* ${LAP_SYSTEM.notLookingFor.join(" · ")}`,
    `*Hints (skip):* ${LAP_SYSTEM.hints.join(" · ")}`,
    "",
    "*S.E.E. Factors*",
    SEE_FACTORS.map((item) => `• *${item.letter}* ${item.title} — ${item.detail}`).join("\n"),
    "",
    `*L.O.A* — ${LAW_OF_AVERAGES.field}`,
    "",
    `*Sale cycle:* ${SALE_CYCLE}`,
    "",
    "Be on time. Be prepared. Work the full shift. Take control.",
  ].join("\n");
}

export function slackHypePost(board) {
  const top = (board?.reps || []).slice(0, 6);
  const rows = top.map((rep, index) => {
    const medal = { 1: ":first_place_medal:", 2: ":second_place_medal:", 3: ":third_place_medal:" }[
      rep.rank || index + 1
    ] || `${rep.rank || index + 1}.`;
    return `${medal} *${rep.displayName}*  ${rep.apps} Apps | ${rep.cx} CX`;
  });
  const produced = board?.weeklyGoal?.produced ?? board?.totals?.cx ?? 0;
  const goal = board?.weeklyGoal?.goal ?? 70;
  const left = board?.weeklyGoal?.nlLeft ?? Math.max(0, goal - produced);
  const apps = board?.totals?.apps ?? 0;
  const phones = board?.dgNum ?? apps;
  return [
    `${TEAM_EMOJI} *G-UNIT IS COOKING*`,
    `Daily goal *${phones}/${board?.dgDen || 12}* · *${apps} Apps* this week · *${left} NL left* of ${goal}`,
    "",
    ":trophy: *LEADERBOARD*",
    ...rows,
    "",
    "If you just closed: drop it in the chat. Sale → CPR → Sale. Let the new starts see what winning looks like.",
    "Mackenzie, Nate, Matthew J, Jordan, Steveo — that is the standard. Who is taking Thursday?",
    "",
    "New starts: this is the room. Get in the average. Take control.",
  ].join("\n");
}
