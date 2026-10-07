import io
import random

from PIL import Image


def encode(img: Image.Image, fmt: str, **kwargs) -> bytes:
    buf = io.BytesIO()
    img.save(buf, format=fmt, **kwargs)
    return buf.getvalue()


def software_exif(value: str = "PIXORA-Test-Editor 1.0") -> Image.Exif:
    exif = Image.Exif()
    exif[305] = value  # 0x0131 Software
    return exif


def flat_jpeg(**kwargs) -> bytes:
    """Flat red JPEG. ELA max diff is 0 (below threshold). No EXIF unless given."""
    return encode(Image.new("RGB", (100, 100), "red"), "JPEG", **kwargs)


def noise_png(**kwargs) -> bytes:
    """Deterministic random-noise PNG. ELA max diff is far above threshold
    because lossless noise is first JPEG-compressed during the ELA resave."""
    rng = random.Random(1234)
    img = Image.frombytes("RGB", (128, 128), bytes(rng.randrange(256) for _ in range(128 * 128 * 3)))
    return encode(img, "PNG", **kwargs)
