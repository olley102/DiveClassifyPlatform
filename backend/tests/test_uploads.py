from app import schemas
from app.auth import create_access_token
from app.routers import uploads
from fastapi import UploadFile
from io import BytesIO
from unittest.mock import patch
from pathlib import Path

def test_create_upload(client, test_user):
    token = create_access_token(data={"sub": str(test_user.id)})
    file_content = b"test file content"
    file = UploadFile(filename="test.txt", file=BytesIO(file_content))
    data = {"user_id": test_user.id, "lat": 10.0, "lon": 20.0, "depth": 30.0}
    with patch("os.makedirs"), patch("builtins.open", create=True), patch("shutil.copyfileobj"):
        response = client.post(
            "/uploads/",
            data=data,
            files={"file": ("test.txt", file_content, "text/plain")},
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        upload = schemas.Upload(**response.json())
        assert upload.filename == "test.txt"
        assert upload.storage_filename != "test.txt"
        assert upload.user_id == test_user.id
        assert (uploads.UPLOAD_DIR / upload.storage_filename).exists()
