import unittest

from update_gunit_board import (
    apply_departures_and_folds,
    looks_like_full_board,
    normalize_name,
    parse_board,
    process_board,
    rank_rows,
    tier_bonus,
    validate_against_previous,
)

MONDAY_SLACK_BOARD = """
╔══════════════════════════════════════╗
║    :military_helmet: G-UNIT SALES BOARD :saluting_face::moneybag:      ║
║  :bar_chart: DG:9/12 |50 NL LEFT |  MONDI ║
╚══════════════════════════════════════╝
:trophy: LEADERBOARD
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
:first_place_medal:    Gigi Smith            6 Apps | 2 CX
:second_place_medal: Matthew Grant        1 App  | 1 CX
:third_place_medal:Steveo Ramos     0 App | 1 CX
4. Jordan #23             0 App|  1 CX
5. Ky.  Tisdale             0 App  | 1 CX
6 Cam Winfield                 2 App | 1 CX
7.Shaad Hypolite         0 App | 0 CX
8. Steve Nash             0 App  | 0 CX
"""


SAMPLE_BOARD = """
G-UNIT SALES BOARD
DG: 4/10 | 3 NL LEFT | Sunday

1. 🥇 Quay Tyler 12 Apps | 8 CX
2. 🥈 Ky. Tisdale 10 Apps | 7 CX
3. 🥉 Steve Nash 8 Apps | 5 CX
4. Jayden 6 Apps | 4 CX
5. Jordan 5 Apps | 3 CX
6. Shaad Hypolite 4 Apps | 2 CX
7. Alex Rivera 2 Apps | 1 CX - she left add lines to quay
8. Pat Lee 3 Apps | 4 CX
"""


class NormalizeNameTests(unittest.TestCase):
    def test_known_aliases(self):
        self.assertEqual(normalize_name("quay"), "Jaquay Tyler")
        self.assertEqual(normalize_name("Ky. Tisdale"), "Kyron Tisdale")
        self.assertEqual(normalize_name("steve nash"), "Nashly Paul")
        self.assertEqual(normalize_name("jordan"), "Jordan Aguirre")
        self.assertEqual(normalize_name("Gigi Smith"), "Gianna Smith")
        self.assertEqual(normalize_name("Jordan #23"), "Jordan Aguirre")
        self.assertEqual(normalize_name("Ky.  Tisdale"), "Kyron Tisdale")

    def test_unknown_name_is_preserved(self):
        self.assertEqual(normalize_name("Jordan Reeces"), "Jordan Reeces")


class ParseBoardTests(unittest.TestCase):
    def test_parses_banner_and_rows(self):
        banner, rows = parse_board(SAMPLE_BOARD)
        self.assertEqual(banner["dg_num"], 4)
        self.assertEqual(banner["dg_den"], 10)
        self.assertEqual(banner["nl_left"], 3)
        self.assertEqual(banner["day"], "Sunday")
        self.assertEqual(len(rows), 8)
        self.assertEqual(rows[0]["name"], "Jaquay Tyler")
        self.assertEqual(rows[1]["name"], "Kyron Tisdale")
        self.assertEqual(rows[2]["name"], "Nashly Paul")
        self.assertEqual(rows[3]["name"], "Jayden Dale")

    def test_flags_cx_exceeding_apps(self):
        _, rows = parse_board(SAMPLE_BOARD)
        pat = next(row for row in rows if row["name"] == "Pat Lee")
        self.assertTrue(any("DATA ERROR" in flag for flag in pat["flags"]))

    def test_detects_departure_and_fold_target(self):
        _, rows = parse_board(SAMPLE_BOARD)
        alex = next(row for row in rows if row["name"] == "Alex Rivera")
        self.assertTrue(alex["departed"])
        self.assertEqual(alex["fold_to"], "Jaquay Tyler")


class ValidationTests(unittest.TestCase):
    def test_cx_drop_is_flagged_not_rewritten(self):
        rows = [{"name": "Jaquay Tyler", "cx": 6, "apps": 10, "flags": []}]
        previous = {"Jaquay Tyler": {"apps": 10, "cx": 8}}
        flags = validate_against_previous(rows, previous)
        self.assertEqual(len(flags), 1)
        self.assertIn("dropped from 8 to 6", flags[0])
        self.assertEqual(rows[0]["cx"], 6)

    def test_tier_bonus_thresholds(self):
        self.assertEqual(tier_bonus(9), 100)
        self.assertEqual(tier_bonus(7), 75)
        self.assertEqual(tier_bonus(5), 50)
        self.assertEqual(tier_bonus(4), 30)
        self.assertEqual(tier_bonus(3), 0)


class DepartureTests(unittest.TestCase):
    def test_folds_departed_rep_into_mentor(self):
        _, rows = parse_board(SAMPLE_BOARD)
        final_rows, log_entries = apply_departures_and_folds(rows)
        names = [row["name"] for row in final_rows]
        self.assertNotIn("Alex Rivera", names)
        quay = next(row for row in final_rows if row["name"] == "Jaquay Tyler")
        self.assertEqual(quay["apps"], 14)
        self.assertEqual(quay["cx"], 9)
        self.assertTrue(any("Folded Alex Rivera" in entry for entry in log_entries))


class ProcessBoardTests(unittest.TestCase):
    def test_end_to_end_ranking(self):
        banner, rows, notes = process_board(SAMPLE_BOARD)
        ranked = rank_rows(rows)
        self.assertEqual(banner["day"], "Sunday")
        self.assertEqual(ranked[0]["name"], "Jaquay Tyler")
        self.assertEqual(ranked[0]["apps"], 14)
        self.assertEqual(ranked[0]["tier_bonus"], 100)
        self.assertTrue(any("Pat Lee" in note for note in notes))
        self.assertTrue(any("Folded Alex Rivera" in note for note in notes))


FULL_TSV = """G-UNIT SALES BOARD
DG: 8/10   |   25 NL LEFT   |   AS OF THURSDAY

Blended $/line (ESTIMATE)	$97.50

RANK	NAME	WEEK APPS	CX COUNT	CX %	WoW APPS %	$ EARNED (est.)	LAST WEEK (SUN FINAL)		PREV WEEK (THU)		ROLLING 3-WK AVG	RUNNING WEEK TOTALS
							Apps	Cx	Apps	Cx		MON	TUE	WED	THU	FRI
3	🥉 Steve Nash	7	3	43%	▼ -50%	$683	14	6	8	3	9.7	4	0	0	0	3
4	Matthew Grant	6	4	67%	▼ -40%	$615	10	3	5	1	7.0	2	2	0	2	0
2	🥈 Steveo Ramos	9	5	56%	▲ 13%	$928	8	7			8.5	0	3	2	0	3
5	Ky. Tisdale	6	1	17%	► 0%	$585	6	3	3	3	5.0	0	1	0	0	3
6	Shaad Hypolite	6	4	67%	▼ -14%	$615	7	3	9	4	7.3	0	0	2	4	0
8	Quay Tyler	0	0	0%	▼ -100%	$0	4	1			2.0	0	0	0	0	0
1	🥇 Jordan Aguirre	17	6	35%	▲ 325%	$1,708	4	2			10.5	2	4	3	2	0
7	Gianna Smith	5	2	40%	-	$488					5.0	2	0	0	0	3
	TOTALS	56	25	45%		$5,620	53	25	25	11	6.9	10	10	7	8	12

TEAM HAS EARNED $5,620 THIS WEEK - KEEP PUSHING!

NOTES
Jemilise Malave removed from active roster (left, first flagged 8/17).
Tiauri Shaff removed 8/18 - she also left. Per instruction, her week's production (2 apps/1 cx) was folded into her mentor Steve Nash's total rather than dropped, since he's credited for developing her. Gianna Smith remains active under Nash.

SPECIAL EVENT LOG - standing practice, log every promo/multiplier day here going forward
Date/Day	Event Type	Multiplier	Reps Affected	Apps Impacted	CX Before Bonus	CX After Bonus	Notes
Tuesday	New-start departure - credit fold-in	n/a	Steve Nash (mentor), Tiauri Shaff (departed)	2 apps folded to Nash	Nash: 4 / 1	Nash: 6 / 2	Tiauri Shaff left after 2 days.
"""


class SlackMondayBoardTests(unittest.TestCase):
    def test_parses_slack_emoji_paste(self):
        banner, rows = parse_board(MONDAY_SLACK_BOARD)
        self.assertEqual(banner["dg_num"], 9)
        self.assertEqual(banner["dg_den"], 12)
        self.assertEqual(banner["nl_left"], 50)
        self.assertEqual(banner["day"], "Monday")
        self.assertEqual(len(rows), 8)
        by_name = {row["name"]: row for row in rows}
        self.assertEqual(by_name["Gianna Smith"]["apps"], 6)
        self.assertEqual(by_name["Gianna Smith"]["cx"], 2)
        self.assertEqual(by_name["Jordan Aguirre"]["apps"], 0)
        self.assertEqual(by_name["Jordan Aguirre"]["cx"], 1)
        self.assertEqual(by_name["Cam Winfield"]["apps"], 2)
        self.assertTrue(any("DATA ERROR" in flag for flag in by_name["Jordan Aguirre"]["flags"]))
        self.assertTrue(any("DATA ERROR" in flag for flag in by_name["Ismael Ramos"]["flags"]))
        self.assertTrue(any("DATA ERROR" in flag for flag in by_name["Kyron Tisdale"]["flags"]))

    def test_monday_process_ranks_gigi_first(self):
        banner, rows, notes = process_board(MONDAY_SLACK_BOARD)
        ranked = rank_rows(rows)
        self.assertEqual(banner["day"], "Monday")
        self.assertEqual(ranked[0]["name"], "Gianna Smith")
        self.assertEqual(ranked[0]["apps"], 6)
        self.assertEqual(ranked[1]["name"], "Cam Winfield")
        self.assertTrue(any("Jordan" in note or "DATA ERROR" in note for note in notes))


class FullTsvBoardTests(unittest.TestCase):
    def test_detects_full_board(self):
        self.assertTrue(looks_like_full_board(FULL_TSV))
        self.assertFalse(looks_like_full_board(SAMPLE_BOARD))

    def test_parses_banner_rows_notes_and_events(self):
        banner, rows = parse_board(FULL_TSV)
        self.assertEqual(banner["layout"], "full")
        self.assertEqual(banner["dg_num"], 8)
        self.assertEqual(banner["nl_left"], 25)
        self.assertEqual(banner["day"], "AS OF THURSDAY")
        self.assertEqual(banner["blended_rate"], 97.5)
        self.assertEqual(len(rows), 8)
        self.assertEqual({row["name"] for row in rows}, {
            "Nashly Paul",
            "Matthew Grant",
            "Ismael Ramos",
            "Kyron Tisdale",
            "Rashaad Hypolite",
            "Jaquay Tyler",
            "Jordan Aguirre",
            "Gianna Smith",
        })
        jordan = next(row for row in rows if row["name"] == "Jordan Aguirre")
        self.assertEqual(jordan["apps"], 17)
        self.assertEqual(jordan["cx"], 6)
        self.assertEqual(jordan["last_week_apps"], 4)
        self.assertEqual(jordan["mon"], 2)
        nash = next(row for row in rows if row["display_name"] == "Steve Nash")
        self.assertEqual(nash["apps"], 7)
        self.assertTrue(any("Tiauri Shaff" in note for note in banner["notes"]))
        self.assertEqual(banner["events"][0]["date"], "Tuesday")

    def test_full_board_does_not_refold_historical_notes(self):
        banner, rows, notes = process_board(FULL_TSV)
        self.assertEqual(banner["layout"], "full")
        self.assertEqual(len(rows), 8)
        self.assertEqual(notes, [])
        ranked = rank_rows(rows)
        self.assertEqual(ranked[0]["display_name"], "Jordan Aguirre")
        self.assertEqual(ranked[0]["rank"], 1)
        self.assertEqual(ranked[1]["display_name"], "Steveo Ramos")


if __name__ == "__main__":
    unittest.main()
