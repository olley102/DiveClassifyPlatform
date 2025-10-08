from app import schemas, models
from app.auth import create_access_token, get_password_hash
from datetime import datetime, timezone
from pydantic import AwareDatetime

from sqlalchemy.sql import text

def test_create_user(client, test_session):
    tables = test_session.execute(text("SELECT name FROM sqlite_master WHERE type='table';")).fetchall()
    print("Tables in db before POST:", [t[0] for t in tables])
    user_data = {
        "name": "John Doe",
        "email": "john@example.com",
        "affiliation": "Test Org",
        "role": "user",
        "password": "securepassword123"
    }
    response = client.post("/users/", json=user_data)
    print(f"Status: {response.status_code}, Headers: {response.headers}, Body: {response.text}")
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    user = schemas.User(**response.json())
    assert user.email == user_data["email"]
    assert user.name == user_data["name"]
    assert user.role == models.UserRole.USER
    assert isinstance(user.created_at, datetime)
    assert user.created_at.tzinfo is not None, "created_at must be timezone-aware"
    print("Response user created_at:", user.created_at, "is aware:", user.created_at.tzinfo is not None)

def test_get_users_admin(client, test_user, test_session):
    token = create_access_token(data={"sub": test_user.email})
    response = client.get("/users/", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 403  # Non-admin fails

    admin_user = models.User(
        name="Admin User",
        email="admin@example.com",
        hashed_password=get_password_hash("adminpassword"),
        role=models.UserRole.ADMIN,
        created_at=datetime.now(timezone.utc)
    )
    test_session.add(admin_user)
    test_session.commit()
    test_session.refresh(admin_user)
    token = create_access_token(data={"sub": admin_user.email})
    response = client.get("/users/", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    users = [schemas.UserPublic(**u) for u in response.json()]
    assert len(users) >= 1
    assert any(u.email == admin_user.email for u in users)
