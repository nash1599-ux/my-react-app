import { SATURDAY_SNAPSHOT, summarizeBoard } from "./board";
import {
  applyHashtagSale,
  extractPhoneCount,
  hasGUnitHashtag,
  looksLikeFullBoard,
  parseHashtagSale,
} from "./hashtagSales";

describe("g-unit hashtag parser", () => {
  test("detects the hashtag and ignores board pastes", () => {
    expect(hasGUnitHashtag("sold 2 phones #g-unit")).toBe(true);
    expect(hasGUnitHashtag("sold 2 phones")).toBe(false);
    expect(
      looksLikeFullBoard("1. Gigi 6 Apps | 2 CX\n2. Matthew 1 App | 1 CX")
    ).toBe(true);
  });

  test("reads phone counts from common shout-out formats", () => {
    expect(extractPhoneCount("2 phones #g-unit")).toBe(2);
    expect(extractPhoneCount("sold 3 #g-unit")).toBe(3);
    expect(extractPhoneCount("#g-unit 1")).toBe(1);
    expect(extractPhoneCount("closed 4 phones #g-unit")).toBe(4);
    expect(extractPhoneCount("1 app #g-unit")).toBe(1);
    expect(extractPhoneCount("#g-unit let's go")).toBe(1);
    expect(extractPhoneCount("CX1\nNL1\n#g-unit")).toBe(1);
    expect(extractPhoneCount("CX1\nNL1\nNL2\nNL3\nNL4\n#g-unit")).toBe(4);
  });

  test("reads CX1 / NL shout-out format", () => {
    const parsed = parseHashtagSale(
      "D2D\nCX1\nNL1\nNL2\n#g-unit\n#certifiedcloser",
      { author: "Jordan Aguirre" }
    );
    expect(parsed.matched).toBe(true);
    expect(parsed.phones).toBe(2);
    expect(parsed.cx).toBe(1);
    expect(parsed.name).toBe("Jordan Aguirre");
  });

  test("counts Nate's live D2D #G-unit shout-out and ignores S/O names", () => {
    const parsed = parseHashtagSale(
      `D2D
S/O @Drew Tepper For the business opportunity
S/O @Matthew Grant for the porting assist
S/O
Devin Kenzie, Matt, Ashunte
Cx 1
NL 1
NL 2 iPhone 17 pro 2x
#G-unit`,
      { author: "Nate" }
    );
    expect(parsed.matched).toBe(true);
    expect(parsed.phones).toBe(2);
    expect(parsed.cx).toBe(1);
    expect(parsed.name).toBe("Nate");
  });

  test("maps nicknames and optional CX", () => {
    const parsed = parseHashtagSale("Gigi sold 2 phones 1 CX #g-unit", {
      author: "Someone Else",
    });
    expect(parsed.matched).toBe(true);
    expect(parsed.ignored).toBe(false);
    expect(parsed.name).toBe("Gianna Smith");
    expect(parsed.phones).toBe(2);
    expect(parsed.cx).toBe(1);
  });

  test("falls back to the Slack author when no rep is named", () => {
    const parsed = parseHashtagSale("2 phones #g-unit", { author: "Steve Nash" });
    expect(parsed.name).toBe("Nashly Paul");
    expect(parsed.phones).toBe(2);
  });

  test("adds phones onto the running board and formats a channel update", () => {
    const before = summarizeBoard(SATURDAY_SNAPSHOT);
    const gigiBefore = before.reps.find((rep) => rep.name === "Gianna Smith");
    const { board, event, slackMessage } = applyHashtagSale(
      before,
      { text: "Gigi 2 phones #g-unit", author: "Gigi", ts: "sale-1" },
      new Date("2026-09-09T16:00:00")
    );

    const gigi = board.reps.find((rep) => rep.name === "Gianna Smith");
    expect(event.phones).toBe(2);
    expect(gigi.apps).toBe(gigiBefore.apps + 2);
    expect(board.totals.apps).toBe(before.totals.apps + 2);
    expect(board.salesLog[0].phones).toBe(2);
    expect(slackMessage).toMatch(/G-UNIT LIVE SALE/);
    expect(slackMessage).toMatch(/Gianna Smith/);
    expect(slackMessage).toMatch(/\+2 phones/);
  });

  test("counts Jordan's and Steveo's Wednesday D2D posts as 2 phones each", () => {
    const jordanSale = parseHashtagSale(
      `D2D
CX1
NL1 17 Pro Max EXTRA
NL2 S16+ EXTRA
#G-Unit`,
      { author: "Jordan #23" }
    );
    const steveoSale = parseHashtagSale(
      `D2D
Cx1
NL 1 iPhone 17e/512 Extra
NL 2 iPhone 17e/512 Extra
#G-UNIT`,
      { author: "Ismael" }
    );

    expect(jordanSale.phones).toBe(2);
    expect(jordanSale.cx).toBe(1);
    expect(jordanSale.name).toBe("Jordan Aguirre");
    expect(steveoSale.phones).toBe(2);
    expect(steveoSale.cx).toBe(1);
    expect(steveoSale.name).toBe("Ismael Ramos");

    const emptyWeek = summarizeBoard({
      ...SATURDAY_SNAPSHOT,
      reps: SATURDAY_SNAPSHOT.reps.map((rep) => ({ ...rep, apps: 0, cx: 0 })),
    });
    const afterJordan = applyHashtagSale(emptyWeek, {
      text: jordanSale.text,
      author: "Jordan #23",
      ts: "jordan-wed",
    });
    const afterSteveo = applyHashtagSale(afterJordan.board, {
      text: steveoSale.text,
      author: "Ismael",
      ts: "steveo-wed",
    });
    expect(
      afterSteveo.board.reps.find((rep) => rep.name === "Jordan Aguirre").apps
    ).toBe(2);
    expect(
      afterSteveo.board.reps.find((rep) => rep.name === "Ismael Ramos").apps
    ).toBe(2);
  });

  test("maps Big Sister General / Kenziee #G-unit posts to Mackenzie Faith", () => {
    const parsed = parseHashtagSale(
      `D2D
S/O @Drew Tepper For the business opportunity
S/O @Matthew Grant For helping me close
Cx 1
NL 1
NL 2
#precisionmanagement-att-sales #G-unit FM`,
      { author: "Big Sister General" }
    );
    expect(parsed.matched).toBe(true);
    expect(parsed.phones).toBe(2);
    expect(parsed.cx).toBe(1);
    expect(parsed.name).toBe("Mackenzie Faith");
  });

  test("counts Matthew J's 3-line #G-Unit post on Matthew 2", () => {
    const parsed = parseHashtagSale(
      `S/O (Drew Tepper)
S/O (Matthew Grant)
#G-Unit
CX1
NL-1 Samsung s26 ultra
NL-2 Samsung s26 ultra
NL-3 Samsung s26 ultra
Extra
Next ×3`,
      { author: "Matthew J" }
    );
    expect(parsed.matched).toBe(true);
    expect(parsed.phones).toBe(3);
    expect(parsed.cx).toBe(1);
    expect(parsed.name).toBe("Matthew 2");
  });

  test("counts Ismael's Thursday D2D #G-UNIT post as 2 phones on Steveo", () => {
    const parsed = parseHashtagSale(
      `D2D
S/O Drew Tepper
S/O Matthew Grant
S/O G-UNIT Nash-Sama Rashaad Hyppolite @Kyron @Jordan @MattJ @Judah
Cx1
NL 1 iPhone 17Pro/Extra
NL 2 A17
#G-UNIT`,
      { author: "Ismael" }
    );
    expect(parsed.matched).toBe(true);
    expect(parsed.phones).toBe(2);
    expect(parsed.cx).toBe(1);
    expect(parsed.name).toBe("Ismael Ramos");
  });

  test("skips duplicate Slack timestamps", () => {
    const first = applyHashtagSale(SATURDAY_SNAPSHOT, {
      text: "1 phone #g-unit",
      author: "Cam",
      ts: "dup-1",
    });
    const second = applyHashtagSale(first.board, {
      text: "1 phone #g-unit",
      author: "Cam",
      ts: "dup-1",
    });
    expect(second.duplicate).toBe(true);
    expect(second.board.totals.apps).toBe(first.board.totals.apps);
  });
});
