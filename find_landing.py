import json

transcript_path = r'C:\Users\Shrishti kumari\.gemini\antigravity\brain\fe9a1ef4-cec6-45ab-aef0-9c191ff54e7b\.system_generated\logs\transcript_full.jsonl'

with open(transcript_path, 'r', encoding='utf-8') as f:
    for i, line in enumerate(f):
        if 'Intelligent Hospital Recommendation' in line:
            data = json.loads(line)
            print(f'Match at line {i}, step {data.get("step_index")}')
            tool_calls = data.get('tool_calls', [])
            for tc in tool_calls:
                func = tc.get('function', {})
                args = func.get('arguments', {})
                code = args.get('CodeContent') or args.get('ReplacementContent')
                if code and 'Intelligent Hospital' in code:
                    print('Found Code in tool call, target:', args.get('TargetFile'))
                    with open('scratch_found_landing.jsx', 'w', encoding='utf-8') as out:
                        out.write(code)
                    print('Wrote scratch_found_landing.jsx successfully!')
