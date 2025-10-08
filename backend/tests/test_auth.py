import pytest
from app import schemas, models, database
from app.auth import create_access_token, get_password_hash
from unittest.mock import patch

@pytest.mark.asyncio
async def test_login(client, test_user):
    with patch("app.auth.verify_password", return_value=True):
        response = client.post(
            "/users/token",
            data={"username": test_user.email, "password": "testpassword"}
        )
        assert response.status_code == 200
        token = schemas.Token(**response.json())
        assert token.token_type == "bearer"
