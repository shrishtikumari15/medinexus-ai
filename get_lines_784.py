import json

transcript_path = r'C:\Users\Shrishti kumari\.gemini\antigravity\brain\fe9a1ef4-cec6-45ab-aef0-9c191ff54e7b\.system_generated\logs\transcript_full.jsonl'

with open(transcript_path, 'r', encoding='utf-8') as f:
    for i, line in enumerate(f):
        if i in (784, 785, 786, 787, 788, 789, 790):
            data = json.loads(line)
            content = data.get('content', '')
            print(f'Line {i}: content len={len(content)}, tool_calls={len(data.get("tool_calls", []))}')
            if 'Total Lines: 251' in content or 'Landing.jsx' in content:
                with open(f'line_{i}.txt', 'w', encoding='utf-8') as out:
                    out.write(content)
                print(f'Wrote line_{i}.txt!')
