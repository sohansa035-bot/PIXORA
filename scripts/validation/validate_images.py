import urllib.request
import json
from pathlib import Path

boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW"
assets = Path(__file__).resolve().parents[2] / "frontend" / "public" / "test_assets"

for filename in ["test_camera_photo.jpg", "test_flat_noexif.jpg", "test_tampered_software.jpg", "test_noise_noexif.jpg", "test_valid.png"]:
    content = (assets / filename).read_bytes()
    mime = "image/png" if filename.endswith(".png") else "image/jpeg"
    body = (
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="file"; filename="{filename}"\r\n'
        f"Content-Type: {mime}\r\n\r\n"
    ).encode() + content + f"\r\n--{boundary}--\r\n".encode()

    req = urllib.request.Request(
        "http://127.0.0.1:8000/api/investigate",
        data=body,
        headers={"Content-Type": f"multipart/form-data; boundary={boundary}"}
    )

    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode())
        print(f"=== {filename} ===")
        print("SHA-256:", data["image_hash"])
        print("Format:", data["analysis"]["input_format"])
        print("Dimensions:", f"{data['analysis']['width']}x{data['analysis']['height']}")
        
        meta = [e for e in data["evidence"] if e["evidence_type"] == "METADATA"]
        meta_avail = "AVAILABLE" if any(e["status"] == "VERIFIED" and e["observation_type"] != "EXIF_ABSENT" for e in meta) else "ABSENT"
        print("Metadata Availability:", meta_avail)
        
        ela = [e for e in data["evidence"] if "ELA" in (e.get("observation_type") or "")]
        ela_app = "NOT_APPLICABLE" if any(e["observation_type"] == "ELA_NOT_APPLICABLE" for e in ela) else "APPLICABLE"
        print("ELA Applicability:", ela_app)
        if ela:
            print("ELA Result:", ela[0]["observation"])
        
        print("Final Decision:", data["assessment"]["final_decision"])
        print("Sufficiency:", data["assessment"]["sufficiency"])
        print("Eligibility:", data["assessment"]["eligibility"])
        print("Explanation:", data["assessment"]["explanation"])
        print()
