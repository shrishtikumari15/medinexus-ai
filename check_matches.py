with open('raw_output_774.txt', 'r', encoding='utf-8') as f:
    text774 = f.read()

with open('raw_output_776.txt', 'r', encoding='utf-8') as f:
    text776 = f.read()

# Let's inspect where the match occurred in transcript
import re
print("774 length:", len(text774))
print("776 length:", len(text776))

# Let's see if we can find the exact step where Landing.jsx was written or viewed
# In transcript_full.jsonl, let's find the step index that was matched by Select-String!
match = re.search(r'step_index":(\d+)', text774)
if match:
    print("Matched step index in 774:", match.group(1))

match2 = re.search(r'step_index":(\d+)', text776)
if match2:
    print("Matched step index in 776:", match2.group(1))
