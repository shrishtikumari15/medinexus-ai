import json

transcript_path = r'C:\Users\Shrishti kumari\.gemini\antigravity\brain\fe9a1ef4-cec6-45ab-aef0-9c191ff54e7b\.system_generated\logs\transcript_full.jsonl'

with open(transcript_path, 'r', encoding='utf-8') as f:
    for i, line in enumerate(f):
        if 770 <= i <= 800:
            data = json.loads(line)
            tc = data.get('tool_calls', [])
            content = data.get('content', '')
            for call in tc:
                fn = call.get('function', {})
                print(f'Line {i}: call={fn.get("name")}, args={fn.get("arguments")}')
            if 'Total Lines: 251' in content:
                print(f'Line {i} content mentions 251 lines! Length: {len(content)}')
                with open(f'full_view_{i}.txt', 'w', encoding='utf-8') as out:
                    out.write(content)
