import io
from PIL import Image
from backend.forensics.metadata_analyzer import analyze_metadata
from backend.forensics.pixel_analyzer import analyze_pixels
from backend.models.evidence import EvidenceType

def create_dummy_image():
    img = Image.new('RGB', (100, 100), color = 'red')
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='JPEG')
    return img_byte_arr.getvalue()

def test_pixel_analyzer():
    img_bytes = create_dummy_image()
    evidence_list = analyze_pixels(img_bytes)
    assert len(evidence_list) > 0
    assert evidence_list[0].evidence_type == EvidenceType.PIXEL

def test_metadata_analyzer_no_metadata():
    img_bytes = create_dummy_image() # Pillow save doesn't write EXIF by default
    evidence_list = analyze_metadata(img_bytes)
    assert len(evidence_list) > 0
    assert evidence_list[0].evidence_type == EvidenceType.METADATA
    assert "No EXIF metadata found" in evidence_list[0].observation
