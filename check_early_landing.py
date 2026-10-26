import json

transcript_path = r'C:\Users\Shrishti kumari\.gemini\antigravity\brain\fe9a1ef4-cec6-45ab-aef0-9c191ff54e7b\.system_generated\logs\transcript_full.jsonl'

with open(transcript_path, 'r', encoding='utf-8') as f:
    for i, line in enumerate(f):
        if i < 777 and 'Landing.jsx' in line:
            data = json.loads(line)
            for tc in data.get('tool_calls', []):
                fn = tc.get('function', {})
                print(f'Line {i}: {fn.get("name")}, args keys: {list(fn.get("arguments", {}).keys())}')
                code = fn.get("arguments", {}).get("CodeContent") or fn.get("arguments", {}).get("ReplacementContent")
                if code:
                    print(f'  Found code len={len(code)}')
                    with open(f'early_landing_{i}.jsx', 'w', encoding='utf-8') as out:
                        out.write(code)
                    print(f'  Wrote early_landing_{i}.jsx!')
            if 'Total Lines: 251' in data.get('content', ''):
                print(f'Line {i} content mentions 251 lines!')
