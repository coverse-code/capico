import os
import sqlite3
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from server import create_app


class AuthApiTests(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.database_path = Path(self.temp_dir.name) / "auth-test.sqlite3"
        self.app = create_app("sqlite:///" + self.database_path.as_posix(), cookie_secure=False)
        self.client = self.app.test_client()

    def tearDown(self):
        self.temp_dir.cleanup()

    def test_registration_login_and_logout(self):
        registration = self.client.post(
            "/api/register",
            json={
                "phone": "+998 90 123 45 67",
                "username": "SampleUser",
                "password": "SecurePass987",
            },
        )
        self.assertEqual(registration.status_code, 201)
        self.assertEqual(registration.json["username"], "sampleuser")
        self.assertIn("HttpOnly", registration.headers["Set-Cookie"])
        self.assertEqual(self.client.get("/api/me").json["username"], "sampleuser")

        login = self.client.post(
            "/api/login",
            json={"username": "SAMPLEUSER", "password": "SecurePass987"},
        )
        self.assertEqual(login.status_code, 200)

        logout = self.client.post("/api/logout")
        self.assertEqual(logout.status_code, 200)
        self.assertEqual(self.client.get("/api/me").status_code, 401)

    def test_account_can_login_through_a_second_app_instance(self):
        registration = self.client.post(
            "/api/register",
            json={
                "phone": "+998901234572",
                "username": "sharedaccount",
                "password": "SecurePass987",
            },
        )
        self.assertEqual(registration.status_code, 201)

        second_app = create_app(
            "sqlite:///" + self.database_path.as_posix(), cookie_secure=False
        )
        second_client = second_app.test_client()
        login = second_client.post(
            "/api/login",
            json={"username": "sharedaccount", "password": "SecurePass987"},
        )
        self.assertEqual(login.status_code, 200)
        self.assertEqual(second_client.get("/api/me").json["username"], "sharedaccount")

    def test_password_is_not_stored_as_plaintext(self):
        self.client.post(
            "/api/register",
            json={
                "phone": "+998901234568",
                "username": "storedpass",
                "password": "SecurePass987",
            },
        )
        database = sqlite3.connect(self.database_path)
        try:
            user = database.execute(
                "SELECT password_hash, password_salt FROM users WHERE username = ?",
                ("storedpass",),
            ).fetchone()
        finally:
            database.close()
        self.assertIsNotNone(user)
        self.assertNotEqual(user[0], "SecurePass987")
        self.assertNotEqual(user[0], user[1])

    def test_duplicate_login_or_phone_is_rejected(self):
        payload = {
            "phone": "+998901234569",
            "username": "uniqueuser",
            "password": "SecurePass987",
        }
        self.assertEqual(self.client.post("/api/register", json=payload).status_code, 201)
        duplicate_username = dict(payload, phone="+998901234570")
        duplicate_phone = dict(payload, username="anotheruser")
        self.assertEqual(self.client.post("/api/register", json=duplicate_username).status_code, 409)
        self.assertEqual(self.client.post("/api/register", json=duplicate_phone).status_code, 409)

    def test_invalid_password_and_wrong_login_are_rejected(self):
        weak_password = self.client.post(
            "/api/register",
            json={"phone": "+998901234571", "username": "weakpass", "password": "123456"},
        )
        self.assertEqual(weak_password.status_code, 400)
        wrong_login = self.client.post(
            "/api/login",
            json={"username": "missinguser", "password": "SecurePass987"},
        )
        self.assertEqual(wrong_login.status_code, 401)

    def test_vercel_requires_a_persistent_database(self):
        with patch.dict(os.environ, {"VERCEL": "1"}, clear=True):
            with self.assertRaisesRegex(RuntimeError, "DATABASE_URL"):
                create_app()

    def test_static_site_files_are_served_by_the_app(self):
        response = self.client.get("/kod/stocks.html")
        self.assertEqual(response.status_code, 200)
        self.assertIn("text/html", response.content_type)
        response.close()


if __name__ == "__main__":
    unittest.main()
