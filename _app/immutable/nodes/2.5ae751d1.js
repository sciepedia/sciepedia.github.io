import{S as A,i as G,s as K,k as v,a as x,q as O,l as T,m as S,h as s,c as C,r as P,n as E,b as f,G as M,J as q,H as D,K as R,I as J,t as V,L as F}from"../chunks/index.950ad7d9.js";import{s as Q,g as I,i as j,t as z,a as U,N as W,m as X,b as Z,l as B,u as $,r as H}from"../chunks/note.30ff1f97.js";function ee({fetch:l,params:i}){return{fetch:l}}const ne=Object.freeze(Object.defineProperty({__proto__:null,load:ee},Symbol.toStringTag,{value:"Module"}));function te(l){let i,r,o,h,d,a,c,p,u,m,_;return{c(){i=v("h2"),r=x(),o=v("button"),h=O("❋"),d=x(),a=v("button"),c=O(l[1]),p=x(),u=v("div"),this.h()},l(e){i=T(e,"H2",{id:!0});var n=S(i);n.forEach(s),r=C(e),o=T(e,"BUTTON",{id:!0});var g=S(o);h=P(g,"❋"),g.forEach(s),d=C(e),a=T(e,"BUTTON",{id:!0});var b=S(a);c=P(b,l[1]),b.forEach(s),p=C(e),u=T(e,"DIV",{id:!0});var t=S(u);t.forEach(s),this.h()},h(){E(i,"id","fullheader"),E(o,"id","light_btn"),E(a,"id","loggedin_btn"),E(u,"id","page")},m(e,n){f(e,i,n),i.innerHTML=l[0],f(e,r,n),f(e,o,n),M(o,h),f(e,d,n),f(e,a,n),M(a,c),f(e,p,n),f(e,u,n),m||(_=[q(o,"click",l[2]),q(a,"click",l[4])],m=!0)},p(e,[n]){n&1&&(i.innerHTML=e[0])},i:D,o:D,d(e){e&&s(i),e&&s(r),e&&s(o),e&&s(d),e&&s(a),e&&s(p),e&&s(u),m=!1,R(_)}}}function oe(l,i,r){let o,h;J(l,B,t=>r(10,o=t)),J(l,$,t=>r(11,h=t));let{data:d}=i;document.title=window.location.hostname;var a,c="<br>";a=`<a href=/ onclick="window.location.href = '${window.origin}'; location.reload();" id=homebtn>sciepedia</a>`,c=a,V().then(n);let p;const u=`Click me and write something: xzxysl ... &^

You can create a new link with # followed by text, for example: #link #recursion #whatever

Click on a link to open a page. If the page already exists, it will be displayed to you.

Almost forgot! Create an account: {}/login, and then you can create public pages.

If you want to learn more, check out: #sciepedia:kormann
`;let m,_,e=h[0];async function n(){Q(),window.fetch=d.fetch,o&&document.body.classList.add("light"),p=document.createElement("div"),p.innerHTML="<p>this is a pred</p><p>this is a pred</p><p>this is a pred</p>",p.id="pred",a=`<a href=/ onclick="window.location.href = '${window.origin}'; location.reload();" id=homebtn>sciepedia</a>`,r(0,c=a);let t=window.location.search;_=[I(H.path)],t&&t.length>1&&(t=decodeURI(t.slice(1)),j(t)||(t="#"+t),console.log("searching:",t),j(t)&&(_.push(_[0]),H.path=t)),m=document.querySelector("#page"),window.addEventListener("scroll",w=>{r(0,c=a);let Y={element:{offsetTop:0},fullpath:"<span id=homebtn>sciepedia</span>"};z.forEach(L=>{window.scrollY+L.element.offsetHeight>L.element.offsetTop&&Y.element.offsetTop<L.element.offsetTop})});const N=I("_tutorial:"+h);U.has(N)||U.setitem({Path:N,Content:u.replace("{}",window.location.origin),id:crypto.randomUUID()});let y=I(H.path);if(!U.has(y)){const w={Path:y,Content:`welcome to sciepedia
try out the tutorial: _tutorial`,id:crypto.randomUUID()};localStorage[JSON.stringify(w.Path)]=JSON.stringify(w)}let k=new W("_home",y);z.push({element:k.head.title_element,fullpath:y}),m.appendChild(k.element),document.body.addEventListener("click",w=>{w.target==document.body&&X(null)}),window.addEventListener("onunload",w=>{localStorage.unloading=!0,k.body.free(),localStorage.unloaded=!0}),Z().then(()=>{k.body.spellcheck()})}function g(){F(B,o=!o,o)}const b=()=>{window.location.pathname="login"};return l.$$set=t=>{"data"in t&&r(3,d=t.data)},[c,e,g,d,b]}class le extends A{constructor(i){super(),G(this,i,oe,te,K,{data:3})}}export{le as component,ne as universal};
