# Teste visual das cartas temporárias: mão com as quatro famílias, carta ampliada, falácia (caveira no placar),
# Paradoxo (debate trancado) e alvos acesos. Uso: python3 sim/teste-temporarias.py
import asyncio, json, os, mimetypes
from playwright.async_api import async_playwright
ROOT='/home/claude/batalhas-filosoficas'; THREE='/tmp/three/node_modules/three/build/three.module.js'; OUT='/home/claude/teste/'
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
    pg=await b.new_page(viewport={'width':1440,'height':900}); errs=[]
    pg.on('pageerror',lambda e: errs.append(str(e)))
    async def route(r):
      u=r.request.url
      if 'three.module.js' in u: await r.fulfill(path=THREE, content_type='text/javascript'); return
      if u.startswith('http://local/'):
        pth=ROOT+'/'+u[len('http://local/'):].split('?')[0].split('#')[0]
        if os.path.isfile(pth): await r.fulfill(path=pth, content_type=mimetypes.guess_type(pth)[0] or 'text/plain'); return
        await r.fulfill(status=404, body='nf'); return
      await r.continue_()
    await pg.route('**/*', route)
    await pg.goto('http://local/index.html')
    await pg.wait_for_timeout(2000)
    await pg.click('[data-a=ab-batalha]'); await pg.wait_for_timeout(300); await pg.click('[data-a=comecar]'); await pg.wait_for_timeout(2500)
    async def esperar():
      for i in range(80):
        await pg.wait_for_timeout(250)
        if await pg.evaluate("!!document.querySelector('#palco.on')"): return 'palco'
        if await pg.evaluate("!window.__bf.animando"): return 'livre'
      return 'tempo'
    # mesa preparada: mão com uma carta de cada família, debates com ideias
    await pg.evaluate("""()=>{ const b=window.__bf, S=b.S, P=S.players;
      P[0].hand=['espantalho#1','paradoxo#1','cicuta#1','ceticismo#1','tautologia#1']; P[0].library=12;
      P[1].group.push({id:'socrates',ideas:3,novo:false,acted:false},{id:'kant',ideas:4,novo:false,acted:false});
      P[0].group.forEach(g=>{g.novo=false;});
      S.debates[0].stakes=[3,5,0]; S.debates[1].stakes=[2,0,4]; b.redesenhar(); b.render(); }""")
    await pg.wait_for_timeout(600); await pg.screenshot(path=OUT+'temp-mao.png')
    await pg.evaluate("window.__bf.verCarta('espantalho#1')"); await pg.wait_for_timeout(500); await pg.screenshot(path=OUT+'temp-ampliada.png')
    await pg.evaluate("window.__bf.fechar()"); await pg.wait_for_timeout(300)
    # Cicuta: clicar na carta acende os gregos dos adversários
    await pg.click('.mao [data-id="cicuta#1"]'); await pg.wait_for_timeout(500); await pg.screenshot(path=OUT+'temp-cicuta-alvos.png')
    await pg.keyboard.press('Escape'); await pg.wait_for_timeout(300)
    # Espantalho (falácia) contra o 2º jogador no debate 0
    await pg.evaluate("""()=>{ const b=window.__bf,S=b.S; b.agir(function(){ BF.playPraxis(S,0,'espantalho#1',{d:0,o:1},'teste'); }); }""")
    r=await esperar(); await pg.wait_for_timeout(400); await pg.screenshot(path=OUT+'temp-falacia-palco.png')
    if r=='palco': await pg.click('#palco'); 
    await esperar(); await pg.wait_for_timeout(1500); await pg.screenshot(path=OUT+'temp-falacia-depois.png')
    # Paradoxo no debate 1
    await pg.evaluate("""()=>{ const b=window.__bf,S=b.S; b.agir(function(){ BF.playPraxis(S,0,'paradoxo#1',{d:1},'teste'); }); }""")
    r=await esperar()
    if r=='palco': await pg.wait_for_timeout(300); await pg.click('#palco')
    await esperar(); await pg.wait_for_timeout(1500); await pg.screenshot(path=OUT+'temp-trancado.png')
    st=await pg.evaluate("""()=>{const S=window.__bf.S;return {pts:S.players[0].points,cav:S.players[0].caveiras,cavTxt:(document.querySelector('[data-cav="0"]')||{}).textContent,
      ptsTxt:(document.querySelector('[data-pts="0"] b')||{}).textContent, tranca:!!document.querySelector('.deb .tranca'), ex:S.exiladas}}""")
    print(json.dumps({'estado':st,'errs':errs[:5]},ensure_ascii=False))
    await b.close()
asyncio.run(main())
