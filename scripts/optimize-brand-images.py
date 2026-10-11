"""Generate lightweight web copies; never change reference originals.
Requires Pillow only when regenerating committed assets, not for npm build.
"""
from pathlib import Path
from PIL import Image
import json
root = Path(__file__).resolve().parents[1]
manifest = []
for name in ['wanhua-official-logo', 'wan-qiaoqiao-ip-character-sheet', 'three-sub-brands-showcase']:
    source = root / 'reference/brand' / (name + '.png')
    image = Image.open(source).convert('RGBA' if name != 'three-sub-brands-showcase' else 'RGB')
    if name == 'wanhua-official-logo':
        image.thumbnail((320, 320), Image.Resampling.LANCZOS)
    output = root / 'public/images' / (name + '.webp')
    image.save(output, 'WEBP', quality=88, method=6)
    manifest.append({'file': output.name, 'source': str(source.relative_to(root)), 'width': image.width, 'height': image.height, 'bytes': output.stat().st_size, 'conversion': 'WebP quality 88; logo resized to 320px, other dimensions unchanged; original reference retained'})
    print(f'{output.name}: {source.stat().st_size:,} -> {output.stat().st_size:,} bytes')
(root / 'public/images/brand-sources.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
