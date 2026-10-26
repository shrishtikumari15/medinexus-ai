import json

transcript_path = r'C:\Users\Shrishti kumari\.gemini\antigravity\brain\fe9a1ef4-cec6-45ab-aef0-9c191ff54e7b\.system_generated\logs\transcript_full.jsonl'

with open(transcript_path, 'r', encoding='utf-8') as f:
    for i, line in enumerate(f):
        data = json.loads(line)
        if data.get('step_index') == 695:
            print(f'Found step 695 at line {i}!')
            tool_calls = data.get('tool_calls', [])
            for tc in tool_calls:
                fn = tc.get('function', {})
                print('Tool call name:', fn.get('name'))
                args = fn.get('arguments', {})
                code = args.get('CodeContent') or args.get('ReplacementContent')
                if code:
                    print('Found code! Length:', len(code))
                    with open('original_frontpage_Landing.jsx', 'w', encoding='utf-8') as out:
                        out.write(code)
                    print('Wrote original_frontpage_Landing.jsx successfully!')
            break
