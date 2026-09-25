import json
import unittest

from gunit_hashtag import (
    extract_phone_count,
    format_channel_update,
    has_gunit_hashtag,
    looks_like_full_board,
    parse_hashtag_sale,
    sales_log_row,
)
from ingest_gunit_hashtag import main as ingest_main


class HashtagParserTests(unittest.TestCase):
    def test_hashtag_detection(self):
        self.assertTrue(has_gunit_hashtag("2 phones #g-unit"))
        self.assertTrue(has_gunit_hashtag("closed one #GUnit"))
        self.assertFalse(has_gunit_hashtag("2 phones"))
        self.assertTrue(
            looks_like_full_board("1. Gigi 6 Apps | 2 CX\n2. Matthew 1 App | 1 CX")
        )

    def test_phone_counts(self):
        self.assertEqual(extract_phone_count("2 phones #g-unit"), 2)
        self.assertEqual(extract_phone_count("sold 3 #g-unit"), 3)
        self.assertEqual(extract_phone_count("#g-unit 1"), 1)
        self.assertEqual(extract_phone_count("closed 4 phones #g-unit"), 4)
        self.assertEqual(extract_phone_count("#g-unit let's go"), 1)
        self.assertEqual(extract_phone_count("CX1\nNL1\n#g-unit"), 1)
        self.assertEqual(extract_phone_count("CX1\nNL1\nNL2\nNL3\nNL4\n#g-unit"), 4)
        self.assertEqual(
            extract_phone_count("CX 2\nNL 3: Galaxy S25\nNL 4: iPhone 17 PM\n#g-unit"),
            2,
        )

    def test_nl_cx_shoutout(self):
        event = parse_hashtag_sale(
            "D2D\nCX1\nNL1\nNL2\n#g-unit\n#certifiedcloser",
            {"author": "Jordan Aguirre"},
        )
        self.assertTrue(event["matched"])
        self.assertEqual(event["phones"], 2)
        self.assertEqual(event["cx"], 1)
        self.assertEqual(event["name"], "Jordan Aguirre")

    def test_starred_so_lines_do_not_steal_seller(self):
        event = parse_hashtag_sale(
            """*Drum rolls please!!!!!*
*D2D*
*S/O Drew Tepper
S/O Matthew Grant*
*S/O G-UNIT Nash-Sama Rashaad Hyppolite@Kyron MY DAWG!@Jordan@MattJ@Judah
@GEE@Kenziee@Nate@Shaunte@Neika@Treasure@Fritzna@Davon@
Cx1

NL 1 iPhone 18 Pro/Prem
NL 2 iPhone 18 Pro/Prem

#G-UNIT *#IAM back* *#1More* *#keystothecity*""",
            {"author": "Ismael"},
        )
        self.assertTrue(event["matched"])
        self.assertEqual(event["phones"], 2)
        self.assertEqual(event["cx"], 1)
        self.assertEqual(event["name"], "Ismael Ramos")

    def test_nate_cx2_nl3_to_nl5_is_three_phones(self):
        event = parse_hashtag_sale(
            """D2D
*Big S/O* (Drew Tepper) For bringing me on
S/O (Matthew Grant) For the mentorship
S/O G-UNIT (Nash-Sama)
Cx2
NL 3 Samsung galaxy s26
NL 4 Samsung Galaxy s26
NL 5 Samsung Galaxy a17
#G-unit""",
            {"author": "Nate"},
        )
        self.assertTrue(event["matched"])
        self.assertEqual(event["phones"], 3)
        self.assertEqual(event["cx"], 2)
        self.assertEqual(event["name"], "Nate")

    def test_guy_thursday_two_phone_close(self):
        event = parse_hashtag_sale(
            """*D2D*
*S/O* (Drew Tepper) For the opportunity
S/O (Matthew Grant) For the mentorship
S/O G-UNIT
Cx1
NL1 iphone 18 pro
NL 2Samsung galaxy s26+
#G-unit""",
            {"author": "GUY"},
        )
        self.assertTrue(event["matched"])
        self.assertEqual(event["phones"], 2)
        self.assertEqual(event["cx"], 1)
        self.assertEqual(event["name"], "Guy Lesperance")

    def test_ismael_thursday_one_phone_close(self):
        event = parse_hashtag_sale(
            """*D2D*
*S/O Drew Tepper FOR THIS AMAZING OPPORTUNITY*
*S/O Matthew Grant*
*S/O G-UNIT Nash-Sama @Kyron MY DAWG!*
*Cx1*
*NL 1 iPhone 18 Pro/Prem*
#G-UNIT *#IAM back* *#1More*""",
            {"author": "Ismael"},
        )
        self.assertTrue(event["matched"])
        self.assertEqual(event["phones"], 1)
        self.assertEqual(event["cx"], 1)
        self.assertEqual(event["name"], "Ismael Ramos")

    def test_nate_thursday_d2d_is_two_phones(self):
        event = parse_hashtag_sale(
            """D2D
S/O (Drew Tepper) For the business opportunity
S/O (Matthew Grant) For the mentorship
S/O G-UNIT
Cx 1
NL 1 iPhone 18 pro max
NL 2 Samsung Galaxy s26 Ultra
#G-unit""",
            {"author": "Nate"},
        )
        self.assertTrue(event["matched"])
        self.assertEqual(event["phones"], 2)
        self.assertEqual(event["cx"], 1)
        self.assertEqual(event["name"], "Nate")

    def test_kyron_thursday_ice_break_is_one_phone(self):
        event = parse_hashtag_sale(
            """D2D
S/O (Drew Tepper) Ice Broken
S/O (Matthew Grant) Getting you to AM
S/O G-Unit (Ismael) (Nash-Sama) (GUY) (Nate)
Cx1
NL1
iPhone 18 Pro
#G-Unit #BackInMotion #1More""",
            {"author": "Kyron Tisdale"},
        )
        self.assertTrue(event["matched"])
        self.assertEqual(event["phones"], 1)
        self.assertEqual(event["cx"], 1)
        self.assertEqual(event["name"], "Kyron Tisdale")

    def test_nianna_so_lines_do_not_steal_seller(self):
        event = parse_hashtag_sale(
            """*S/O* (Drew Tepper) & (Matthew Grant) for Business mentorship
*S/O* (Nash-Sama) for training
*S/O The UNIT* (Rashaad Hyppolite) (Kyron Tisdale) (Ismael) (Jordan Aguirre) (GUY) (Nate)
*CX 1*
*NL 1: Galaxy S26 +*
*NL 2: Galaxy S26 +*
#G-Unit #Team7 #ontop""",
            {"author": "Nianna"},
        )
        self.assertTrue(event["matched"])
        self.assertEqual(event["phones"], 2)
        self.assertEqual(event["cx"], 1)
        self.assertEqual(event["name"], "Nianna")

    def test_coivon_starred_so_lines_do_not_steal_seller(self):
        event = parse_hashtag_sale(
            """*D2D*
*S/O Drew Tepper*
*S/O Matthew Grant*
*S/O Ismael for the training/Mentorship*
*S/O G-UNIT Nash-Sama@Kyron MY DAWG!@Jordan@MattJ@GEE@Kenziee@Nate@Shaunte@Neika@Treasure@Fritzna@Davon@Jamal*
*Cx1*
*NL 1 iPhone 18 pro/Premium*
#G-UNIT *#IAM back* *#1More* *#keystothecity*""",
            {"author": "Coivon Patterson"},
        )
        self.assertTrue(event["matched"])
        self.assertEqual(event["phones"], 1)
        self.assertEqual(event["cx"], 1)
        self.assertEqual(event["name"], "Coivon Patterson")

    def test_nate_d2d_shoutout_ignores_so_names(self):
        event = parse_hashtag_sale(
            """D2D
S/O @Drew Tepper For the business opportunity
S/O @Matthew Grant for the porting assist
S/O
Devin Kenzie, Matt, Ashunte
Cx 1
NL 1
NL 2 iPhone 17 pro 2x
#G-unit""",
            {"author": "Nate"},
        )
        self.assertTrue(event["matched"])
        self.assertEqual(event["phones"], 2)
        self.assertEqual(event["cx"], 1)
        self.assertEqual(event["name"], "Nate")

    def test_nickname_and_cx(self):
        event = parse_hashtag_sale("Gigi sold 2 phones 1 CX #g-unit", {"author": "Other"})
        self.assertTrue(event["matched"])
        self.assertEqual(event["name"], "Gianna Smith")
        self.assertEqual(event["phones"], 2)
        self.assertEqual(event["cx"], 1)

    def test_author_fallback(self):
        event = parse_hashtag_sale("2 phones #g-unit", {"author": "Steve Nash"})
        self.assertEqual(event["name"], "Nashly Paul")

    def test_channel_update_copy(self):
        event = parse_hashtag_sale("Cam 1 phone #g-unit", {"author": "Cam"})
        message = format_channel_update(event, totals={"apps": 40, "cx": 23})
        self.assertIn("G-UNIT LIVE SALE", message)
        self.assertIn("Cam Winfield", message)
        self.assertIn("+1 phone", message)

    def test_sales_log_row_shape(self):
        event = parse_hashtag_sale("1 phone #g-unit", {"author": "Ky", "ts": "1.2"})
        row = sales_log_row(event)
        self.assertEqual(len(row), 8)
        self.assertEqual(row[2], "Kyron Tisdale")
        self.assertEqual(row[3], 1)

    def test_ingest_cli_dry_run(self):
        import io
        from contextlib import redirect_stdout

        buffer = io.StringIO()
        with redirect_stdout(buffer):
            code = ingest_main(["--text", "2 phones #g-unit", "--author", "Gigi"])
        self.assertEqual(code, 0)
        payload = json.loads(buffer.getvalue())
        self.assertEqual(payload["action"], "post")
        self.assertEqual(payload["event"]["phones"], 2)
        self.assertIn("G-UNIT LIVE SALE", payload["slackMessage"])

    def test_ingest_cli_ignores_board_paste(self):
        import io
        from contextlib import redirect_stdout

        board = "1. Gigi 6 Apps | 2 CX\n2. Matthew 1 App | 1 CX #g-unit"
        buffer = io.StringIO()
        with redirect_stdout(buffer):
            code = ingest_main(["--text", board, "--author", "Nash"])
        self.assertEqual(code, 0)
        payload = json.loads(buffer.getvalue())
        self.assertEqual(payload["action"], "ignore")


if __name__ == "__main__":
    unittest.main()
