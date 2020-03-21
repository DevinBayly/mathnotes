var app=function(){"use strict";function e(){}function t(e){return e()}function n(){return Object.create(null)}function o(e){e.forEach(t)}function i(e){return"function"==typeof e}function l(e,t){return e!=e?t==t:e!==t||e&&"object"==typeof e||"function"==typeof e}function s(e,t){e.appendChild(t)}function a(e){return document.createElement(e)}function r(){return e=" ",document.createTextNode(e);var e}function c(e,t,n,o){return e.addEventListener(t,n,o),()=>e.removeEventListener(t,n,o)}function d(e,t,n){null==n?e.removeAttribute(t):e.getAttribute(t)!==n&&e.setAttribute(t,n)}function u(e,t,n,o){e.style.setProperty(t,n,o?"important":"")}let h;function m(e){h=e}const p=[],f=[],g=[],y=[],v=Promise.resolve();let w=!1;function b(e){g.push(e)}let x=!1;const k=new Set;function E(){if(!x){x=!0;do{for(let e=0;e<p.length;e+=1){const t=p[e];m(t),$(t.$$)}for(p.length=0;f.length;)f.pop()();for(let e=0;e<g.length;e+=1){const t=g[e];k.has(t)||(k.add(t),t())}g.length=0}while(p.length);for(;y.length;)y.pop()();w=!1,x=!1,k.clear()}}function $(e){if(null!==e.fragment){e.update(),o(e.before_update);const t=e.dirty;e.dirty=[-1],e.fragment&&e.fragment.p(e.ctx,t),e.after_update.forEach(b)}}const S=new Set;function L(e,t){-1===e.$$.dirty[0]&&(p.push(e),w||(w=!0,v.then(E)),e.$$.dirty.fill(0)),e.$$.dirty[t/31|0]|=1<<t%31}function T(l,s,a,r,c,d,u=[-1]){const p=h;m(l);const f=s.props||{},g=l.$$={fragment:null,ctx:null,props:d,update:e,not_equal:c,bound:n(),on_mount:[],on_destroy:[],before_update:[],after_update:[],context:new Map(p?p.$$.context:[]),callbacks:n(),dirty:u};let y=!1;var v,w;g.ctx=a?a(l,f,(e,t,...n)=>{const o=n.length?n[0]:t;return g.ctx&&c(g.ctx[e],g.ctx[e]=o)&&(g.bound[e]&&g.bound[e](o),y&&L(l,e)),t}):[],g.update(),y=!0,o(g.before_update),g.fragment=!!r&&r(g.ctx),s.target&&(s.hydrate?g.fragment&&g.fragment.l(function(e){return Array.from(e.childNodes)}(s.target)):g.fragment&&g.fragment.c(),s.intro&&((v=l.$$.fragment)&&v.i&&(S.delete(v),v.i(w))),function(e,n,l){const{fragment:s,on_mount:a,on_destroy:r,after_update:c}=e.$$;s&&s.m(n,l),b(()=>{const n=a.map(t).filter(i);r?r.push(...n):o(n),e.$$.on_mount=[]}),c.forEach(b)}(l,s.target,s.anchor),E()),m(p)}var C,I,j="AIzaSyDd8AIy3wPyH531izUggBXPPQQ_yEtpI7g",O=["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];function _(){gapi.client.init({apiKey:j,clientId:"363525995013-j6v5n3ne2m5q9cl65jrll48f5oumate3.apps.googleusercontent.com",discoveryDocs:O,scope:"https://www.googleapis.com/auth/drive"}).then((function(){gapi.auth2.getAuthInstance().isSignedIn.listen(A),A(gapi.auth2.getAuthInstance().isSignedIn.get()),C.onclick=D,I.onclick=M}),(function(e){N(JSON.stringify(e,null,2))}))}function A(e){e?(C.style.display="none",I.style.display="block",gapi.client.drive.files.list({pageSize:10,fields:"nextPageToken, files(id, name)"}).then((function(e){N("Files:");var t=e.result.files;if(t&&t.length>0)for(var n=0;n<t.length;n++){var o=t[n];N(o.name+" ("+o.id+")"),"notes.json"==o.name&&(P=o.id)}else N("No files found.")}))):(C.style.display="block",I.style.display="none")}function D(e){gapi.auth2.getAuthInstance().signIn()}function M(e){gapi.auth2.getAuthInstance().signOut()}function N(e){var t=document.getElementById("content"),n=document.createTextNode(e+"\n");t.appendChild(n)}let P;let X=()=>{let e='--uploadboundary\nContent-Disposition:form-data;name="metadata";filename="first"\nContent-Type: application/json; charset=UTF-8\n\n{"name":"notes.json","mimeType":"application/json"}\n',t=`--uploadboundary\nContent-Disposition:form-data;name="file";filename="blob"\nContent-Type: application/json\n\n${JSON.stringify({starting:"text"})}\n--uploadboundary--\n    `;fetch(`https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&api=${j}&fields=id`,{method:"POST",headers:{"Content-type":"multipart/related; boundary=uploadboundary","Content-Length":(e+t).length,Authorization:"Bearer "+gapi.auth.getToken().access_token},body:e+t}).then(e=>e.json()).then(e=>console.log(e))},B=()=>fetch(`https://www.googleapis.com/drive/v3/files/${P}/?key=${j}&alt=media`,{}),R=e=>{P?(console.log("updating"),(e=>{let t='--uploadboundary\nContent-Disposition:form-data;name="metadata";filename="first"\nContent-Type: application/json; charset=UTF-8\n\n{"name":"notes.json","mimeType":"application/json"}\n',n=`--uploadboundary\nContent-Disposition:form-data;name="file";filename="blob"\nContent-Type: application/json\n\n${JSON.stringify(e)}\n--uploadboundary--`;fetch(`https://www.googleapis.com/upload/drive/v3/files/${P}/?uploadType=multipart&key=${j}&fields=id`,{method:"PATCH",headers:{"Content-type":"multipart/related; boundary=uploadboundary","Content-Length":(t+n).length,Authorization:"Bearer "+gapi.auth.getToken().access_token},body:t+n}).then(e=>e.json()).then(e=>console.log(e))})(e)):(console.log("creating anew"),X())};function Y(t){let n,i,l,h,m,p,f,g,y,v,w,b,x,k,E,$,S;return{c(){n=a("div"),i=a("p"),i.textContent="Drive API Quickstart",l=r(),h=a("button"),h.textContent="creatfile",m=r(),p=a("button"),p.textContent="makenew",f=r(),g=a("button"),g.textContent="getfile",y=r(),v=a("button"),v.textContent="Authorize",w=r(),b=a("button"),b.textContent="Sign Out",x=r(),k=a("pre"),E=r(),$=a("canvas"),d(v,"id","authorize_button"),u(v,"display","none"),d(b,"id","signout_button"),u(b,"display","none"),d(k,"id","content"),u(k,"white-space","pre-wrap"),d($,"id","canvas")},m(e,t){!function(e,t,n){e.insertBefore(t,n||null)}(e,n,t),s(n,i),s(n,l),s(n,h),s(n,m),s(n,p),s(n,f),s(n,g),s(n,y),s(n,v),s(n,w),s(n,b),s(n,x),s(n,k),s(n,E),s(n,$),S=[c(h,"click",R),c(p,"click",X),c(g,"click",B)]},p:e,i:e,o:e,d(e){var t;e&&(t=n).parentNode.removeChild(t),o(S)}}}let q=[];class z{constructor(e,t=""){let[n,o]=e;this.element=document.createElement("textarea"),this.element.style.position="absolute",this.element.style.left=n+"px",this.element.style.top=o+"px",this.element.value=t,this.element.style.width="200px",this.element.style.height="200px"}init(){document.body.append(this.element),this.element.focus(),this.element.selectionEnd+=2,this.keyactions()}mouseup(e){let t=this.func;document.body.removeEventListener("mousemove",t)}mousedown(e){console.log("down ");let t=this.element.getBoundingClientRect();if(e.pageX-(t.left+window.scrollX)<t.width/2){this.startx=e.pageX,this.starty=e.pageY,console.log("down ",this.startx,this.starty);let t=e=>{this.mousemove(e)};document.body.addEventListener("mousemove",t),this.func=t}}mousemove(e){let t=e.pageX,n=e.pageY,o=t-this.startx,i=n-this.starty;this.startx=t,this.starty=n,this.element.style.left=`${parseFloat(this.element.style.left)+o}px`,this.element.style.top=`${parseFloat(this.element.style.top)+i}px`}keyactions(){this.element.addEventListener("mousedown",this.mousedown.bind(this)),this.element.addEventListener("mouseup",this.mouseup.bind(this)),this.element.addEventListener("keydown",e=>{if("Enter"==e.key){let t=this.element.selectionStart,n=this.element.value.slice(0,t).split("\n").slice(-1)[0],o=/^\s*/.exec(n)[0];this.element.value=this.element.value.slice(0,t)+"\n"+o+this.element.value.slice(t),this.element.selectionStart=t+1+o.length,this.element.selectionEnd=this.element.selectionStart,e.preventDefault()}if("Control"==e.key&&(this.control=!0),"Alt"==e.key&&(e.preventDefault(),this.check()),"Tab"==e.key){e.preventDefault();let t=this.element.selectionStart;this.element.value=this.element.value.slice(0,t)+"  "+this.element.value.slice(t),this.element.selectionStart=t+2,this.element.selectionEnd=t+2}e.key}),this.element.addEventListener("keyup",e=>{"Control"==e.key&&(this.control=!1)})}check(){if(console.log("checking"),/-write-/.exec(this.element.value)&&(this.element.value=this.element.value.replace(/-write-/,""),fetch("http://localhost:8040",{method:"POST",body:JSON.stringify({operation:"-savefile-",contents:this.filename+"\n"+this.element.value})})),/-file-/.exec(this.element.value)&&(this.element.value=this.element.value.replace(/-file-/,""),this.filename=this.element.value,fetch("http://localhost:8040",{method:"POST",body:JSON.stringify({operation:"-file-",contents:this.element.value})}).then(e=>e.text()).then(e=>{this.element.value=e})),/-start-/.exec(this.element.value)&&(this.element.value=this.element.value.replace(/-start-/,"-running-"),this.begin=new Date,this.timeout=setTimeout(()=>{new Notification("20 mins passed")},12e5)),/-stop-/.exec(this.element.value)){this.end=new Date,this.element.value=this.element.value.replace(/-stop-/,""),this.element.value=this.element.value.replace(/-running-/,"");this.element.selectionStart;this.element.value+=`${(new Date).toUTCString()}: ${((this.end.getTime()-this.begin.getTime())/6e4).toFixed(3)}`,clearTimeout(this.timeout)}if(/-tex-/.exec(this.element.value)){let e=this.element;fetch("http://localhost:8040/",{method:"POST",body:JSON.stringify({operation:"-latex-",contents:this.element.value.replace(/-tex-/,"")})}).then(t=>{let n=new Image;n.onload=()=>{let t=e.getBoundingClientRect();document.querySelector("canvas").getContext("2d").drawImage(n,t.x+t.width,t.y+t.height)},fetch("./image.png").then(e=>e.blob()).then(e=>{n.src=URL.createObjectURL(e)})})}/-date-/.exec(this.element.value)&&(this.element.value=this.element.value.replace(/-date-/,""),fetch("http://localhost:8040",{method:"POST",body:JSON.stringify({operation:"-date-",contents:this.element.value})}).then(e=>e.text()).then(e=>{this.element.value=e}))}timer(){this.timer=setInterval(()=>{this.check()},1e4)}}class J{constructor(){B().then(e=>e.json()).then(e=>{JSON.parse(e).map(e=>{new z([Math.abs(e.x),Math.abs(e.y)],e.value).init()})})}}class U{constructor(){let e=document.querySelector("canvas"),t=new Image;t.onload=()=>{let n=e.getContext("2d");e.width=t.width,e.height=t.height,n.drawImage(t,0,0)},fetch("/retrieve/background").then(e=>e.text()).then(e=>{t.src=e})}}class H{constructor(){this.btn=document.createElement("button"),this.btn.innerHTML="load all",document.body.prepend(this.btn),this.btn.addEventListener("click",()=>{this.load()})}load(){fetch("/all").then(e=>e.json()).then(e=>{this.select=document.createElement("select");for(let t of e){let e=document.createElement("option");e.value=`${t.id}`,e.innerHTML=`${t.size},${t.ctime}`,this.select.append(e)}document.body.prepend(this.select),this.select.onchange=()=>{this.select.value;fetch("/idfetch",{method:"POST",headers:{"Content-Type":"text/plain","Content-Length":this.select.value.length},body:this.select.value}).then(e=>e.json()).then(e=>{e.map(e=>{new z([Math.abs(e.x),Math.abs(e.y)],e.value).init()})})}})}}class F{constructor(){this.btn=document.createElement("button"),document.body.prepend(this.btn),this.btn.addEventListener("click",()=>{this.load()}),this.btn.id="reload",this.btn.innerHTML="Load prev data"}load(){new U,new J}}class Q{constructor(){this.btn=document.createElement("button"),this.btn.innerHTML="Download",this.btn.id="download",this.btn.addEventListener("click",()=>{let e=this.retrieveInfo();R(JSON.stringify(e));document.querySelector("canvas").toDataURL()}),document.body.prepend(this.btn)}retrieveInfo(){return Array(...document.querySelectorAll("textarea")).map(e=>{let t=e.getBoundingClientRect();return{x:t.x+window.scrollX,y:t.y+window.scrollY,value:e.value}})}}const W=new class extends class{$destroy(){!function(e,t){const n=e.$$;null!==n.fragment&&(o(n.on_destroy),n.fragment&&n.fragment.d(t),n.on_destroy=n.fragment=null,n.ctx=[])}(this,1),this.$destroy=e}$on(e,t){const n=this.$$.callbacks[e]||(this.$$.callbacks[e]=[]);return n.push(t),()=>{const e=n.indexOf(t);-1!==e&&n.splice(e,1)}}$set(){}}{constructor(e){super(),T(this,e,null,Y,l,{})}}({target:document.body,props:{name:"world"}});return window.onload=()=>{C=document.getElementById("authorize_button"),I=document.getElementById("signout_button"),gapi.load("client:auth2",_),(()=>{Notification.requestPermission();let e=document.querySelector("#canvas");e.width=window.innerWidth,e.height=window.innerHeight;let t=e.getContext("2d");setInterval(()=>{t.fillStyle="#f9d899",t.fillRect(0,0,window.scrollMaxX+window.innerWidth,window.innerHeight+window.scrollMaxY)},3e3);new Q,new F,new H;let n=()=>{let n=t.getImageData(0,0,e.width,e.height);e.width+=500,e.height+=500,t.fillStyle="#f9d899",t.fillRect(0,0,e.width,e.height),t.putImageData(n,0,0)},o=!1,i=[0,0];document.body.addEventListener("keydown",l=>{let s={scrollx:window.scrollX,scrolly:window.scrollY},a=e=>{null==s.initialx&&(s.initialx=e.clientX,s.initialy=e.clientY),window.scrollTo(s.scrollx+2*(s.initialx-e.clientX),s.scrolly+4*(s.initialy-e.clientY))};if("Shift"==l.key&&e.addEventListener("mousemove",a),"p"==l.key&&o){let e=new Image;e.onload=()=>{t.drawImage(e,i[0],i[1])},fetch("./image.png").then(e=>e.blob()).then(t=>{e.src=URL.createObjectURL(t)})}if("N"==l.key&&o){o=!1,new z(i).init(),l.preventDefault()}let r=t=>{"Shift"==t.key&&(e.removeEventListener("mousemove",a),e.removeEventListener("keyup",r),(window.scrollX+50>window.scrollMaxX||window.scrollY+50>window.scrollMaxY)&&n())};document.body.addEventListener("keyup",r)});let l=e=>{i[0]=e.pageX,i[1]=e.pageY};e.addEventListener("mousemove",l);let s=[];e.addEventListener("mousedown",i=>{e.removeEventListener("mousemove",l),o=!0;let a=e.getBoundingClientRect(),r=i.clientX-a.left,c=i.clientY-a.topj,d=t=>{let o=e.getBoundingClientRect(),i=t.clientX-o.left,l=t.clientY-o.top;s.push(Math.round(i)),s.push(Math.round(l)),(i+50>e.width||l+50>e.height)&&n()};s.push(Math.round(r)),s.push(Math.round(c)),e.addEventListener("mousemove",d);let u=n=>{t.moveTo(s[0],s[1]),t.beginPath();for(let e=2;e<s.length;e+=2)t.lineTo(s[e],s[e+1]);t.stroke(),q=q.concat(s),q.push(0),s=[],e.removeEventListener("mousemove",d),e.removeEventListener("mouseup",u),e.addEventListener("mousemove",l)};e.addEventListener("mouseup",u)}),document.querySelector("#reload").click()})()},W}();
//# sourceMappingURL=bundle.js.map
