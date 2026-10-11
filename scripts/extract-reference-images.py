"""Export embedded PDF images without redrawing; originals in reference stay unchanged.
Requires PyMuPDF (only for regenerating committed images, not npm development).
"""
from pathlib import Path
import fitz
import json
import shutil
root = Path(__file__).resolve().parents[1]
out = root / 'public/images'
out.mkdir(parents=True, exist_ok=True)
for name in ['wanhua-official-logo.png','wan-qiaoqiao-ip-character-sheet.png','three-sub-brands-showcase.png']:
    shutil.copyfile(root/'reference/brand'/name, out/name)
pdf = fitz.open(root/'reference/documents/wanhua-product-catalog.pdf')
# xrefs refer to embedded, unmodified source photographs / packaging artwork.
images = {'sunshine':(2,24),'maternal':(3,27),'qiaojia-gift':(4,35),'golden-gift':(5,39),'princess-gift':(6,43),'china-red':(7,49),'fashion':(8,58),'family':(9,62),'princess-jar':(10,70),'pure':(11,73),'tang-lady':(12,78),'orange-family':(13,86),'new-preview':(14,pdf[13].get_images(full=True)[0][0])}
manifest = []
for name,(page,xref) in images.items():
    image = pdf.extract_image(xref)
    filename = name+'.'+image['ext']
    (out/filename).write_bytes(image['image'])
    manifest.append({'file':filename,'source':'reference/documents/wanhua-product-catalog.pdf','page':page,'xref':xref,'usage':'企业资料原图；不代表具体口味或规格的独立实拍'})
(out/'sources.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
