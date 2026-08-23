import unittest

from update_gunit_board import (
    apply_departures_and_folds,
    normalize_name,
    parse_board,
    process_board,
    rank_rows,
    tier_bonus,
    validate_against_previous,
)


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


if __name__ == "__main__":
    unittest.main()
