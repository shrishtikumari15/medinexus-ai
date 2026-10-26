import json

transcript_path = r'C:\Users\Shrishti kumari\.gemini\antigravity\brain\fe9a1ef4-cec6-45ab-aef0-9c191ff54e7b\.system_generated\logs\transcript_full.jsonl'

with open(transcript_path, 'r', encoding='utf-8') as f:
    for i, line in enumerate(f):
        if i in (776, 777, 779, 780):
            data = json.loads(line)
            print(f'Line {i}: type={data.get("type")}, tool_calls={data.get("tool_calls")}')
