import os
import re

FRONTEND_DIR = r"d:\Sanskar\programming\projects\NITRR\Resource-Adda\frontend\src"

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content

    # Replace absolute URLs with relative
    content = re.sub(r"['\"]http://localhost:5000/api(/.*?)['\"]", r"'\1'", content)
    content = re.sub(r"`http://localhost:5000/api(/.*?)`", r"`\1`", content)

    # Replace axios with api
    content = re.sub(r"axios\.get\(", r"api.get(", content)
    content = re.sub(r"axios\.post\(", r"api.post(", content)
    content = re.sub(r"axios\.put\(", r"api.put(", content)
    content = re.sub(r"axios\.delete\(", r"api.delete(", content)

    # Replace import
    if "api." in content and "import axios from 'axios'" in content:
        content = content.replace("import axios from 'axios';", "import api from '@/lib/api';")

    if content != original_content:
        # If the file uses api but doesn't import it (because maybe axios wasn't imported), add it
        if "api." in content and "import api from" not in content:
            # Insert after the last import or at the top
            imports = re.findall(r"^import .*?;", content, re.MULTILINE)
            if imports:
                last_import = imports[-1]
                content = content.replace(last_import, last_import + "\nimport api from '@/lib/api';")
            else:
                content = "import api from '@/lib/api';\n" + content

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")

for root, _, files in os.walk(FRONTEND_DIR):
    for file in files:
        if file.endswith('.ts') or file.endswith('.tsx'):
            process_file(os.path.join(root, file))
