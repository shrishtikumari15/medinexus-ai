import json

transcript_path = r'C:\Users\Shrishti kumari\.gemini\antigravity\brain\fe9a1ef4-cec6-45ab-aef0-9c191ff54e7b\.system_generated\logs\transcript_full.jsonl'

with open(transcript_path, 'r', encoding='utf-8') as f:
    for i, line in enumerate(f):
        if i == 778:
            data = json.loads(line)
            content = data.get('content', '')
            print('Line 778 content length:', len(content))
            with open('line_778.txt', 'w', encoding='utf-8') as out:
                out.write(content)
            print('Wrote line_778.txt!')
            break
