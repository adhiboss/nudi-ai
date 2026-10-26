import os
import io
import pytest
from fastapi.testclient import TestClient
import cv2
import numpy as np

import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app
from app.services.job_manager import job_manager

client = TestClient(app)

def create_test_image_bytes(format=".jpg", size=(200, 200)):
    img = np.ones((size[1], size[0], 3), dtype=np.uint8) * 128
    success, encoded = cv2.imencode(format, img)
    assert success
    return encoded.tobytes()

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"

def test_get_voices():
    response = client.get("/api/voices")
    assert response.status_code == 200
    voices = response.json()
    assert isinstance(voices, list)
    assert len(voices) >= 1
    # Check voice schema
    for v in voices:
        assert "id" in v
        assert "name" in v
        assert "language" in v

def test_reject_empty_script():
    img_bytes = create_test_image_bytes()
    response = client.post(
        "/api/generations",
        data={"script": "   ", "voice_id": "en_US-lessac-medium", "consent": "true"},
        files={"photo": ("test.jpg", img_bytes, "image/jpeg")}
    )
    assert response.status_code == 400
    assert "empty" in response.json()["detail"].lower()

def test_reject_overly_long_script():
    img_bytes = create_test_image_bytes()
    long_script = "a" * 501
    response = client.post(
        "/api/generations",
        data={"script": long_script, "voice_id": "en_US-lessac-medium", "consent": "true"},
        files={"photo": ("test.jpg", img_bytes, "image/jpeg")}
    )
    assert response.status_code == 400
    assert "exceeds maximum" in response.json()["detail"].lower()

def test_reject_missing_consent():
    img_bytes = create_test_image_bytes()
    response = client.post(
        "/api/generations",
        data={"script": "Hello world", "voice_id": "en_US-lessac-medium", "consent": "false"},
        files={"photo": ("test.jpg", img_bytes, "image/jpeg")}
    )
    assert response.status_code == 400
    assert "permission" in response.json()["detail"].lower()

def test_reject_invalid_voice():
    img_bytes = create_test_image_bytes()
    response = client.post(
        "/api/generations",
        data={"script": "Hello world", "voice_id": "non_existent_voice_999", "consent": "true"},
        files={"photo": ("test.jpg", img_bytes, "image/jpeg")}
    )
    assert response.status_code == 400
    assert "not available" in response.json()["detail"].lower()

def test_reject_invalid_image_format():
    fake_bytes = b"NOT AN IMAGE"
    response = client.post(
        "/api/generations",
        data={"script": "Hello world", "voice_id": "en_US-lessac-medium", "consent": "true"},
        files={"photo": ("test.txt", fake_bytes, "text/plain")}
    )
    assert response.status_code == 400
    assert "invalid image format" in response.json()["detail"].lower()

def test_valid_job_creation_and_status():
    img_bytes = create_test_image_bytes()
    response = client.post(
        "/api/generations",
        data={"script": "Hello test", "voice_id": "en_US-lessac-medium", "consent": "true"},
        files={"photo": ("test.jpg", img_bytes, "image/jpeg")}
    )
    assert response.status_code == 201
    job = response.json()
    assert "id" in job
    assert job["status"] in ["queued", "processing", "completed"]
    assert job["script_text"] == "Hello test"
    
    # Retrieve job status
    job_id = job["id"]
    status_resp = client.get(f"/api/generations/{job_id}")
    assert status_resp.status_code == 200
    assert status_resp.json()["id"] == job_id
    
    # Delete job
    del_resp = client.delete(f"/api/generations/{job_id}")
    assert del_resp.status_code == 200
