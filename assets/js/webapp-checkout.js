// No API key here. Set the public Paddle Price ID only after agreeing the sales price.
document.addEventListener('DOMContentLoaded',async()=>{
  const button=document.querySelector('#webapp-buy'),message=document.querySelector('#webapp-checkout-status');
  if(!button||!message)return;
  const price=button.dataset.priceId;
  if(!/^pri_[a-z0-9]+$/.test(price||''))return;
  try{const r=await fetch('/webapp/api/availability',{cache:'no-store'});if(!r.ok||!(await r.json()).salesEnabled)throw Error();}
  catch{button.disabled=true;button.textContent='Verkauf wird vorbereitet';message.textContent='Der Web-App-Zugang wird gerade eingerichtet. Der Kauf ist noch nicht freigeschaltet.';return;}
  button.disabled=false;button.textContent='Web-App kaufen';
  button.addEventListener('click',()=>{
    if(!window.Paddle||typeof window.initializePaddle!=='function'||!window.initializePaddle()){message.textContent='Das Zahlungsfenster ist gerade nicht verfügbar. Bitte lade die Seite erneut.';return;}
    try{window.Paddle.Checkout.open({items:[{priceId:price,quantity:1}],settings:{successUrl:new URL('/webapp/login',location.origin).href}});}
    catch{message.textContent='Das Zahlungsfenster konnte nicht geöffnet werden. Bitte versuche es später erneut.';}
  });
});
