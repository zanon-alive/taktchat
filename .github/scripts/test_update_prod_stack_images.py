#!/usr/bin/env python3
import unittest

from update_prod_stack_images import apply_digests


SAMPLE = """
    image: ghcr.io/${TAKTCHAT_OWNER:-zanon-alive}/taktchat-backend@sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
    image: ghcr.io/${TAKTCHAT_OWNER:-zanon-alive}/taktchat-backend-browser@sha256:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
    image: ghcr.io/${TAKTCHAT_OWNER:-zanon-alive}/taktchat-frontend@sha256:cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc
"""


class ApplyDigestsTest(unittest.TestCase):
    def test_browser_nao_altera_backend(self):
        backend = "dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd"
        browser = "eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
        frontend = "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
        out = apply_digests(
            SAMPLE,
            backend=f"sha256:{backend}",
            browser=f"sha256:{browser}",
            frontend=frontend,
        )
        self.assertIn(f"taktchat-backend@sha256:{backend}", out)
        self.assertIn(f"taktchat-backend-browser@sha256:{browser}", out)
        self.assertIn(f"taktchat-frontend@sha256:{frontend}", out)
        self.assertNotIn("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", out)

    def test_so_frontend(self):
        frontend = "1111111111111111111111111111111111111111111111111111111111111111"
        out = apply_digests(SAMPLE, frontend=frontend)
        self.assertIn(f"taktchat-frontend@sha256:{frontend}", out)
        self.assertIn("taktchat-backend@sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", out)
        self.assertIn("taktchat-backend-browser@sha256:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb", out)


if __name__ == "__main__":
    unittest.main()
