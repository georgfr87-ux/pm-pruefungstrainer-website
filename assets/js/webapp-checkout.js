// Public price IDs only. Web products never use Android's eligibility-token flow.
document.addEventListener('DOMContentLoaded',async()=>{
  const buttons=document.querySelectorAll('#webapp-buy,[data-webapp-price]');
  if(!buttons.length)return;
  let available=false;
  try{const r=await fetch('/webapp/api/availability',{cache:'no-store'});available=r.ok&&(await r.json()).salesEnabled===true;}
  catch{}
  for(const button of buttons){
  const message=document.querySelector(button.dataset.statusTarget||'#webapp-checkout-status');
  if(!message)continue;
  const price=button.dataset.priceId;
  if(!available||!/^pri_[a-z0-9]+$/.test(price||'')){button.disabled=true;button.textContent='Verkauf wird vorbereitet';message.textContent='Der Kauf ist noch nicht freigeschaltet.';continue;}
  button.disabled=false;button.textContent=button.dataset.buyLabel||'Web-App kaufen';
  button.addEventListener('click',async()=>{
    if(typeof window.requestWebPurchaseConsent!=='function'){message.textContent='Der Kauf konnte nicht vorbereitet werden. Bitte lade die Seite neu.';return;}
    const consent=await window.requestWebPurchaseConsent(button.dataset.bundle==='true');
    if(!consent)return;
    if(!window.Paddle||typeof window.initializePaddle!=='function'||!window.initializePaddle()){message.textContent='Das Zahlungsfenster ist gerade nicht verfügbar. Bitte lade die Seite erneut.';return;}
    try{window.Paddle.Checkout.open({items:[{priceId:price,quantity:1}],customData:consent,settings:{successUrl:new URL('/webapp/login',location.origin).href}});}
    catch{message.textContent='Das Zahlungsfenster konnte nicht geöffnet werden. Bitte versuche es später erneut.';}
  });
  }
});
