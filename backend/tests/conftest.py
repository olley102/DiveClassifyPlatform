import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base, get_db
from app.main import app
from app.auth import get_password_hash
from app import models
from datetime import datetime, timezone

from sqlalchemy.sql import text

SQLALCHEMY_DATABASE_URL = "sqlite:///test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="session")
def test_session():
    from app import models  # Ensure models are imported
    Base.metadata.drop_all(bind=engine)  # Ensure clean state at session start
    Base.metadata.create_all(bind=engine)  # Create all tables
    print("Tables created (session):", Base.metadata.tables.keys())  # Debug
    session = TestingSessionLocal()
    try:
        # Debug: Verify table exists
        tables = session.execute(text("SELECT name FROM sqlite_master WHERE type='table';")).fetchall()
        print("Available tables in test session:", [t[0] for t in tables])
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)  # Clean up at session end

@pytest.fixture(scope="function")
def db(test_session):
    # Use the session-scoped session, no need to recreate
    print("Using test session with URL:", test_session.bind.url)  # Debug
    tables = test_session.execute("SELECT name FROM sqlite_master WHERE type='table';").fetchall()
    print("Available tables in db fixture:", [t[0] for t in tables])
    yield test_session  # Yield the same session

@pytest.fixture(scope="session", autouse=True)
def setup_db_override(test_session):
    def override_get_db():
        print("Providing test session with URL:", test_session.bind.url)  # Debug
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
        email="test@example.com",
        hashed_password=get_password_hash("testpassword"),
        role=models.UserRole.USER,
        created_at=datetime.now(timezone.utc)
    )
    test_session.add(user)
    test_session.commit()
    test_session.refresh(user)
    print("Test user created with id:", user.id, "in session:", test_session.bind.url)  # Debug
    user_check = test_session.query(models.User).filter_by(id=user.id).first()
    print("User verification in test_user:", "Found" if user_check else "Not found")
    return user

@pytest.fixture(autouse=True)
def setup_auth():
    from app import auth
    auth.SECRET_KEY = "test-secret-key"
    yield
    auth.SECRET_KEY = "your-secret-key"
