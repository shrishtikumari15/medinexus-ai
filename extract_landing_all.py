import json

transcript_path = r'C:\Users\Shrishti kumari\.gemini\antigravity\brain\fe9a1ef4-cec6-45ab-aef0-9c191ff54e7b\.system_generated\logs\transcript_full.jsonl'

with open(transcript_path, 'r', encoding='utf-8') as f:
    for i, line in enumerate(f):
        if i == 778:
            data = json.loads(line)
            content = data.get('content', '')
            # The view_file output format has:
            # 8: 1: import React...
            # Let's extract the code lines!
            lines = content.split('\n')
            extracted_code = []
            for l in lines:
                # Format: "line_num: original_line_num: actual_code" or "original_line_num: actual_code"
                parts = l.split(': ', 1)
                if len(parts) == 2 and parts[0].isdigit():
                    extracted_code.append(parts[1])
            print('Extracted lines:', len(extracted_code))
            if extracted_code:
                with open('extracted_landing_part1.txt', 'w', encoding='utf-8') as out:
                    out.write('\n'.join(extracted_code))
            break
