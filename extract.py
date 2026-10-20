import re, sys
src = open(sys.argv[1], encoding='utf-8').read()
script = re.search(r'<script>(.*)</script>', src, re.S).group(1)
open(sys.argv[2], 'w', encoding='utf-8').write(script)
start = script.index('const PRICE_FLOOR')
end = script.index('// ================= DATOS POR DEFECTO')
open(sys.argv[3], 'w', encoding='utf-8').write(script[start:end])
