from app import schemas
from app.auth import create_access_token

def test_create_upload_valid_image(client, test_user, test_session):
    file_content = b"Test JPEG content"
    filename = "dive_photo.jpg"
    token = create_access_token(data={"sub": str(test_user.id)})
    response = client.post(
        "/uploads/",
        files={"file": (filename, file_content, "image/jpeg")},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    upload = schemas.Upload(**response.json())
    assert upload.filename == filename
    assert upload.user_id == test_user.id

def test_create_upload_invalid_type(client, test_user):
    file_content = b"Invalid content"
    filename = "dive_video.mp4"
    token = create_access_token(data={"sub": str(test_user.id)})
    response = client.post(
        "/uploads/",
        files={"file": (filename, file_content, "video/mp4")},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 400
    assert "Only image files (JPEG, PNG) allowed" in response.text

def test_create_upload_too_large(client, test_user):
    # Simulate large file (>10 MB)
    large_content = b"A" * (10 * 1024 * 1024 + 1)
    filename = "large_dive_photo.jpg"
    token = create_access_token(data={"sub": str(test_user.id)})
    response = client.post(
        "/uploads/",
        files={"file": (filename, large_content, "image/jpeg")},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 400
    assert "File too large. Max 10 MB allowed" in response.text
