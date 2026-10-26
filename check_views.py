import json

transcript_path = r'C:\Users\Shrishti kumari\.gemini\antigravity\brain\fe9a1ef4-cec6-45ab-aef0-9c191ff54e7b\.system_generated\logs\transcript_full.jsonl'

with open(transcript_path, 'r', encoding='utf-8') as f:
    for i, line in enumerate(f):
        if 'Landing.jsx' in line:
            data = json.loads(line)
            # Check tool_calls
            for tc in data.get('tool_calls', []):
                args = tc.get('function', {}).get('arguments', {})
                if 'Landing.jsx' in str(args):
                    print(f'Line {i}, Step {data.get("step_index")}: tool={tc.get("function", {}).get("name")}, args={args}')
            # Check content
            content = data.get('content', '')
            if 'Total Lines: 251' in content:
                print(f'Line {i} has view output of 251 lines!')
                with open(f'view_landing_{i}.txt', 'w', encoding='utf-8') as out:
                    out.write(content)
