import json

transcript_path = r'C:\Users\Shrishti kumari\.gemini\antigravity\brain\fe9a1ef4-cec6-45ab-aef0-9c191ff54e7b\.system_generated\logs\transcript_full.jsonl'

with open(transcript_path, 'r', encoding='utf-8') as f:
    for i, line in enumerate(f):
        if i in (774, 776):
            d = json.loads(line)
            with open(f'raw_output_{i}.txt', 'w', encoding='utf-8') as out:
                out.write(d.get('content', ''))
            print(f'Wrote raw_output_{i}.txt (length {len(d.get("content", ""))})')
