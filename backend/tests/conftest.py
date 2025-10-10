import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base, get_db
from app.main import app
from app.auth import get_password_hash
from app import models
from datetime import datetime, timezone
from uuid import uuid4

SQLALCHEMY_DATABASE_URL = "sqlite:///test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="session")
def test_session():
    from app import models  # Ensure models are imported
    Base.metadata.drop_all(bind=engine)  # Ensure clean state at session start
    Base.metadata.create_all(bind=engine)  # Create all tables
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.commit()
        session.close()
        Base.metadata.drop_all(bind=engine)  # Clean up at session end

@pytest.fixture(scope="function")
def db(test_session):
    yield test_session

@pytest.fixture(scope="session", autouse=True)
def setup_db_override(test_session):
    def override_get_db():
        yield test_session  # Use the same session
    app.dependency_overrides[get_db] = override_get_db
    yield
    app.dependency_overrides.clear()

@pytest.fixture
def client(test_session):
    with TestClient(app) as c:
        yield c

@pytest.fixture
def test_user(test_session):
    user = models.User(
        name="Test User",
        username=f"test_{uuid4()}",
        email=f"test_{uuid4()}@example.com",
        hashed_password=get_password_hash("testpassword"),
        role=models.UserRole.USER,
        created_at=datetime.now(timezone.utc)
    )
    test_session.add(user)
    test_session.commit()
    test_session.refresh(user)
    return user

@pytest.fixture(autouse=True)
def setup_auth():
    from app import auth
    auth.SECRET_KEY = "test-secret-key"
    yield
    auth.SECRET_KEY = "your-secret-key"
