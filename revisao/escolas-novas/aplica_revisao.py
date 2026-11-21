# Aplica as decisões da revisão externa v2 nos arquivos de falas (uma entrada por id).
# Uso, a partir da raiz:  python3 revisao/escolas-novas/aplica_revisao.py dec_teistas_1.py
import re, sys, importlib.util, os
AQUI = os.path.dirname(os.path.abspath(__file__))
ARQ = dict([(f, 'falas_teistas.js') for f in ['descartes', 'tomas', 'agostinho', 'leibniz', 'averrois', 'espinoza']] +
           [(f, 'falas_franceses.js') for f in ['sartre', 'foucault', 'voltaire', 'derrida', 'camus', 'lacan']] +
           [(f, 'falas_orientais.js') for f in ['jesus', 'buda', 'confucio', 'avicena', 'zoroastro', 'laotse']])
def js(x): return "'" + x.replace("\\", "\\\\").replace("'", "\\'") + "'"
def aplica(dec):
    por = {}
    for fid, (tipo, texto, fonte) in dec.items():
        fil, d = fid.rsplit('-', 1); por.setdefault(ARQ[fil], []).append((fil, d, tipo, texto, fonte))
    for arq, itens in por.items():
        s = open(arq, encoding='utf-8').read()
        for fil, d, tipo, texto, fonte in itens:
            i = s.index('F.%s = {' % fil); j = s.index('\n  };', i)
            blk = s[i:j]
            m = re.search(r"\n    %s: \[.*?\](,?)(?=\n|$)" % d, blk)
            assert m, (fil, d)
            blk = blk[:m.start()] + "\n    %s: [%s, %s, %s]%s" % (d, js(tipo), js(texto), js(fonte), m.group(1)) + blk[m.end():]
            s = s[:i] + blk + s[j:]
        open(arq, 'w', encoding='utf-8').write(s)
if __name__ == '__main__':
    spec = importlib.util.spec_from_file_location('dec', os.path.join(AQUI, sys.argv[1])); m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
    aplica(m.D); print(len(m.D), 'falas aplicadas de', sys.argv[1])
