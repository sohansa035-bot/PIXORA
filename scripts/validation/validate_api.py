import io
import json
from pathlib import Path
import requests
from PIL import Image

def create_camera_photo():
    # Create a nice RGB image with low/uniform noise
    img = Image.new("RGB", (320, 240), color=(120, 150, 180))
    # Add EXIF metadata with Camera Make and Model
    exif = img.getexif()
    exif[0x010f] = "Canon"  # Make
    exif[0x0110] = "Canon EOS 5D Mark IV"  # Model
    exif[0x0132] = "2024:06:15 11:32:00"  # DateTime
    
    assets_dir = Path(__file__).resolve().parents[2] / "frontend" / "public" / "test_assets"
    out_path = assets_dir / "test_camera_photo.jpg"
    img.save(str(out_path), "JPEG", quality=95, exif=exif)
    print(f"Created camera photo: {out_path}")

create_camera_photo()

assets_dir = Path(__file__).resolve().parents[2] / "frontend" / "public" / "test_assets"
test_files = [
    str(assets_dir / "test_camera_photo.jpg"),
    str(assets_dir / "test_tampered_software.jpg"),
    str(assets_dir / "test_valid.png"),
    str(assets_dir / "test_noise_noexif.jpg"),
    str(assets_dir / "test_corrupt.jpg"),
]

for fp in test_files:
    fname = fp.split("\\")[-1]
    with open(fp, "rb") as f:
        content = f.read()
    
    resp = requests.post("http://localhost:8000/api/investigate", files={"file": (fname, content, "image/jpeg" if fname.endswith(".jpg") else "image/png")})
    print(f"\n====================== {fname} (Status: {resp.status_code}) ======================")
    if resp.status_code == 200:
        data = resp.json()
        print(f"Analysis ID: {data.get('analysis', {}).get('analysis_id')}")
        print(f"Hash: {data.get('image_hash')}")
        print(f"Assessment: {data.get('assessment', {}).get('final_decision')}")
        print(f"Sufficiency: {data.get('assessment', {}).get('sufficiency')}")
        print(f"Eligibility: {data.get('assessment', {}).get('eligibility')}")
        print(f"What Can Be Established:")
        for item in data.get('assessment', {}).get('what_can_be_established', []):
            print(f"  + {item}")
        print(f"What Cannot:")
        for item in data.get('assessment', {}).get('what_cannot_be_established', []):
            print(f"  - {item}")
        print(f"Relationships count: {len(data.get('relationships', []))}")
        for r in data.get('relationships', []):
            print(f"  * [{r['id']}] {r['relationship_type']}: {r['description']}")
    else:
        print(f"Error: {resp.text}")
