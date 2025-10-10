from app import schemas
from unittest.mock import patch

def test_login(client, test_user):
    with patch("app.auth.verify_password", return_value=True):
        response = client.post(
            "/token",
            data={"username": test_user.username, "password": "testpassword"}
        )
        assert response.status_code == 200
        token = schemas.Token(**response.json())
        assert token.token_type == "bearer"
