import os, sys, glob
import pdfplumber

base = "mejoras de proyecto"
out_dir = "scripts/_pdf_text"
os.makedirs(out_dir, exist_ok=True)

for path in sorted(glob.glob(os.path.join(base, "*.pdf"))):
    name = os.path.splitext(os.path.basename(path))[0]
    safe = name.replace(" ", "_")
    out_path = os.path.join(out_dir, safe + ".txt")
    try:
        with pdfplumber.open(path) as pdf:
            parts = []
            for i, page in enumerate(pdf.pages, 1):
                txt = page.extract_text() or ""
                parts.append(f"\n----- PAGE {i} -----\n{txt}")
        text = "".join(parts)
    except Exception as e:
        text = f"ERROR extracting: {e}"
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(text)
    print(f"{name}: {len(text)} chars -> {out_path}")
