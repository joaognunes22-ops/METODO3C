import json,sys
W=sys.argv[1]; M=json.load(open(f'{W}/map.json')); words=json.load(open(f'{W}/words.json'))
def f(t):
    for s,e,p in M['map']:
        if t<=e: return (p+max(0,t-s))/M['tempo']
    s,e,p=M['map'][-1]; return (p+(e-s))/M['tempo']
out=[dict(w=w['w'].strip(),s=round(f(w['s']),3),e=round(f(w['e']),3)) for w in words]
json.dump(out,open(f'{W}/words_final.json','w'),ensure_ascii=False)
line=[]
for w in out:
    line.append(w); 
    if w['w'][-1] in '.?':
        print(f"{line[0]['s']:6.2f}-{line[-1]['e']:6.2f}  "+' '.join(x['w'] for x in line)); line=[]
if line: print(f"{line[0]['s']:6.2f}-{line[-1]['e']:6.2f}  "+' '.join(x['w'] for x in line))
