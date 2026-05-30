from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
ASSET_DIR = ROOT / "assets" / "images" / "runner"
SOURCE = ASSET_DIR / "runner-assets-source.png"
OUTPUTS = [
    "prince-jump.png",
    "barrel-obstacle.png",
    "stone-arch-obstacle.png",
]


def remove_green_background(image):
    image = image.convert("RGBA")
    pixels = image.load()
    width, height = image.size

    for y in range(height):
        for x in range(width):
            red, green, blue, alpha = pixels[x, y]
            is_key_green = (
                green > 150
                and red < 95
                and blue < 120
                and green > red * 1.5
                and green > blue * 1.5
            )
            if is_key_green:
                pixels[x, y] = (0, 0, 0, 0)

    return image


def crop_subject(cell):
    bbox = cell.getchannel("A").getbbox()
    if not bbox:
        return cell

    pad = 24
    left, top, right, bottom = bbox
    return cell.crop(
        (
            max(0, left - pad),
            max(0, top - pad),
            min(cell.width, right + pad),
            min(cell.height, bottom + pad),
        )
    )


def normalize_sprite(sprite):
    sprite.thumbnail((360, 360), Image.Resampling.LANCZOS)
    final = Image.new("RGBA", (384, 384), (0, 0, 0, 0))
    final.alpha_composite(
        sprite,
        ((final.width - sprite.width) // 2, (final.height - sprite.height) // 2),
    )
    return final


def main():
    image = remove_green_background(Image.open(SOURCE))
    width, height = image.size

    for index, filename in enumerate(OUTPUTS):
        left = round(index * width / len(OUTPUTS))
        right = round((index + 1) * width / len(OUTPUTS))
        cell = image.crop((left, 0, right, height))
        normalize_sprite(crop_subject(cell)).save(ASSET_DIR / filename)

    barrel_source = ASSET_DIR / "barrel-source.png"
    if barrel_source.exists():
        barrel = remove_green_background(Image.open(barrel_source))
        normalize_sprite(crop_subject(barrel)).save(ASSET_DIR / "barrel-obstacle.png")


if __name__ == "__main__":
    main()
