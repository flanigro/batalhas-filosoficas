# cartas: citação final e ajustes de dados
C = {}
def c(i, t='A', fonte=None, dif=0, nota='', dados=None):
    C[i] = dict(t=t, fonte=fonte, dif=dif, nota=nota, dados=dados or {})
for f in ['aristoteles','platao','socrates','epicuro','marx','hobbes','bacon','rousseau','nietzsche','schopenhauer','heidegger','freud','maquiavel']:
    c('carta-'+f)
c('carta-pitagoras','A','atribuída aos pitagóricos (Aristóteles, Metafísica I, 5, 985b23–986a3)')
c('carta-diogenes','A',None,0,'',{'local':'Sínope, mar Negro'})
c('carta-erasmo','A',None,0,'',{'datas':'c. 1466 – 1536'})
c('carta-hegel','A',None,1,'A revisão trocou "real" por "efetivo", mais preciso para wirklich. Mantive "real", que é a forma conhecida em português, com o rótulo de tradução livre.')
c('carta-kant','Age apenas segundo a regra que possas querer que vire lei para todos.','Fundamentação da Metafísica dos Costumes, seção II (AA 4:421)',1,'A anterior falava em "comportamento", o que perde o teste de Kant (querer que a regra valha para todos). A revisada é exata, mas "máxima" é jargão. Proponho o meio-termo.')
c('carta-locke','A','Ensaio sobre o Entendimento Humano, II, 1, §19 (a verificar)',2,'O revisor diz que a frase não está no §19 e propõe outra, do §2. Pelo que sei, está sim: no §19, discutindo se a alma pensa sempre, Locke escreve que o conhecimento de ninguém pode ir além da sua experiência. Proponho manter a frase anterior, mais forte, e conferir no original antes de fechar.')
c('carta-arendt','A','entrevista a Joachim Fest (1964), lendo Kant',2,'A frase é real, mas na entrevista Arendt a apresenta como leitura de Kant ("em Kant, ninguém tem o direito de obedecer"). A revisada põe "Para Kant" na frente e enfraquece. Proponho manter a frase forte e pôr o contexto na fonte.')
