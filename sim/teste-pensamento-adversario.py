import asyncio, json, os, mimetypes
from playwright.async_api import async_playwright
ROOT='/home/claude/batalhas-filosoficas'; THREE='/tmp/three/node_modules/three/build/three.module.js'
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
    await pg.goto('http://local/index.html#nietzsche')
    await pg.wait_for_timeout(2000)
    await pg.click('[data-a=ab-batalha]'); await pg.wait_for_timeout(300); await pg.click('[data-a=comecar]'); await pg.wait_for_timeout(2500)
    # observa balões de pensamento do jogador 0
    await pg.evaluate("""()=>{ window.__reg=[]; const fx=document.getElementById('fx');
      new MutationObserver(ms=>ms.forEach(m=>m.addedNodes.forEach(n=>{ if(n.classList&&n.classList.contains('balao')){
        const lerN=()=>{ const b=document.querySelector('[data-anc="pilha:1:0"] b'); return b?b.textContent:null; };
        const r={pensa:n.classList.contains('pensa'),txt:n.textContent.slice(0,60),antes:lerN()}; window.__reg.push(r);
        setTimeout(()=>{ r.depois=lerN(); },1600);
        if(r.pensa&&!window.__shot){ window.__shot=1; }
      }}))).observe(fx,{childList:true}); }""")
    # coloca também Sócrates e Platão no grupo (dupla) e pula os turnos da IA em silêncio
    await pg.evaluate("""()=>{ const b=window.__bf, S=b.S; const G=(id,n)=>({id:id,ideas:n,novo:false,acted:false});
      S.players[1].group=[G('kant',1),G('schopenhauer',0),G('arendt',2),G('heidegger',0)];
      b.redesenhar();
      b.agir(function(){ S.fx.length=0; BF.endTurn(S,[]); }); }""")
    shots=0
    for i in range(160):
      await pg.wait_for_timeout(250)
      if await pg.evaluate("window.__shot===1") and shots==0:
        shots=1; await pg.wait_for_timeout(150); await pg.screenshot(path='/home/claude/teste/opp1.png')
        await pg.wait_for_timeout(1500); await pg.screenshot(path='/home/claude/teste/opp2.png')
      if await pg.evaluate("!window.__bf.animando") and shots: break
    await pg.wait_for_timeout(2000)
    reg=await pg.evaluate("window.__reg.filter(r=>r.pensa)")
    print(json.dumps({'pensa':reg[-8:],'errs':errs[:5]},ensure_ascii=False,indent=0))
    await b.close()
asyncio.run(main())
