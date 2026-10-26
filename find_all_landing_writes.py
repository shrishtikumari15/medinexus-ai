import json

transcript_path = r'C:\Users\Shrishti kumari\.gemini\antigravity\brain\fe9a1ef4-cec6-45ab-aef0-9c191ff54e7b\.system_generated\logs\transcript_full.jsonl'

with open(transcript_path, 'r', encoding='utf-8') as f:
    for i, line in enumerate(f):
        data = json.loads(line)
        tool_calls = data.get('tool_calls', [])
        for tc in tool_calls:
            fn = tc.get('function', {})
            name = fn.get('name')
            args = fn.get('arguments', {})
            target = args.get('TargetFile', '')
            if 'Landing.jsx' in target:
                print(f'Line {i}, Step {data.get("step_index")}, Tool {name}')
                code = args.get('CodeContent') or args.get('ReplacementContent')
                if code:
                    print('Found Landing code! Length:', len(code))
                    with open(f'saved_landing_{i}.jsx', 'w', encoding='utf-8') as out:
                        out.write(code)
                    print(f'Wrote to saved_landing_{i}.jsx!')
