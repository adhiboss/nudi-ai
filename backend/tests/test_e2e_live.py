import time
import requests

base_url = "http://127.0.0.1:8000"

def run_test():
    # 1. Fetch voices
    print("Testing GET /api/voices...")
    r = requests.get(f"{base_url}/api/voices")
    assert r.status_code == 200, f"Expected 200, got {r.status_code}"
    voices = r.json()
    voice_names = [v["name"] for v in voices]
    print(f"Voices found ({len(voices)}): {voice_names}")

    # 2. Submit generation job
    print("\nTesting POST /api/generations...")
    with open("backend/test_portrait.jpg", "rb") as f:
        files = {"photo": ("portrait.jpg", f, "image/jpeg")}
        data = {
            "script": "Hello from the live integrated server test! This video is generated end-to-end.",
            "voice_id": "en_US-lessac-medium",
            "consent": "true"
        }
        r = requests.post(f"{base_url}/api/generations", files=files, data=data)

    assert r.status_code == 201, f"Expected 201, got {r.status_code}: {r.text}"
    job = r.json()
    job_id = job["id"]
    print(f"Job created successfully! ID: {job_id}, Initial Status: {job['status']}")

    # 3. Poll job status
    print("\nPolling job status...")
    completed = False
    video_url = None
    for i in range(90):
        time.sleep(1.0)
        r = requests.get(f"{base_url}/api/generations/{job_id}")
        assert r.status_code == 200
        current = r.json()
        status = current["status"]
        stage = current.get("stage_message", "")
        print(f"[{i+1}s] Status: {status} | Stage: {stage}")
        
        if status == "completed":
            completed = True
            video_url = current["output_video_url"]
            print(f"\nJob completed! Output video URL: {video_url}")
            break
        elif status == "failed":
            raise RuntimeError(f"Job failed: {current.get('error_message')}")

    assert completed, "Job timed out without completing!"

    # 4. Verify video download
    print(f"\nVerifying video download from {base_url}{video_url}...")
    r = requests.get(f"{base_url}{video_url}")
    assert r.status_code == 200
    assert len(r.content) > 50000, f"Expected >50KB video, got {len(r.content)} bytes"
    print(f"SUCCESS: Downloaded valid MP4 video of size {len(r.content)} bytes!")

if __name__ == "__main__":
    run_test()
