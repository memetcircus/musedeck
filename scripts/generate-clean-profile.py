import json
import zipfile
import os
import shutil

# Load existing Page 1 manifest
with open('/tmp/profile_unpacked/Profiles/B04B2196-8A5C-4906-94E1-931B265308B7/manifest.json') as f:
    page1 = json.load(f)

# Update actions in Page 1
actions = page1['Controllers'][0]['Actions']

updates = {
    '0,0': ('Agent Status', 'com.memetcircus.musedeck.status'),
    '1,0': ('Voice Input (⌥+V)', 'com.memetcircus.musedeck.task'),
    '2,0': ('Prompt Snippets', 'com.memetcircus.musedeck.diff'),
    '3,0': ('Approve (HITL)', 'com.memetcircus.musedeck.approve'),
    '4,0': ('Muse Sessions', 'com.memetcircus.musedeck.reject'),
    '0,1': ('Screenshot (SAM 3.1)', 'com.memetcircus.musedeck.sam-snip'),
    '1,1': ('Image to Code', 'com.memetcircus.musedeck.spark-code'),
    '2,1': ('Video to Code', 'com.memetcircus.musedeck.run-muse'),
    '3,1': ('Muse Settings', 'com.memetcircus.musedeck.halt'),
    '4,1': ('AI Credits HUD', 'com.memetcircus.musedeck.reset'),
    '0,2': ('Prompt Task', 'com.memetcircus.musedeck.prompt-task'),
    '1,2': ('Muse Memory', 'com.memetcircus.musedeck.write-tests'),
    '2,2': ('Muse Ops', 'com.memetcircus.musedeck.fix-bug'),
    '3,2': ('Git Commands', 'com.memetcircus.musedeck.commit-pr'),
    '4,2': ('Halt / Stop', 'com.memetcircus.musedeck.page-next'),
}

for coord, (name, uuid) in updates.items():
    if coord in actions:
        actions[coord]['Name'] = name
        actions[coord]['UUID'] = uuid
        actions[coord]['LinkedTitle'] = False
        actions[coord]['Settings'] = {}

# Clean top-level profile manifest: ONLY 1 PAGE!
top_manifest = {
    'Device': {
        'Model': '20GBA9901',
        'UUID': '@(1)[4057/128/A00SA6152MXJXF]'
    },
    'InstalledByPluginUUID': 'com.memetcircus.musedeck',
    'Name': 'MuseDeck',
    'Pages': {
        'Current': 'b04b2196-8a5c-4906-94e1-931b265308b7',
        'Default': 'b04b2196-8a5c-4906-94e1-931b265308b7',
        'Pages': ['b04b2196-8a5c-4906-94e1-931b265308b7']
    },
    'PreconfiguredName': 'MuseDeck',
    'Version': '3.0'
}

# Create output dir
out_dir = '/tmp/new_clean_profile'
if os.path.exists(out_dir):
    shutil.rmtree(out_dir)
os.makedirs(f'{out_dir}/Profiles/B04B2196-8A5C-4906-94E1-931B265308B7', exist_ok=True)

with open(f'{out_dir}/manifest.json', 'w') as f:
    json.dump(top_manifest, f, indent=2)

with open(f'{out_dir}/Profiles/B04B2196-8A5C-4906-94E1-931B265308B7/manifest.json', 'w') as f:
    json.dump(page1, f, indent=2)

# Pack into zip (.streamDeckProfile)
profile_path = 'com.memetcircus.musedeck.sdPlugin/profiles/MuseDeck.streamDeckProfile'
profile_path_root = 'com.memetcircus.musedeck.sdPlugin/MuseDeck.streamDeckProfile'

for dest in [profile_path, profile_path_root]:
    with zipfile.ZipFile(dest, 'w', zipfile.ZIP_DEFLATED) as zipf:
        zipf.write(f'{out_dir}/manifest.json', 'manifest.json')
        zipf.write(
            f'{out_dir}/Profiles/B04B2196-8A5C-4906-94E1-931B265308B7/manifest.json',
            'Profiles/B04B2196-8A5C-4906-94E1-931B265308B7/manifest.json'
        )
    print('Generated:', dest)

