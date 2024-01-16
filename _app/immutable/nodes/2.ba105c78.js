var Ce=Object.defineProperty;var xe=(s,n,e)=>n in s?Ce(s,n,{enumerable:!0,configurable:!0,writable:!0,value:e}):s[n]=e;var _=(s,n,e)=>(xe(s,typeof n!="symbol"?n+"":n,e),e);import{J as O,S as he,i as pe,s as ue,a as A,k as P,q as U,c as H,l as T,m as M,r as F,h as v,n as L,b as C,G as E,K as se,L as Y,H as J,M as Ne,t as me,u as fe,w as Pe,y as Te,N as Se,z as De,O as Me,A as Ae,g as He,d as We,B as Ie,I as le}from"../chunks/index.393b6558.js";import{u as Oe,s as x,i as j,a as Re,b as ze,m as je,c as Ue,d as X,P as ge,g as W,e as Fe,o as qe,f as q,l as Q,h as Ve}from"../chunks/data_store.a6111d2b.js";import{_ as Be}from"../chunks/preload-helper.41c905a7.js";function Je({fetch:s,params:n}){return{fetch:s}}const xt=Object.freeze(Object.defineProperty({__proto__:null,load:Je},Symbol.toStringTag,{value:"Module"}));function Ke(s,n){s.preventDefault();let e=document.createElement("div");e.style.position="fixed",e.style.top=s.pageY-window.scrollY+"px",e.style.left=s.pageX+"px",e.style.backgroundColor="var(--focus)",e.style.border="2px solid grey",e.style.padding=".5em",e.style.cursor="pointer";{const i=[{tag:"share link",fn:async l=>{await navigator.clipboard.writeText(location.origin+"?"+n.path().tostring().replace("#","")),l.textContent="copied."}},{tag:`expand note ${n.path().tostring()}`,fn:async l=>{window.location.search=n.path().tostring().replace("#","")}}];for(let{tag:l,fn:a}of i){let o=document.createElement("p");o.textContent=l,o.addEventListener("click",r=>a(o)),o.style.padding=".2em",e.append(o)}}let t=document.querySelector("#page");t==null||t.appendChild(e),window.addEventListener("click",()=>e.remove()),e.addEventListener("mouseleave",()=>e.remove())}let _e=new WeakMap,ae=0;function Z(s){return _e.get(s)}class K{constructor(n,e,t=!1){_(this,"name","");_(this,"parent");_(this,"element");_(this,"open");_(this,"child");_(this,"path");_(this,"linenumber",null);const i=n.split(".");let l=i[i.length-1];/^[0-9]+$/.test(l)&&(this.linenumber=+l),this.name=n,this.parent=e,this.element=document.createElement("span"),this.element.textContent=n,this.element.classList.add("link"),this.element.spellcheck=!1,this.open=t,this.element.addEventListener("click",()=>{this.set_open(!this.open),this.parent.content.save_linkstate()}),ae++,this.element.id=`L${ae}`,_e.set(this.element,this),this.path=this.parent.path().create_child(this.name)}set_path(n){console.log("renaming link to",n.tostring(),this.parent.path().tostring()),this.path=n,this.name=n.relative_path_string(this.parent.path()),this.element.textContent=this.name}set_collapsed(n){this.open||this.path.get_language()!="txt"||(n?this.element.textContent=this.path.collapsed_link_name(this.parent.path()):this.element.textContent=this.name)}remove(){var n;(n=this.child)==null||n.remove()}set_open(n){if(n!=this.open){if(this.element.classList.toggle("open"),n){this.set_collapsed(!1);let e=this.element.parentElement;if(this.child=this.parent.create_child(this.path,this),e.append(this.child.element),this.linenumber!=null){console.log(this.linenumber);let t=this.child.content.element.childNodes.item(this.linenumber-1);t.style.background="var(--focus)"}}else this.child.remove();this.open=n}}}class we{constructor(n){_(this,"element");_(this,"editable");let e=n.split("#");console.log(n);let t=decodeURI(e[1]);n=e[0],this.editable=!1,this.element=document.createElement("img"),this.element.classList.add("image"),this.element.src=n,this.element.style.width=t,document.addEventListener("click",i=>{i.target!=this.element&&i.target!=this.element.parentElement&&this.set_sizable(!1)}),this.element.addEventListener("dblclick",()=>{this.set_sizable(!0)})}set_sizable(n){var e;if(n){let t=document.createElement("div");this.element.replaceWith(t),t.style.width=this.element.style.width,this.element.style.width="100%",t.appendChild(this.element),t.style.resize="both",t.style.overflow="auto",t.style.border="2px solid white"}else if(this.editable){let t=this.element.width;this.element.style.width=`min(${t}px, 100%)`,(e=this.element.parentElement)==null||e.replaceWith(this.element)}this.editable=n}}function Ye(s){console.log("create image",s);const n=new we("");return Oe(crypto.randomUUID(),s).then(e=>n.element.src=e),n}class ye{constructor(n){_(this,"note");_(this,"element");_(this,"data");_(this,"saves_pending");this.note=n,this.element=document.createElement("div"),this.element.classList.add("content"),n.element.append(this.element),this.data=x.getitem(n.path(),e=>{this.set_data(e)}),this.set_data(this.data),oe++,this.element.id=`C${oe}`,be.set(this.element,this),this.saves_pending=!1}set_data(n){throw"not implemented"}on_input(n){}get_text(){let n=[];for(let e of this.element.children)e.nodeName=="P"&&n.push(this.get_line_text(e));return n.join(`
`)}save(){this.data.Content=this.get_text(),this.saves_pending=!1,x.setitem(this.data)}save_linkstate(){let n=[];this.get_links().forEach(e=>n.push(e.open)),x.set_linkstate(this.note.path(),n)}save_lazy(){this.saves_pending||(this.saves_pending=!0,setTimeout(()=>{this.saves_pending&&this.save()},1e3))}get_links(){let n=[];return this.element.childNodes.forEach(e=>{e.nodeName=="P"&&e.childNodes.forEach(t=>{if(ee(t)){let i=Z(t);i&&n.push(i)}})}),n}get_line_text(n){let e="";return n.childNodes.forEach(t=>{if(ee(t)){let i=t;Z(i)==null?e+="":e+=i.textContent}else if(t.classList&&t.classList.contains("image")){let i=t;console.log(i==null?void 0:i.style.width),e+=`##image:${i==null?void 0:i.src}#${encodeURI(i==null?void 0:i.style.width)}`,console.log(e)}else t.classList&&t.classList.contains("youtubeplayer")?e+=t.src:(t.nodeName=="#text"||t.nodeName=="SPAN")&&(e+=t.textContent)}),e}make_word(n){return new Text(n)}make_line(n,e=!0){if(n==""){let a=document.createElement("p");return a.innerHTML="<br>",a}n=n.replaceAll(" "," "),n=n.replace(/(\S)\u00A0(\S)/g,"$1 $2");let t=n.split(/([\s+[\]{}(),])/),i=document.createElement("p"),l=[];for(let a in t){let o=t[a];if(j(o)&&(!o.startsWith(".")||/\s+| | /.test(t[+a-1])||t[+a-1]==null))try{const r=new K(o,this.note);l.push(r.element)}catch(r){console.log("failed link",o,r),l.push(this.make_word(o))}else if(Re(o))ze(o)?l.push(je(o)):l.push(Ue(o));else if(o.startsWith("##image:")){const r=new we(n.slice(8));l.push(r.element);break}else l.push(this.make_word(o))}return l.forEach(a=>{i.appendChild(a)}),i}}let be=new WeakMap,oe=0;function ee(s){return s instanceof HTMLElement&&s.classList.contains("link")}function $e(s){return be.get(s)}function z(s,n){var i,l;let e=s.firstChild;for(;n>((i=e==null?void 0:e.textContent)==null?void 0:i.length);)n-=(l=e==null?void 0:e.textContent)==null?void 0:l.length,e=e==null?void 0:e.nextSibling;let t=null;return e!=null&&(e.nodeName=="SPAN"?(t=e,e=e.firstChild):t=e),Ge(e,n),t}function Ge(s,n){var e=document.createRange(),t=window.getSelection();try{e.setStart(s,n),e.collapse(!0)}catch{}t!=null&&(t.removeAllRanges(),t.addRange(e))}class Xe extends ye{constructor(e){var p;super(e);_(this,"table");_(this,"rows");_(this,"columns");this.element.innerHTML="",this.element.contentEditable="false",this.element.style.padding="0";let t=document.createElement("div"),i=document.createElement("div");(p=this.note.head)==null||p.element.remove(),t.classList.add("tablecontainer"),i.classList.add("supercontainer"),this.table=document.createElement("table"),this.table.classList.add("tablecontent");let l=this.data.Content.split(`
`).map(c=>this.make_line(c,!0));console.log("creating table",this.data.Content),this.table.append(...l),this.rows=this.table.childNodes.length,this.columns=this.table.childNodes[0].childNodes.length,this.element.innerHTML="",this.element.replaceWith(i),this.element=i;const a=document.createElement("tr");for(var o=0;o<this.columns;o++)o==0?a.append(document.createElement("span")):a.append(this.removecolumn(this.table,o));this.table.prepend(a),i.append(t),t.append(this.table);const r=document.createElement("button");r.addEventListener("click",c=>{this.table.childNodes.forEach((f,w)=>{let d;w==0?d=this.removecolumn(this.table,this.columns):(d=document.createElement("td"),d.append(super.make_line("")),console.log(d)),f.appendChild(d)}),this.columns++}),r.classList.add("newcolumn"),r.innerHTML="+",t.appendChild(r);const h=document.createElement("button");h.addEventListener("click",c=>{this.table.insertRow(-1).replaceWith(this.make_line(",".repeat(this.columns-2)))}),h.innerHTML="+",h.classList.add("newrow"),i.append(h),this.element.addEventListener("click",c=>{var w;let f=c.target;if(f.nodeName!="BUTTON"&&(f.nodeName=="TD"||((w=f.parentNode)==null?void 0:w.nodeName)=="TD")){let d=c.target.nodeName=="TD"?c.target:c.target.parentNode;d.contentEditable="true";let m=d.querySelector("p");if([m,m.parentElement].includes(document.activeElement))return;m.focus(),z(m,this.get_line_text(m).length)}}),this.element.addEventListener("input",c=>{var f;(c.target.nodeName=="TD"||((f=c.target.parentNode)==null?void 0:f.nodeName)=="TD")&&this.on_input(c)})}set_data(e){}removecolumn(e,t){let i=document.createElement("td"),l=document.createElement("span");return l.innerHTML="-",l.addEventListener("click",a=>{console.log("remove col",t),e.childNodes.forEach((o,r)=>o.childNodes[t].remove())}),this.save_lazy(),l.style.width="100%",i.style.padding="0",i.append(l),i.classList.add("removecolumn"),i.style.border="unset",i}make_line(e,t){const i=document.createElement("tr");i.append(this.removerow(i));for(let l of e.split(",")){let a=document.createElement("td");a.append(super.make_line(l)),i.append(a)}return i}removerow(e){let t=document.createElement("button");return t.innerHTML="-",t.addEventListener("click",()=>e.remove()),t.classList.add("removerow"),t}get_text(){const e=this.element.querySelector("table");let t="";for(let i=1;i<e.childNodes.length;i++){const l=e==null?void 0:e.childNodes[i];for(let a=1;a<l.childNodes.length;a++){const o=l.childNodes[a];console.log(o);let r=this.get_line_text(o.querySelector("p"));t+=r+","}t=t.slice(0,-1)+`
`}return t=t.slice(0,-1),console.log(t),t}async on_input(e){this.save_lazy()}}class te extends ye{constructor(e){super(e);_(this,"on_paste",e=>{for(var t=e.target;t.nodeName!="DIV";)if(t=t.parentElement,t==null)return;if(t!=this.element)return;const i=e.clipboardData;for(var l=0;l<i.items.length;l++)if(i.items[l].type.indexOf("image")!==-1){var a=i.items[l].getAsFile();if(a){const r=Ye(a);this.insert_text(r.element)}}let o=e.clipboardData.getData("text");if(o=Fe(o),o.startsWith(window.location.origin)&&o.includes("?")){console.log("pasting link"),e.preventDefault();let r=o.split("?")[1];j(r)||(r="#"+r);const h=new K(r,this.note,!1);this.insert_text(h.element)}else console.log("pasting normal text",o),e.preventDefault(),this.insert_text(document.createTextNode(o)),o.includes(`
`)&&this.get_text();this.save_lazy()});this.element.addEventListener("keydown",l=>{l.key=="Tab"&&l.target==this.element&&(l.preventDefault(),this.insert_text(document.createTextNode("  ")))});function t(l){for(;!(l.classList&&l.classList.contains("content"));)l=l.parentNode;return l}this.element.addEventListener("input",l=>{var r;let a=t((r=window.getSelection())==null?void 0:r.focusNode),o=$e(a);o==null||o.on_input(l)}),this.element.addEventListener("paste",this.on_paste),this.element.contentEditable=String(this.data.Path.author==O(X)),this.element.contentEditable=="false"&&this.element.addEventListener("click",()=>{let l=new ge(this.data.Path.pub,O(X),this.data.Path.location),a=window.prompt(`to edit ${this.data.Path.author}'s note you need to make a copy`,l.tostring());a!=null&&(console.log(a),this.note.rename(W(a)))});let i=x.get_linkstate(e.path());this.get_links().forEach((l,a)=>{i[a]&&!this.note.call_hist.includes(l.path)&&l.set_open(!0)})}set_data(e){this.element.innerHTML="",this.data=e,this.setText(this.data.Content)}setText(e){let t=e.split(`
`);for(let i of t)this.element.append(this.make_line(i))}on_input(e){var h,p,c,f,w,d,m,y,g,b;if(e.type=="input"&&["¨"].includes(e.data))return;const t=window.getSelection(),i=t==null?void 0:t.focusNode;var l=t==null?void 0:t.focusOffset,a;if(i.nodeName=="P")a=i;else if(i.nodeName=="DIV")a=i.firstChild;else if(((h=i.parentElement)==null?void 0:h.nodeName)=="P")a=i.parentElement;else if(((c=(p=i.parentElement)==null?void 0:p.parentElement)==null?void 0:c.nodeName)=="P")a=(f=i.parentElement)==null?void 0:f.parentElement;else{this.element.childNodes.forEach(u=>{if(u.nodeName!="P"){const k=document.createElement("p");u.nodeName=="DIV"?(u.replaceWith(k),k.appendChild(u.firstChild)):(u.replaceWith(k),k.appendChild(u)),z(k,0)}});return}if(e.inputType=="insertParagraph"){const u=a.previousElementSibling;((w=u.lastChild)==null?void 0:w.textContent)==""&&((d=u.lastChild)==null||d.remove()),this.reload_line(u),(y=a.firstChild)==null||y.replaceWith((m=a.firstChild)==null?void 0:m.textContent);const k=this.reload_line(a);z(k,0);const N=u.textContent;if(N){const $=(N==null?void 0:N.length)-N.trimStart().length+(["{","[","("].includes(N.slice(-1))?2:0);$&&(this.insert_text(document.createTextNode(" ".repeat($))),z(k,$))}return}let o=this.get_line_text(a);if(o!=""){let u=i;if(i.nodeName=="P"?(u=i.childNodes[l],l=0):((g=i.parentElement)==null?void 0:g.nodeName)=="SPAN"&&(u=i.parentElement),u==null){console.warn("prev is undefined");return}for(u=u.previousSibling;u!=null;)l+=(b=u.textContent)==null?void 0:b.length,u=u.previousSibling}else l=0;const r=this.reload_line(a,o);z(r,l),this.save_lazy()}reload_line(e,t){t==null&&(t=this.get_line_text(e));const i=this.make_line(t);return e.replaceWith(i),e.childNodes.forEach(l=>{if(ee(l)){const a=Z(l);a==null||a.remove()}}),i}insert_text(e){const t=window.getSelection();t.deleteFromDocument(),t.getRangeAt(0).insertNode(e),e.parentElement instanceof HTMLBRElement&&(e.parentElement.replaceWith(e),console.log("replaced br")),t.collapseToEnd();const i=document.createRange();i.selectNodeContents(e),i.collapse(!1);const l=window.getSelection();l.removeAllRanges(),l.addRange(i)}}let S=null;window.addEventListener("keydown",s=>{s.ctrlKey&&s.key=="Enter"&&S!=null&&S.runnable&&(S.runbutton.textContent="O",console.log("start running"),S.execute(),S.runbutton.textContent="▶")});class ve extends te{constructor(e){super(e);_(this,"outfield");_(this,"runnable",!1);_(this,"runbutton",null);this.element.classList.add("js"),this.element.spellcheck=!1,this.data.Path.location[this.data.Path.location.length-1]==this.data.Path.get_language()&&(this.runnable=!0,this.runbutton=document.createElement("div"),this.runbutton.classList.add("runbutton"),this.runbutton.textContent="▶",this.runbutton.contentEditable="false",this.runbutton.addEventListener("click",async t=>{S=this,this.runbutton.textContent="O",await this.execute(),this.runbutton.textContent="▶"}),S==null&&(S=this),this.element.parentElement.append(this.runbutton)),this.outfield=document.createElement("div"),this.outfield.classList.add("content"),this.outfield.contentEditable="false",this.element.parentElement.append(this.outfield)}make_word(e){let t=new Text(e);return Ze.forEach(i=>{i.pattern(e)&&(t=document.createElement("span"),t.textContent=e,t.style.color=i.color)}),t}on_input(e){this.runnable&&(S=this),super.on_input(e)}async get_flat_text(e,t){e=e.replaceAll(/print\s*\(/g,"print(");const i=e.split(`
`);let l=[];return[(await Promise.all(i.map(async(o,r)=>{if(/print\s*\(/.test(o)&&(o=o.replaceAll(/print\s*\(/g,`print('${t.data.Path.tostring()}:${r+1}',`)),o.trimStart().startsWith("//"))return;let h=o.split(/([\s+[\]{}(),])/);return(await Promise.all(h.map(async(p,c)=>{if(j(p)&&(!p.startsWith(".")||/\s+| | /.test(h[c-1])||h[c-1]==null)){const f=new K(p,t.note,!0),w=f.path.tostring().replaceAll(".","$").replaceAll(":","$$$$").replace("#","");return l.push([w,f]),w}return p}))).join("")}))).filter(o=>!(o!=null&&o.startsWith("//"))).join(`
`),l]}async get_content_text(e,t,i){const l=(await x.getitemblocking(t)).Content;let[a,o]=await this.get_flat_text(l,e);for(let[r,h]of o)if(!i.vars.has(r)){i.vars.add(r);const p=new I(h.path,h),c=await this.get_content_text(p.content,h.path,i);i.values.push([r,c])}return a}async execute(){this.save(),this.outfield.innerHTML="",window.print=(...i)=>{this.print(...i)},window.putout=i=>this.outfield.append(i);let e={vars:new Set,values:new Array},t=await this.get_content_text(this,this.data.Path,e);for(let[i,l]of e.values)t=`${i} = ${l};
`+t;console.log(t);try{let l=await Function(`return async()=>{${t}}`)()();console.log(l),this.print(l)}catch(i){console.error(i)}}print(...e){let t=e[0];e=e.slice(1);let i=document.createElement("p");if(t!=null){let l=new K(t,this.note);l.element.style.float="right",i.append(l.element)}for(let l of e)i.append(ke(l)),i.append(document.createTextNode(" "));this.outfield.append(i)}}let Qe=["abstract","arguments","await","boolean","break","byte","case","catch","char","class","const","continue","debugger","default","delete","do","double","else","enum","eval","export","extends","false","final","finally","float","for","function","goto","if","implements","import","in","instanceof","int","interface","let","long","native","new","null","package","private","protected","public","return","short","static","super","switch","synchronized","this","throw","throws","transient","true","try","typeof","var","void","volatile","while","with","yield"];function ke(s){console.log("parse",s);let n=i=>["string","number","boolean","symbol","undefined","function"].includes(typeof i)||i==null,e=document.createElement("span"),t=s.constructor.name;if(n(s)){["number","boolean"].includes(typeof s)&&(e.style.color="orange");let i=String(s);e.textContent=i}else{let i=function(){l=!0,a=document.createElement("p"),a.style.paddingLeft="2em",e.append(a);for(let h of Object.keys(s))a.append(h,": "),a.append(ke(s[h])),a.append(document.createElement("br"))};t+=` [${Object.keys(s).length}]`,e.style.color="var(--blue)",e.style.cursor="pointer";let l=!1,a;e.addEventListener("click",h=>{if(h.target==e){if(l){a==null||a.remove(),l=!1;return}i()}});let o=[];for(let h of Object.keys(s)){if(o.length>3){o.push("...");break}let p="";s instanceof Array||(p+=h+": "),p+=s[h],o.push(p)}let r=document.createElement("span");r.textContent=o.join(", "),r.style.color="var(--color)",e.textContent=t+" ",e.append(r)}return e}const Ze=[{pattern:s=>/[\[\]{}()]/.test(s),color:"yellow"},{pattern:s=>Qe.includes(s),color:"lightblue"},{pattern:s=>!isNaN(parseFloat(s)),color:"orange"},{pattern:s=>/^"(.*)"/.test(s),color:"orange"}];let D,R=null,ne=(...s)=>{R==null||R.print(...s)};async function et(){console.log("python setup..."),ne("python setup ..."),await Be(()=>import("https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js"),[],import.meta.url),D=await loadPyodide(),R.outfield.innerHTML="",window.pyo=D}let tt=["False","await","else","import","pass","None","break","except","in","raise","True","class","finally","is","return","and","continue","for","lambda","try","as","def","from","nonlocal","while","assert","del","global","not","with","async","elif","if","or","yield"];const nt=[{pattern:s=>/[\[\]{}()]/.test(s),color:"yellow"},{pattern:s=>tt.includes(s),color:"lightblue"},{pattern:s=>!isNaN(parseFloat(s)),color:"orange"},{pattern:s=>/^"(.*)"/.test(s),color:"orange"}];function it(s){let n=new Text(s);return nt.forEach(e=>{e.pattern(s)&&(n=document.createElement("span"),n.textContent=s,n.style.color=e.color)}),n}class st extends ve{async execute(){this.outfield.innerHTML="";let n=this.get_text();R=this,n=n.replaceAll(" "," ");try{let e=await this.run_python_code(n);e!=null&&ne(e)}catch(e){console.log(e),this.handle_error(e)}}async run_python_code(n){console.log("run python"),D==null&&await et(),await D.loadPackage("micropip");let e=!1;return n=n.split(`
`).map((l,a)=>{if(/^\%pip\s*install/.test(l)){let o=l.split(/^\%pip\s*install/)[1].trim();return e=!0,`await micropip.install("${o}")`}return l}).join(`
`),e&&(n=`import micropip
`+n),console.log(n),(D==null?void 0:D.globals).set("print",(...l)=>this.print(...l.map(a=>a.toJs()))),D.runPythonAsync(n)}handle_error(n){let e=n.stack.split(`
`);console.log(e),e.filter(t=>t.startsWith('  File "<exec>", line')||!t.startsWith(" ")&&!t.startsWith("PythonError:")).map(t=>ne(t))}on_input(n){this.data.Path.location.indexOf("py")==this.data.Path.location.length-1&&(R=this),super.on_input(n)}make_word(n){return it(n)}print(...n){console.log("printing from",this);let e=document.createElement("p");for(let t of n)e.append(V(t));this.outfield.append(e)}}function V(s){let n=t=>["string","number","boolean","symbol","undefined","function"].includes(typeof t)||t==null,e=document.createElement("span");if(n(s)){["number","boolean"].includes(typeof s)&&(e.style.color="orange");let t=String(s);e.textContent=t}else{let t=function(){console.log("open",s),l=!0,a=document.createElement("p"),a.style.paddingLeft="2em",e.append(a);let r=20;if(i=="list")for(let h of s){if(r--<0)break;a.append(V(h)),a.append(document.createElement("br"))}else try{for(let h of s.__dict__){if(r--<0)break;a.append(h,": "),a.append(V(s[h])),a.append(document.createElement("br"))}}catch{try{for(let h of s){if(r--<0)break;a.append(V(h)),a.append(document.createElement("br"))}}catch{}}},i=s.type;e.textContent=i+" ",e.style.color="var(--blue)",e.style.cursor="pointer";let l=!1,a;e.addEventListener("click",r=>{if(r.target==e){if(l){a==null||a.remove(),l=!1;return}t()}});let o=String(s);e.append(o)}return e}var lt=s=>new Promise((n,e)=>{console.log("rename_note",s);const t=document.createElement("div");t.classList.add("bg"),t.addEventListener("click",p=>{p.target==t&&(t.remove(),e())}),document.querySelector("#page").appendChild(t);const i=document.createElement("div");i.classList.add("container"),t.appendChild(i);const l=document.createElement("h2");l.innerHTML="rename note";const a=document.createElement("input");a.value=s.tostring();const o=document.createElement("p"),r=()=>{const p=W(a.value);p!=s?(n(p),t.remove()):o.innerHTML="invalid name"};a.addEventListener("keyup",p=>{p.key=="Enter"&&r()});const h=document.createElement("button");h.innerHTML="rename",h.onclick=()=>r(),i.appendChild(l),i.appendChild(a),i.appendChild(o),i.appendChild(document.createElement("br")),i.appendChild(h)});class I{constructor(n,e){_(this,"creator");_(this,"element");_(this,"head");_(this,"content");_(this,"language");_(this,"call_hist",[]);_(this,"init_path");this.init_path=n,console.log("creating note",n),this.creator=e,this.element=document.createElement("div"),this.element.classList.add("note"),this.head=new at(this,n),this.element.append(this.head.element),this.language=n.get_language(),this.language=="txt"?this.content=new te(this):this.language=="js"?this.content=new ve(this):this.language=="py"?this.content=new st(this):this.language=="csv"?(console.log("creating csv"),this.content=new Xe(this)):this.content=new te(this),e&&(this.call_hist=e.parent.call_hist.concat(e.parent.path()))}path(){try{return this.content.data.Path}catch{return this.init_path}}remove(){this.content.save(),this.content.save_linkstate(),this.element.remove()}create_child(n,e){return new I(n,e)}rename(n){let e=x.getitem(n,i=>{this.content.data.id=i.id,this.content.save()});this.content.data.Path=n,this.content.data.id=e.id,this.content.get_links().forEach(i=>{i.set_path(i.path)}),this.content.save();let t=new I(this.path());this.element.replaceWith(t.element),this.creator?(this.creator.set_path(n),this.creator.child=t,this.creator.parent.content.save()):window.location.search=n.tostring().replace("#","")}}class at{constructor(n,e){_(this,"note");_(this,"element");this.note=n,this.element=document.createElement("div"),this.element.classList.add("head"),this.element.contentEditable="false";let t=document.createElement("h2"),i;this.note.creator?i=e.title_string(this.note.creator.parent.path()):i=e.title_string(),t.textContent=i,this.element.append(t),this.note.element.append(this.element),this.element.addEventListener("click",l=>{lt(this.note.content.data.Path).catch(()=>{}).then(a=>{a&&this.note.rename(a)})}),this.element.addEventListener("contextmenu",l=>{Ke(l,this.note)})}}var B=new Map,G=[],ie=!1;function ot(){for(let s=0;s<localStorage.length;s++){const n=localStorage.key(s);try{const e=JSON.parse(n);e.location&&rt(e)}catch{}}}function rt(s){const n=(s.pub?"":"_")+s.location.join(".")+":"+s.author,e=B.size;B.set(n,s),e!=B.size&&(ie=!0)}function ct(){return ie&&(G=Array.from(B),G.sort((s,n)=>s[0].localeCompare(n[0])),ie=!1),G}function dt(){const s=prompt("enter openai key");s&&qe.set(s)}const ht={tags:["openai","ai","gpt"],rep:"⚙️ add openai key",executor:dt};function Ee(s,n){return typeof s=="string"?s.startsWith(n):typeof s=="function"?s(n):s.reduce((e,t)=>e||Ee(t,n),!1)}let pt=[{tags:["lightmode","darkmode"],rep:"⚙️ switch lightmode",executor:()=>{Q.set(!O(Q))}},{tags:["account","login","signup","sign in","log out","sign out","user account"],rep:"⚙️ account settings",executor:()=>{window.location.pathname="login"}},ht],Le;function ut(){let s=ct().map(n=>{const e=decodeURI(n[0]).replaceAll("_"," ").trimStart(),t=(n[1].pub?"📃 ":"🔒 ")+e.replace(":"," by ");return{tags:e,rep:t,executor:()=>{const l=new ge(n[1].pub,n[1].author,n[1].location).tostring();window.location.search=l.replace("#",""),q.update(a=>(a[t]=Date.now(),a)),console.log(O(q))}}}).sort((n,e)=>(O(q)[e.rep]??0)-(O(q)[n.rep]??0));Le=pt.concat(...s)}function mt(s,n=10){return Le.filter(t=>Ee(t.tags,s)).slice(0,n)}function re(s,n,e){const t=s.slice();return t[11]=n[e],t[13]=e,t}function ft(s){let n,e,t,i;return{c(){n=P("button"),e=U("⚙︎"),this.h()},l(l){n=T(l,"BUTTON",{id:!0});var a=M(n);e=F(a,"⚙︎"),a.forEach(v),this.h()},h(){L(n,"id","search_btn")},m(l,a){C(l,n,a),E(n,e),t||(i=Y(n,"click",s[7]),t=!0)},p:J,d(l){l&&v(n),t=!1,i()}}}function gt(s){let n,e,t,i;return{c(){n=P("span"),e=U(">> Cmd + P"),this.h()},l(l){n=T(l,"SPAN",{id:!0});var a=M(n);e=F(a,">> Cmd + P"),a.forEach(v),this.h()},h(){L(n,"id","search_btn")},m(l,a){C(l,n,a),E(n,e),t||(i=Y(n,"click",s[6]),t=!0)},p:J,d(l){l&&v(n),t=!1,i()}}}function ce(s){let n,e=(typeof s[11].rep=="string"?s[11].rep:s[11].rep(s[2]))+"",t,i,l,a,o,r;function h(){return s[10](s[11])}return{c(){n=P("p"),t=U(e),l=A(),a=P("br"),this.h()},l(p){n=T(p,"P",{class:!0});var c=M(n);t=F(c,e),c.forEach(v),l=H(p),a=T(p,"BR",{}),this.h()},h(){L(n,"class",i=s[13]==s[4]?"highlighted":"")},m(p,c){C(p,n,c),E(n,t),C(p,l,c),C(p,a,c),o||(r=Y(n,"click",h),o=!0)},p(p,c){s=p,c&12&&e!==(e=(typeof s[11].rep=="string"?s[11].rep:s[11].rep(s[2]))+"")&&fe(t,e),c&16&&i!==(i=s[13]==s[4]?"highlighted":"")&&L(n,"class",i)},d(p){p&&v(n),p&&v(l),p&&v(a),o=!1,r()}}}function _t(s){let n,e,t,i,l,a,o,r,h,p,c;function f(g,b){return g[5]?gt:ft}let w=f(s),d=w(s),m=s[3],y=[];for(let g=0;g<m.length;g+=1)y[g]=ce(re(s,m,g));return{c(){d.c(),n=A(),e=P("div"),t=P("p"),i=U(de),l=A(),a=P("input"),o=A(),r=P("div");for(let g=0;g<y.length;g+=1)y[g].c();this.h()},l(g){d.l(g),n=H(g),e=T(g,"DIV",{class:!0});var b=M(e);t=T(b,"P",{id:!0});var u=M(t);i=F(u,de),u.forEach(v),l=H(b),a=T(b,"INPUT",{placeholder:!0,type:!0}),o=H(b),r=T(b,"DIV",{class:!0});var k=M(r);for(let N=0;N<y.length;N+=1)y[N].l(k);k.forEach(v),b.forEach(v),this.h()},h(){L(t,"id","searchsuggestion"),L(a,"placeholder","search..."),L(a,"type","text"),L(r,"class","results"),L(e,"class","searchbar"),e.hidden=h=!s[0]},m(g,b){d.m(g,b),C(g,n,b),C(g,e,b),E(e,t),E(t,i),E(e,l),E(e,a),s[8](a),se(a,s[2]),E(e,o),E(e,r);for(let u=0;u<y.length;u+=1)y[u].m(r,null);p||(c=Y(a,"input",s[9]),p=!0)},p(g,[b]){if(w===(w=f(g))&&d?d.p(g,b):(d.d(1),d=w(g),d&&(d.c(),d.m(n.parentNode,n))),b&4&&a.value!==g[2]&&se(a,g[2]),b&28){m=g[3];let u;for(u=0;u<m.length;u+=1){const k=re(g,m,u);y[u]?y[u].p(k,b):(y[u]=ce(k),y[u].c(),y[u].m(r,null))}for(;u<y.length;u+=1)y[u].d(1);y.length=m.length}b&1&&h!==(h=!g[0])&&(e.hidden=h)},i:J,o:J,d(g){d.d(g),g&&v(n),g&&v(e),s[8](null),Ne(y,g),p=!1,c()}}}let de="";function wt(s,n,e){let t=!1,i="",l=[],a=0;window.addEventListener("keydown",d=>{d.key=="p"?d.metaKey&&(d.preventDefault(),e(0,t=!0)):d.key=="Escape"&&e(0,t=!1)}),window.addEventListener("keyup",d=>{if(t&&!(d.key=="Meta"||d.key=="Escape"))if(d.key=="ArrowUp")e(4,a=Math.max(a-1,0));else if(d.key=="ArrowDown")e(4,a=Math.min(a+1,l.length-1));else if(d.key=="Tab"){d.preventDefault();let m=l[a].tags;typeof m=="string"&&(m=m.split(":")[0],m=m.split(".").slice(0,i.split(".").length).join("."),e(2,i=m),o.focus())}else if(d.key=="Enter")l[a].executor(i);else{if(i==""){e(3,l=[]);return}e(4,a=0),e(3,l=mt(i)),l.length==0&&e(3,l=[{tags:m=>!0,rep:m=>`⚙️ create Page: ${m}`,executor:m=>{const y=new I(W("#"+m));x.setitem(y.content.data),window.location.search=m}},{tags:m=>!0,rep:m=>`⚙️ create secret Page: ${m}`,executor:m=>{const y=new I(W("_"+m));x.setitem(y.content.data),window.location.search="_"+m}}]),l[0]}}),window.addEventListener("click",d=>{d.target.id!="search_btn"&&(e(0,t=!1),e(5,r=!1))});let o,r=!1;const h=()=>{e(5,r=!1),e(0,t=!0)},p=d=>{e(5,r=!0)};function c(d){Pe[d?"unshift":"push"](()=>{o=d,e(1,o)})}function f(){i=this.value,e(2,i)}const w=d=>{d.executor(i)};return s.$$.update=()=>{s.$$.dirty&3&&t&&(ut(),me().then(()=>{o.focus()}))},[t,o,i,l,a,r,h,p,c,f,w]}class yt extends he{constructor(n){super(),pe(this,n,wt,_t,ue,{})}}function bt(s){let n,e,t,i,l,a=s[1]?"":"offline",o,r,h,p;return n=new yt({}),{c(){Te(n.$$.fragment),e=A(),t=P("h2"),i=new Se(!1),l=A(),o=U(a),r=A(),h=P("div"),this.h()},l(c){De(n.$$.fragment,c),e=H(c),t=T(c,"H2",{id:!0});var f=M(t);i=Me(f,!1),l=H(f),o=F(f,a),f.forEach(v),r=H(c),h=T(c,"DIV",{id:!0});var w=M(h);w.forEach(v),this.h()},h(){i.a=l,L(t,"id","fullheader"),L(h,"id","page")},m(c,f){Ae(n,c,f),C(c,e,f),C(c,t,f),i.m(s[0],t),E(t,l),E(t,o),C(c,r,f),C(c,h,f),p=!0},p(c,[f]){(!p||f&1)&&i.p(c[0]),(!p||f&2)&&a!==(a=c[1]?"":"offline")&&fe(o,a)},i(c){p||(He(n.$$.fragment,c),p=!0)},o(c){We(n.$$.fragment,c),p=!1},d(c){Ie(n,c),c&&v(e),c&&v(t),c&&v(r),c&&v(h)}}}function vt(s,n,e){let t,i;le(s,X,w=>e(7,t=w)),le(s,Ve,w=>e(1,i=w));let{data:l}=n;document.title=window.location.hostname.split(".")[0]+(window.location.search?" | "+window.location.search.slice(1).split(":")[0]:"");var a,o="<br>";a=`<a href=/ onclick="window.location.href = '${window.origin}'; location.reload();" id=homebtn>sciepedia</a>`,o=a,me().then(f);let r;const h=`Click me and write something: xzxysl ... &^

You can create a new link with # followed by text, for example: #link #recursion #whatever

Click on a link to open a page. If the page already exists, it will be displayed to you.

Almost forgot! Create an account: {}/login, and then you can create public pages.

If you want to learn more, check out: #sciepedia:kormann
`;let p,c=W("_home:"+t);async function f(){if(ot(),window.fetch=l.fetch,Q.subscribe(y=>{y?document.body.classList.add("light"):document.body.classList.remove("light")}),r=document.createElement("div"),r.innerHTML="<p>this is a pred</p><p>this is a pred</p><p>this is a pred</p>",r.id="pred",a=`<a href=/ onclick="setTimeout(()=>{window.location.href='${window.origin}'})" id=homebtn>sciepedia</a>`,e(0,o=a),!x.has(c)){const y={Path:c,Content:`welcome to #sciepedia:kormann
if you're new try out the tutorial: _tutorial`,id:crypto.randomUUID()};localStorage[JSON.stringify(y.Path)]=JSON.stringify(y)}const w=W("_tutorial:"+t);x.has(w)||x.setitem({Path:w,Content:h.replace("{}",window.location.origin),id:crypto.randomUUID()});let d=window.location.search;d&&d.length>1&&(d=decodeURI(d.slice(1)),j(d)||(d="#"+d),console.log("searching:",d),j(d)&&(c=W(d))),p=document.querySelector("#page");let m=new I(c);p.appendChild(m.element),window.addEventListener("onunload",y=>{localStorage.unloading=!0,m.remove(),localStorage.unloaded=!0})}return s.$$set=w=>{"data"in w&&e(2,l=w.data)},[o,i,l]}class Nt extends he{constructor(n){super(),pe(this,n,vt,bt,ue,{data:2})}}export{Nt as component,xt as universal};
