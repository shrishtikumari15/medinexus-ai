import json

transcript_path = r'C:\Users\Shrishti kumari\.gemini\antigravity\brain\fe9a1ef4-cec6-45ab-aef0-9c191ff54e7b\.system_generated\logs\transcript_full.jsonl'

target_lines = [302, 399, 401, 688, 692, 778]

with open(transcript_path, 'r', encoding='utf-8') as f:
    for i, line in enumerate(f):
        if i in target_lines:
            data = json.loads(line)
            print(f'=== LINE {i} (step {data.get("step_index")}) ===')
            # Check content or tool calls
            content = data.get('content', '')
            if 'Landing.jsx' in content or 'Intelligent Hospital' in content:
                print('Content snippet:', content[:300])
            for tc in data.get('tool_calls', []):
                fn = tc.get('function', {})
                name = fn.get('name')
                args = fn.get('arguments', {})
                target = args.get('TargetFile', '')
                print(f'Tool Call: {name}, Target: {target}')
                code = args.get('CodeContent') or args.get('ReplacementContent')
                if code:
                    print('Code length:', len(code))
                    if 'Landing' in target:
                        filename = f'landing_version_{i}.jsx'
                        with open(filename, 'w', encoding='utf-8') as out:
                            out.write(code)
                        print(f'Wrote to {filename}!')
