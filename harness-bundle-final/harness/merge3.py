#!/usr/bin/env python3
"""3-way merge for the single-file game with long lines.
usage: merge3.py BASE OURS THEIRS OUT
Line-level merge first (git merge-file --diff3); every conflicting hunk is retried at
CHARACTER level: if OURS and THEIRS edit disjoint character ranges of the base text, both
edits are applied. Hunks that truly overlap are left as conflict markers:
<<<<<<< OURS / ||||||| BASE / ======= / >>>>>>> THEIRS
Prints a report: auto-merged hunks, remaining conflicts (with line numbers in OUT)."""
import sys, subprocess, difflib, re
base_p, ours_p, theirs_p, out_p = sys.argv[1:5]
r = subprocess.run(['git','merge-file','-p','--diff3','-L','OURS','-L','BASE','-L','THEIRS',ours_p,base_p,theirs_p],capture_output=True,text=True)
txt = r.stdout
def opcodes(a,b):
    sm = difflib.SequenceMatcher(None,a,b,autojunk=False)
    return [(i1,i2,b[j1:j2]) for t,i1,i2,j1,j2 in sm.get_opcodes() if t!='equal']
def charmerge(base,ours,theirs):
    if ours==theirs: return ours
    if base==ours: return theirs
    if base==theirs: return ours
    eo, et = opcodes(base,ours), opcodes(base,theirs)
    # reject overlaps (touching inserts at same point also count as overlap)
    for a1,a2,_ in eo:
        for b1,b2,_ in et:
            if a1<b2 and b1<a2: return None
            if a1==a2==b1==b2: return None
            if (a1==a2 and b1<=a1<=b2) or (b1==b2 and a1<=b1<=a2): return None
    edits = sorted(eo+et, key=lambda e:(e[0],e[1]))
    out=[];pos=0
    for i1,i2,rep in edits:
        out.append(base[pos:i1]); out.append(rep); pos=i2
    out.append(base[pos:])
    return ''.join(out)
pat = re.compile(r'<<<<<<< OURS\n(.*?)\|\|\|\|\|\|\| BASE\n(.*?)=======\n(.*?)>>>>>>> THEIRS\n', re.S)
auto=0; left=0
def rep(m):
    global auto,left
    o,b,t = m.group(1),m.group(2),m.group(3)
    res = charmerge(b,o,t)
    if res is None:
        left+=1; return m.group(0)
    auto+=1; return res
merged = pat.sub(rep, txt)
open(out_p,'w').write(merged)
print(f'git merge-file conflicts: {r.returncode if r.returncode>0 else 0}; auto-resolved at char level: {auto}; remaining: {left}')
for i,l in enumerate(merged.split('\n'),1):
    if l.startswith('<<<<<<< OURS'): print('  conflict at line',i)
