import os
import re

FILES = [
    r"d:\Sanskar\programming\projects\NITRR\Resource-Adda\frontend\src\components\wellbeing\SubmitWellbeingModal.tsx",
    r"d:\Sanskar\programming\projects\NITRR\Resource-Adda\frontend\src\app\dashboard\upload\page.tsx",
    r"d:\Sanskar\programming\projects\NITRR\Resource-Adda\frontend\src\app\dashboard\roadmaps\write\page.tsx",
    r"d:\Sanskar\programming\projects\NITRR\Resource-Adda\frontend\src\app\dashboard\placements\write\page.tsx",
    r"d:\Sanskar\programming\projects\NITRR\Resource-Adda\frontend\src\app\blogs\write\page.tsx",
    r"d:\Sanskar\programming\projects\NITRR\Resource-Adda\frontend\src\app\blogs\page.tsx",
    r"d:\Sanskar\programming\projects\NITRR\Resource-Adda\frontend\src\app\admin\contributions\page.tsx"
]

for filepath in FILES:
    if not os.path.exists(filepath):
        continue
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content

    # Add import if not exists
    if "import api from" not in content:
        imports = re.findall(r"^import .*?;", content, re.MULTILINE)
        if imports:
            last_import = imports[-1]
            content = content.replace(last_import, last_import + "\nimport api from '@/lib/api';")

    # The previous script might have already replaced `http://localhost:5000/api` with `` for fetch as well.
    # Let's fix fetch('/xxx')
    
    # Blogs: fetch('http://localhost:5000/api/blogs')
    # Let's just manually replace since the logic around response handling is different.
