//
//  arbor.js - version 0.91
//  a graph vizualization toolkit
//
//  Copyright (c) 2012 Samizdat Drafting Co.
//  Physics code derived from springy.js, copyright (c) 2010 Dennis Hotson
// 
//  Permission is hereby granted, free of charge, to any person
//  obtaining a copy of this software and associated documentation
//  files (the "Software"), to deal in the Software without
//  restriction, including without limitation the rights to use,
//  copy, modify, merge, publish, distribute, sublicense, and/or sell
//  copies of the Software, and to permit persons to whom the
//  Software is furnished to do so, subject to the following
//  conditions:
// 
//  The above copyright notice and this permission notice shall be
//  included in all copies or substantial portions of the Software.
// 
//  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
//  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
//  OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
//  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
//  HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
//  WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
//  FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
//  OTHER DEALINGS IN THE SOFTWARE.
//

(function($){

  /*        etc.js */  var trace=function(msg){if(typeof(window)=="undefined"||!window.console){return}var len=arguments.length;var args=[];for(var i=0;i<len;i++){args.push("arguments["+i+"]")}eval("console.log("+args.join(",")+")")};var dirname=function(a){var b=a.replace(/^\/?(.*?)\/?$/,"$1").split("/");b.pop();return"/"+b.join("/")};var basename=function(b){var c=b.replace(/^\/?(.*?)\/?$/,"$1").split("/");var a=c.pop();if(a==""){return null}else{return a}};var _ordinalize_re=/(\d)(?=(\d\d\d)+(?!\d))/g;var ordinalize=function(a){var b=""+a;if(a<11000){b=(""+a).replace(_ordinalize_re,"$1,")}else{if(a<1000000){b=Math.floor(a/1000)+"k"}else{if(a<1000000000){b=(""+Math.floor(a/1000)).replace(_ordinalize_re,"$1,")+"m"}}}return b};var nano=function(a,b){return a.replace(/\{([\w\-\.]*)}/g,function(f,c){var d=c.split("."),e=b[d.shift()];$.each(d,function(){if(e.hasOwnProperty(this)){e=e[this]}else{e=f}});return e})};var objcopy=function(a){if(a===undefined){return undefined}if(a===null){return null}if(a.parentNode){return a}switch(typeof a){case"string":return a.substring(0);break;case"number":return a+0;break;case"boolean":return a===true;break}var b=($.isArray(a))?[]:{};$.each(a,function(d,c){b[d]=objcopy(c)});return b};var objmerge=function(d,b){d=d||{};b=b||{};var c=objcopy(d);for(var a in b){c[a]=b[a]}return c};var objcmp=function(e,c,d){if(!e||!c){return e===c}if(typeof e!=typeof c){return false}if(typeof e!="object"){return e===c}else{if($.isArray(e)){if(!($.isArray(c))){return false}if(e.length!=c.length){return false}}else{var h=[];for(var f in e){if(e.hasOwnProperty(f)){h.push(f)}}var g=[];for(var f in c){if(c.hasOwnProperty(f)){g.push(f)}}if(!d){h.sort();g.sort()}if(h.join(",")!==g.join(",")){return false}}var i=true;$.each(e,function(a){var b=objcmp(e[a],c[a]);i=i&&b;if(!i){return false}});return i}};var objkeys=function(b){var a=[];$.each(b,function(d,c){if(b.hasOwnProperty(d)){a.push(d)}});return a};var objcontains=function(c){if(!c||typeof c!="object"){return false}for(var b=1,a=arguments.length;b<a;b++){if(c.hasOwnProperty(arguments[b])){return true}}return false};var uniq=function(b){var a=b.length;var d={};for(var c=0;c<a;c++){d[b[c]]=true}return objkeys(d)};var arbor_path=function(){var a=$("script").map(function(b){var c=$(this).attr("src");if(!c){return}if(c.match(/arbor[^\/\.]*.js|dev.js/)){return c.match(/.*\//)||"/"}});if(a.length>0){return a[0]}else{return null}};
  /*     kernel.js */  var Kernel=function(b){var k=window.location.protocol=="file:"&&navigator.userAgent.toLowerCase().indexOf("chrome")>-1;var a=(window.Worker!==undefined&&!k);var i=null;var c=null;var f=[];f.last=new Date();var l=null;var e=null;var d=null;var h=null;var g=false;var j={system:b,tween:null,nodes:{},init:function(){if(typeof(Tween)!="undefined"){c=Tween()}else{if(typeof(arbor.Tween)!="undefined"){c=arbor.Tween()}else{c={busy:function(){return false},tick:function(){return true},to:function(){trace("Please include arbor-tween.js to enable tweens");c.to=function(){};return}}}}j.tween=c;var m=b.parameters();if(a){trace("arbor.js/web-workers",m);l=setInterval(j.screenUpdate,m.timeout);i=new Worker(arbor_path()+"arbor.js");i.onmessage=j.workerMsg;i.onerror=function(n){trace("physics:",n)};i.postMessage({type:"physics",physics:objmerge(m,{timeout:Math.ceil(m.timeout)})})}else{trace("arbor.js/single-threaded",m);i=Physics(m.dt,m.stiffness,m.repulsion,m.friction,j.system._updateGeometry,m.integrator);j.start()}return j},graphChanged:function(m){if(a){i.postMessage({type:"changes",changes:m})}else{i._update(m)}j.start()},particleModified:function(n,m){if(a){i.postMessage({type:"modify",id:n,mods:m})}else{i.modifyNode(n,m)}j.start()},physicsModified:function(m){if(!isNaN(m.timeout)){if(a){clearInterval(l);l=setInterval(j.screenUpdate,m.timeout)}else{clearInterval(d);d=null}}if(a){i.postMessage({type:"sys",param:m})}else{i.modifyPhysics(m)}j.start()},workerMsg:function(n){var m=n.data.type;if(m=="geometry"){j.workerUpdate(n.data)}else{trace("physics:",n.data)}},_lastPositions:null,workerUpdate:function(m){j._lastPositions=m;j._lastBounds=m.bounds},_lastFrametime:new Date().valueOf(),_lastBounds:null,_currentRenderer:null,screenUpdate:function(){var n=new Date().valueOf();var m=false;if(j._lastPositions!==null){j.system._updateGeometry(j._lastPositions);j._lastPositions=null;m=true}if(c&&c.busy()){m=true}if(j.system._updateBounds(j._lastBounds)){m=true}if(m){var o=j.system.renderer;if(o!==undefined){if(o!==e){o.init(j.system);e=o}if(c){c.tick()}o.redraw();var p=f.last;f.last=new Date();f.push(f.last-p);if(f.length>50){f.shift()}}}},physicsUpdate:function(){if(c){c.tick()}i.tick();var n=j.system._updateBounds();if(c&&c.busy()){n=true}var o=j.system.renderer;var m=new Date();var o=j.system.renderer;if(o!==undefined){if(o!==e){o.init(j.system);e=o}o.redraw({timestamp:m})}var q=f.last;f.last=m;f.push(f.last-q);if(f.length>50){f.shift()}var p=i.systemEnergy();if((p.mean+p.max)/2<0.05){if(h===null){h=new Date().valueOf()}if(new Date().valueOf()-h>1000){clearInterval(d);d=null}else{}}else{h=null}},fps:function(n){if(n!==undefined){var q=1000/Math.max(1,targetFps);j.physicsModified({timeout:q})}var r=0;for(var p=0,o=f.length;p<o;p++){r+=f[p]}var m=r/Math.max(1,f.length);if(!isNaN(m)){return Math.round(1000/m)}else{return 0}},start:function(m){if(d!==null){return}if(g&&!m){return}g=false;if(a){i.postMessage({type:"start"})}else{h=null;d=setInterval(j.physicsUpdate,j.system.parameters().timeout)}},stop:function(){g=true;if(a){i.postMessage({type:"stop"})}else{if(d!==null){clearInterval(d);d=null}}}};return j.init()};
  /*      atoms.js */  var Node=function(a){this._id=_nextNodeId++;this.data=a||{};this._mass=(a.mass!==undefined)?a.mass:1;this._fixed=(a.fixed===true)?true:false;this._p=new Point((typeof(a.x)=="number")?a.x:null,(typeof(a.y)=="number")?a.y:null);delete this.data.x;delete this.data.y;delete this.data.mass;delete this.data.fixed};var _nextNodeId=1;var Edge=function(b,c,a){this._id=_nextEdgeId--;this.source=b;this.target=c;this.length=(a.length!==undefined)?a.length:1;this.data=(a!==undefined)?a:{};delete this.data.length};var _nextEdgeId=-1;var Particle=function(a,b){this.p=a;this.m=b;this.v=new Point(0,0);this.f=new Point(0,0)};Particle.prototype.applyForce=function(a){this.f=this.f.add(a.divide(this.m))};var Spring=function(c,b,d,a){this.point1=c;this.point2=b;this.length=d;this.k=a};Spring.prototype.distanceToParticle=function(a){var c=that.point2.p.subtract(that.point1.p).normalize().normal();var b=a.p.subtract(that.point1.p);return Math.abs(b.x*c.x+b.y*c.y)};var Point=function(a,b){if(a&&a.hasOwnProperty("y")){b=a.y;a=a.x}this.x=a;this.y=b};Point.random=function(a){a=(a!==undefined)?a:5;return new Point(2*a*(Math.random()-0.5),2*a*(Math.random()-0.5))};Point.prototype={exploded:function(){return(isNaN(this.x)||isNaN(this.y))},add:function(a){return new Point(this.x+a.x,this.y+a.y)},subtract:function(a){return new Point(this.x-a.x,this.y-a.y)},multiply:function(a){return new Point(this.x*a,this.y*a)},divide:function(a){return new Point(this.x/a,this.y/a)},magnitude:function(){return Math.sqrt(this.x*this.x+this.y*this.y)},normal:function(){return new Point(-this.y,this.x)},normalize:function(){return this.divide(this.magnitude())}};
  /*     system.js */  var ParticleSystem=function(e,r,f,g,u,m,s,a){var k=[];var i=null;var l=0;var v=null;var n=0.04;var j=[20,20,20,20];var o=null;var p=null;if(typeof e=="object"){var t=e;f=t.friction;e=t.repulsion;u=t.fps;m=t.dt;r=t.stiffness;g=t.gravity;s=t.precision;a=t.integrator}if(a!="verlet"&&a!="euler"){a="verlet"}f=isNaN(f)?0.5:f;e=isNaN(e)?1000:e;u=isNaN(u)?55:u;r=isNaN(r)?600:r;m=isNaN(m)?0.02:m;s=isNaN(s)?0.6:s;g=(g===true);var q=(u!==undefined)?1000/u:1000/50;var c={integrator:a,repulsion:e,stiffness:r,friction:f,dt:m,gravity:g,precision:s,timeout:q};var b;var d={renderer:null,tween:null,nodes:{},edges:{},adjacency:{},names:{},kernel:null};var h={parameters:function(w){if(w!==undefined){if(!isNaN(w.precision)){w.precision=Math.max(0,Math.min(1,w.precision))}$.each(c,function(y,x){if(w[y]!==undefined){c[y]=w[y]}});d.kernel.physicsModified(w)}return c},fps:function(w){if(w===undefined){return d.kernel.fps()}else{h.parameters({timeout:1000/(w||50)})}},start:function(){d.kernel.start()},stop:function(){d.kernel.stop()},addNode:function(z,C){C=C||{};var D=d.names[z];if(D){D.data=C;return D}else{if(z!=undefined){var w=(C.x!=undefined)?C.x:null;var E=(C.y!=undefined)?C.y:null;var B=(C.fixed)?1:0;var A=new Node(C);A.name=z;d.names[z]=A;d.nodes[A._id]=A;k.push({t:"addNode",id:A._id,m:A.mass,x:w,y:E,f:B});h._notify();return A}}},pruneNode:function(x){var w=h.getNode(x);if(typeof(d.nodes[w._id])!=="undefined"){delete d.nodes[w._id];delete d.names[w.name]}$.each(d.edges,function(z,y){if(y.source._id===w._id||y.target._id===w._id){h.pruneEdge(y)}});k.push({t:"dropNode",id:w._id});h._notify()},getNode:function(w){if(w._id!==undefined){return w}else{if(typeof w=="string"||typeof w=="number"){return d.names[w]}}},eachNode:function(w){$.each(d.nodes,function(z,y){if(y._p.x==null||y._p.y==null){return}var x=(v!==null)?h.toScreen(y._p):y._p;w.call(h,y,x)})},addEdge:function(A,B,z){A=h.getNode(A)||h.addNode(A);B=h.getNode(B)||h.addNode(B);z=z||{};var y=new Edge(A,B,z);var C=A._id;var D=B._id;d.adjacency[C]=d.adjacency[C]||{};d.adjacency[C][D]=d.adjacency[C][D]||[];var x=(d.adjacency[C][D].length>0);if(x){$.extend(d.adjacency[C][D].data,y.data);return}else{d.edges[y._id]=y;d.adjacency[C][D].push(y);var w=(y.length!==undefined)?y.length:1;k.push({t:"addSpring",id:y._id,fm:C,to:D,l:w});h._notify()}return y},pruneEdge:function(B){k.push({t:"dropSpring",id:B._id});delete d.edges[B._id];for(var w in d.adjacency){for(var C in d.adjacency[w]){var z=d.adjacency[w][C];for(var A=z.length-1;A>=0;A--){if(d.adjacency[w][C][A]._id===B._id){d.adjacency[w][C].splice(A,1)}}}}h._notify()},getEdges:function(x,w){x=h.getNode(x);w=h.getNode(w);if(!x||!w){return[]}if(typeof(d.adjacency[x._id])!=="undefined"&&typeof(d.adjacency[x._id][w._id])!=="undefined"){return d.adjacency[x._id][w._id]}return[]},getEdgesFrom:function(w){w=h.getNode(w);if(!w){return[]}if(typeof(d.adjacency[w._id])!=="undefined"){var x=[];$.each(d.adjacency[w._id],function(z,y){x=x.concat(y)});return x}return[]},getEdgesTo:function(w){w=h.getNode(w);if(!w){return[]}var x=[];$.each(d.edges,function(z,y){if(y.target==w){x.push(y)}});return x},eachEdge:function(w){$.each(d.edges,function(A,y){var z=d.nodes[y.source._id]._p;var x=d.nodes[y.target._id]._p;if(z.x==null||x.x==null){return}z=(v!==null)?h.toScreen(z):z;x=(v!==null)?h.toScreen(x):x;if(z&&x){w.call(h,y,z,x)}})},prune:function(x){var w={dropped:{nodes:[],edges:[]}};if(x===undefined){$.each(d.nodes,function(z,y){w.dropped.nodes.push(y);h.pruneNode(y)})}else{h.eachNode(function(z){var y=x.call(h,z,{from:h.getEdgesFrom(z),to:h.getEdgesTo(z)});if(y){w.dropped.nodes.push(z);h.pruneNode(z)}})}return w},graft:function(x){var w={added:{nodes:[],edges:[]}};if(x.nodes){$.each(x.nodes,function(z,y){var A=h.getNode(z);if(A){A.data=y}else{w.added.nodes.push(h.addNode(z,y))}d.kernel.start()})}if(x.edges){$.each(x.edges,function(A,y){var z=h.getNode(A);if(!z){w.added.nodes.push(h.addNode(A,{}))}$.each(y,function(E,B){var D=h.getNode(E);if(!D){w.added.nodes.push(h.addNode(E,{}))}var C=h.getEdges(A,E);if(C.length>0){C[0].data=B}else{w.added.edges.push(h.addEdge(A,E,B))}})})}return w},merge:function(x){var w={added:{nodes:[],edges:[]},dropped:{nodes:[],edges:[]}};$.each(d.edges,function(B,A){if((x.edges[A.source.name]===undefined||x.edges[A.source.name][A.target.name]===undefined)){h.pruneEdge(A);w.dropped.edges.push(A)}});var z=h.prune(function(B,A){if(x.nodes[B.name]===undefined){w.dropped.nodes.push(B);return true}});var y=h.graft(x);w.added.nodes=w.added.nodes.concat(y.added.nodes);w.added.edges=w.added.edges.concat(y.added.edges);w.dropped.nodes=w.dropped.nodes.concat(z.dropped.nodes);w.dropped.edges=w.dropped.edges.concat(z.dropped.edges);return w},tweenNode:function(z,w,y){var x=h.getNode(z);if(x){d.tween.to(x,w,y)}},tweenEdge:function(x,w,A,z){if(z===undefined){h._tweenEdge(x,w,A)}else{var y=h.getEdges(x,w);$.each(y,function(B,C){h._tweenEdge(C,A,z)})}},_tweenEdge:function(x,w,y){if(x&&x._id!==undefined){d.tween.to(x,w,y)}},_updateGeometry:function(z){if(z!=undefined){var w=(z.epoch<l);b=z.energy;var A=z.geometry;if(A!==undefined){for(var y=0,x=A.length/3;y<x;y++){var B=A[3*y];if(w&&d.nodes[B]==undefined){continue}d.nodes[B]._p.x=A[3*y+1];d.nodes[B]._p.y=A[3*y+2]}}}},screen:function(w){if(w==undefined){return{size:(v)?objcopy(v):undefined,padding:j.concat(),step:n}}if(w.size!==undefined){h.screenSize(w.size.width,w.size.height)}if(!isNaN(w.step)){h.screenStep(w.step)}if(w.padding!==undefined){h.screenPadding(w.padding)}},screenSize:function(w,x){v={width:w,height:x};h._updateBounds()},screenPadding:function(z,A,w,x){if($.isArray(z)){trbl=z}else{trbl=[z,A,w,x]}var B=trbl[0];var y=trbl[1];var C=trbl[2];if(y===undefined){trbl=[B,B,B,B]}else{if(C==undefined){trbl=[B,y,B,y]}}j=trbl},screenStep:function(w){n=w},toScreen:function(y){if(!o||!v){return}var x=j||[0,0,0,0];var w=o.bottomright.subtract(o.topleft);var A=x[3]+y.subtract(o.topleft).divide(w.x).x*(v.width-(x[1]+x[3]));var z=x[0]+y.subtract(o.topleft).divide(w.y).y*(v.height-(x[0]+x[2]));return arbor.Point(A,z)},fromScreen:function(A){if(!o||!v){return}var z=j||[0,0,0,0];var y=o.bottomright.subtract(o.topleft);var x=(A.x-z[3])/(v.width-(z[1]+z[3]))*y.x+o.topleft.x;var w=(A.y-z[0])/(v.height-(z[0]+z[2]))*y.y+o.topleft.y;return arbor.Point(x,w)},_updateBounds:function(x){if(v===null){return}if(x){p=x}else{p=h.bounds()}var A=new Point(p.bottomright.x,p.bottomright.y);var z=new Point(p.topleft.x,p.topleft.y);var C=A.subtract(z);var w=z.add(C.divide(2));var y=4;var E=new Point(Math.max(C.x,y),Math.max(C.y,y));p.topleft=w.subtract(E.divide(2));p.bottomright=w.add(E.divide(2));if(!o){if($.isEmptyObject(d.nodes)){return false}o=p;return true}var D=n;_newBounds={bottomright:o.bottomright.add(p.bottomright.subtract(o.bottomright).multiply(D)),topleft:o.topleft.add(p.topleft.subtract(o.topleft).multiply(D))};var B=new Point(o.topleft.subtract(_newBounds.topleft).magnitude(),o.bottomright.subtract(_newBounds.bottomright).magnitude());if(B.x*v.width>1||B.y*v.height>1){o=_newBounds;return true}else{return false}},energy:function(){return b},bounds:function(){var x=null;var w=null;$.each(d.nodes,function(A,z){if(!x){x=new Point(z._p);w=new Point(z._p);return}var y=z._p;if(y.x===null||y.y===null){return}if(y.x>x.x){x.x=y.x}if(y.y>x.y){x.y=y.y}if(y.x<w.x){w.x=y.x}if(y.y<w.y){w.y=y.y}});if(x&&w){return{bottomright:x,topleft:w}}else{return{topleft:new Point(-1,-1),bottomright:new Point(1,1)}}},nearest:function(y){if(v!==null){y=h.fromScreen(y)}var x={node:null,point:null,distance:null};var w=h;$.each(d.nodes,function(C,z){var A=z._p;if(A.x===null||A.y===null){return}var B=A.subtract(y).magnitude();if(x.distance===null||B<x.distance){x={node:z,point:A,distance:B};if(v!==null){x.screenPoint=h.toScreen(A)}}});if(x.node){if(v!==null){x.distance=h.toScreen(x.node.p).subtract(h.toScreen(y)).magnitude()}return x}else{return null}},_notify:function(){if(i===null){l++}else{clearTimeout(i)}i=setTimeout(h._synchronize,20)},_synchronize:function(){if(k.length>0){d.kernel.graphChanged(k);k=[];i=null}},};d.kernel=Kernel(h);d.tween=d.kernel.tween||null;Node.prototype.__defineGetter__("p",function(){var x=this;var w={};w.__defineGetter__("x",function(){return x._p.x});w.__defineSetter__("x",function(y){d.kernel.particleModified(x._id,{x:y})});w.__defineGetter__("y",function(){return x._p.y});w.__defineSetter__("y",function(y){d.kernel.particleModified(x._id,{y:y})});w.__proto__=Point.prototype;return w});Node.prototype.__defineSetter__("p",function(w){this._p.x=w.x;this._p.y=w.y;d.kernel.particleModified(this._id,{x:w.x,y:w.y})});Node.prototype.__defineGetter__("mass",function(){return this._mass});Node.prototype.__defineSetter__("mass",function(w){this._mass=w;d.kernel.particleModified(this._id,{m:w})});Node.prototype.__defineSetter__("tempMass",function(w){d.kernel.particleModified(this._id,{_m:w})});Node.prototype.__defineGetter__("fixed",function(){return this._fixed});Node.prototype.__defineSetter__("fixed",function(w){this._fixed=w;d.kernel.particleModified(this._id,{f:w?1:0})});return h};
  /* barnes-hut.js */  var BarnesHutTree=function(){var b=[];var a=0;var e=null;var d=0.5;var c={init:function(g,h,f){d=f;a=0;e=c._newBranch();e.origin=g;e.size=h.subtract(g)},insert:function(j){var f=e;var g=[j];while(g.length){var h=g.shift();var m=h._m||h.m;var p=c._whichQuad(h,f);if(f[p]===undefined){f[p]=h;f.mass+=m;if(f.p){f.p=f.p.add(h.p.multiply(m))}else{f.p=h.p.multiply(m)}}else{if("origin" in f[p]){f.mass+=(m);if(f.p){f.p=f.p.add(h.p.multiply(m))}else{f.p=h.p.multiply(m)}f=f[p];g.unshift(h)}else{var l=f.size.divide(2);var n=new Point(f.origin);if(p[0]=="s"){n.y+=l.y}if(p[1]=="e"){n.x+=l.x}var o=f[p];f[p]=c._newBranch();f[p].origin=n;f[p].size=l;f.mass=m;f.p=h.p.multiply(m);f=f[p];if(o.p.x===h.p.x&&o.p.y===h.p.y){var k=l.x*0.08;var i=l.y*0.08;o.p.x=Math.min(n.x+l.x,Math.max(n.x,o.p.x-k/2+Math.random()*k));o.p.y=Math.min(n.y+l.y,Math.max(n.y,o.p.y-i/2+Math.random()*i))}g.push(o);g.unshift(h)}}}},applyForces:function(m,g){var f=[e];while(f.length){node=f.shift();if(node===undefined){continue}if(m===node){continue}if("f" in node){var k=m.p.subtract(node.p);var l=Math.max(1,k.magnitude());var i=((k.magnitude()>0)?k:Point.random(1)).normalize();m.applyForce(i.multiply(g*(node._m||node.m)).divide(l*l))}else{var j=m.p.subtract(node.p.divide(node.mass)).magnitude();var h=Math.sqrt(node.size.x*node.size.y);if(h/j>d){f.push(node.ne);f.push(node.nw);f.push(node.se);f.push(node.sw)}else{var k=m.p.subtract(node.p.divide(node.mass));var l=Math.max(1,k.magnitude());var i=((k.magnitude()>0)?k:Point.random(1)).normalize();m.applyForce(i.multiply(g*(node.mass)).divide(l*l))}}}},_whichQuad:function(i,f){if(i.p.exploded()){return null}var h=i.p.subtract(f.origin);var g=f.size.divide(2);if(h.y<g.y){if(h.x<g.x){return"nw"}else{return"ne"}}else{if(h.x<g.x){return"sw"}else{return"se"}}},_newBranch:function(){if(b[a]){var f=b[a];f.ne=f.nw=f.se=f.sw=undefined;f.mass=0;delete f.p}else{f={origin:null,size:null,nw:undefined,ne:undefined,sw:undefined,se:undefined,mass:0};b[a]=f}a++;return f}};return c};
  /*    physics.js */  //
// physics.js
//
// the particle system itself. either run inline or in a worker (see worker.js)
//

  var Physics = function(dt, stiffness, repulsion, friction, updateFn){
    var bhTree = BarnesHutTree() // for computing particle repulsion
    var active = {particles:{}, springs:{}}
    var free = {particles:{}}
    var particles = []
    var springs = []
    var _epoch=0
    var _energy = {sum:0, max:0, mean:0}
    var _bounds = {topleft:new Point(-1,-1), bottomright:new Point(1,1)}

    var SPEED_LIMIT = 1000 // the max particle velocity per tick
    
    var that = {
      stiffness:(stiffness!==undefined) ? stiffness : 1000,
      repulsion:(repulsion!==undefined)? repulsion : 600,
      friction:(friction!==undefined)? friction : .3,
      gravity:false,
      dt:(dt!==undefined)? dt : 0.02,
      theta:.4, // the criterion value for the barnes-hut s/d calculation
      
      init:function(){
        return that
      },

      modifyPhysics:function(param){
        $.each(['stiffness','repulsion','friction','gravity','dt','precision'], function(i, p){
          if (param[p]!==undefined){
            if (p=='precision'){
              that.theta = 1-param[p]
              return
            }
            that[p] = param[p]
             
            if (p=='stiffness'){
              var stiff=param[p]
              $.each(active.springs, function(id, spring){
                spring.k = stiff
              })             
            }
          }
        })
      },

      addNode:function(c){
        var id = c.id
        var mass = c.m

        var w = _bounds.bottomright.x - _bounds.topleft.x
        var h = _bounds.bottomright.y - _bounds.topleft.y
        var randomish_pt = new Point((c.x != null) ? c.x: _bounds.topleft.x + w*Math.random(),
                                     (c.y != null) ? c.y: _bounds.topleft.y + h*Math.random())

        
        active.particles[id] = new Particle(randomish_pt, mass);
        active.particles[id].connections = 0
        active.particles[id].fixed = (c.f===1)
        free.particles[id] = active.particles[id]
        particles.push(active.particles[id])        
      },

      dropNode:function(c){
        var id = c.id
        var dropping = active.particles[id]
        var idx = $.inArray(dropping, particles)
        if (idx>-1) particles.splice(idx,1)
        delete active.particles[id]
        delete free.particles[id]
      },

      modifyNode:function(id, mods){
        if (id in active.particles){
          var pt = active.particles[id]
          if ('x' in mods) pt.p.x = mods.x
          if ('y' in mods) pt.p.y = mods.y
          if ('m' in mods) pt.m = mods.m
          if ('f' in mods) pt.fixed = (mods.f===1)
          if ('_m' in mods){
            if (pt._m===undefined) pt._m = pt.m
            pt.m = mods._m            
          }
        }
      },

      addSpring:function(c){
        var id = c.id
        var length = c.l
        var from = active.particles[c.fm]
        var to = active.particles[c.to]
        
        if (from!==undefined && to!==undefined){
          active.springs[id] = new Spring(from, to, length, that.stiffness)
          springs.push(active.springs[id])
          
          from.connections++
          to.connections++
          
          delete free.particles[c.fm]
          delete free.particles[c.to]
        }
      },

      dropSpring:function(c){
        var id = c.id
        var dropping = active.springs[id]
        
        dropping.point1.connections--
        dropping.point2.connections--
        
        var idx = $.inArray(dropping, springs)
        if (idx>-1){
           springs.splice(idx,1)
        }
        delete active.springs[id]
      },

      _update:function(changes){
        // batch changes phoned in (automatically) by a ParticleSystem
        _epoch++
        
        $.each(changes, function(i, c){
          if (c.t in that) that[c.t](c)
        })
        return _epoch
      },


      tick:function(){
        that.tendParticles()
        that.eulerIntegrator(that.dt)
        that.tock()
      },

      tock:function(){
        var coords = []
        $.each(active.particles, function(id, pt){
          coords.push(id)
          coords.push(pt.p.x)
          coords.push(pt.p.y)
        })

        if (updateFn) updateFn({geometry:coords, epoch:_epoch, energy:_energy, bounds:_bounds})
      },

      tendParticles:function(){
        $.each(active.particles, function(id, pt){
          // decay down any of the temporary mass increases that were passed along
          // by using an {_m:} instead of an {m:} (which is to say via a Node having
          // its .tempMass attr set)
          if (pt._m!==undefined){
            if (Math.abs(pt.m-pt._m)<1){
              pt.m = pt._m
              delete pt._m
            }else{
              pt.m *= .98
            }
          }

          // zero out the velocity from one tick to the next
          pt.v.x = pt.v.y = 0           
        })

      },
      
      
      // Physics stuff
      eulerIntegrator:function(dt){
        if (that.repulsion>0){
          if (that.theta>0) that.applyBarnesHutRepulsion()
          else that.applyBruteForceRepulsion()
        }
        if (that.stiffness>0) that.applySprings()
        that.applyCenterDrift()
        if (that.gravity) that.applyCenterGravity()
        that.updateVelocity(dt)
        that.updatePosition(dt)
      },

      applyBruteForceRepulsion:function(){
        $.each(active.particles, function(id1, point1){
          $.each(active.particles, function(id2, point2){
            if (point1 !== point2){
              var d = point1.p.subtract(point2.p);
              var distance = Math.max(1.0, d.magnitude());
              var direction = ((d.magnitude()>0) ? d : Point.random(1)).normalize()

              // apply force to each end point
              // (consult the cached `real' mass value if the mass is being poked to allow
              // for repositioning. the poked mass will still be used in .applyforce() so
              // all should be well)
              point1.applyForce(direction.multiply(that.repulsion*(point2._m||point2.m)*.5)
                                         .divide(distance * distance * 0.5) );
              point2.applyForce(direction.multiply(that.repulsion*(point1._m||point1.m)*.5)
                                         .divide(distance * distance * -0.5) );

            }
          })          
        })
      },
      
      applyBarnesHutRepulsion:function(){
        if (!_bounds.topleft || !_bounds.bottomright) return
        var nParticles = 0;
         for (var particle in active.particles)
            nParticles++;
         if (nParticles < 2) return
         
        var bottomright = new Point(_bounds.bottomright)
        var topleft = new Point(_bounds.topleft)

        // build a barnes-hut tree...
        bhTree.init(topleft, bottomright, that.theta)        
        $.each(active.particles, function(id, particle){
          bhTree.insert(particle)
        })
        
        // ...and use it to approximate the repulsion forces
        $.each(active.particles, function(id, particle){
          bhTree.applyForces(particle, that.repulsion)
        })
      },
      
      applySprings:function(){
        $.each(active.springs, function(id, spring){
          var d = spring.point2.p.subtract(spring.point1.p); // the direction of the spring
          var displacement = spring.length - d.magnitude()//Math.max(.1, d.magnitude());
          var direction = ( (d.magnitude()>0) ? d : Point.random(1) ).normalize()

          // BUG:
          // since things oscillate wildly for hub nodes, should probably normalize spring
          // forces by the number of incoming edges for each node. naive normalization 
          // doesn't work very well though. what's the `right' way to do it?

          // apply force to each end point
          spring.point1.applyForce(direction.multiply(spring.k * displacement * -0.5))
          spring.point2.applyForce(direction.multiply(spring.k * displacement * 0.5))
        });
      },


      applyCenterDrift:function(){
        // find the centroid of all the particles in the system and shift everything
        // so the cloud is centered over the origin
        var numParticles = 0
        var centroid = new Point(0,0)
        $.each(active.particles, function(id, point) {
          centroid.add(point.p)
          numParticles++
        });

        if (numParticles < 2) return
        
        var correction = centroid.divide(-numParticles)
        $.each(active.particles, function(id, point) {
          point.applyForce(correction)
        })
        
      },
      applyCenterGravity:function(){
        // attract each node to the origin
        $.each(active.particles, function(id, point) {
          var direction = point.p.multiply(-1.0);
          point.applyForce(direction.multiply(that.repulsion / 100.0));
        });
      },
      
      updateVelocity:function(timestep){
        // translate forces to a new velocity for this particle
        $.each(active.particles, function(id, point) {
          if (point.fixed){
             point.v = new Point(0,0)
             point.f = new Point(0,0)
             return
          }

          var was = point.v.magnitude()
          point.v = point.v.add(point.f.multiply(timestep)).multiply(1-that.friction);
          point.f.x = point.f.y = 0

          var speed = point.v.magnitude()          
          if (speed>SPEED_LIMIT) point.v = point.v.divide(speed*speed)
        });
      },

      updatePosition:function(timestep){
        // translate velocity to a position delta
        var sum=0, max=0, n = 0;
        var bottomright = null
        var topleft = null

        $.each(active.particles, function(i, point) {
          // move the node to its new position
          point.p = point.p.add(point.v.multiply(timestep));
          
          // keep stats to report in systemEnergy
          var speed = point.v.magnitude();
          var e = speed*speed
          sum += e
          max = Math.max(e,max)
          n++

          if (!bottomright){
            bottomright = new Point(point.p.x, point.p.y)
            topleft = new Point(point.p.x, point.p.y)
            return
          }
        
          var pt = point.p
          if (pt.x===null || pt.y===null) return
          if (pt.x > bottomright.x) bottomright.x = pt.x;
          if (pt.y > bottomright.y) bottomright.y = pt.y;          
          if   (pt.x < topleft.x)   topleft.x = pt.x;
          if   (pt.y < topleft.y)   topleft.y = pt.y;
        });
        
        _energy = {sum:sum, max:max, mean:sum/n, n:n}
        if (n > 1)
          _bounds = {topleft:topleft||new Point(-1,-1), bottomright:bottomright||new Point(1,1)}
      },

      systemEnergy:function(timestep){
        // system stats
        return _energy
      }

      
    }
    return that.init()
  }
  
  var _nearParticle = function(center_pt, r){
      var r = r || .0
      var x = center_pt.x
      var y = center_pt.y
      var d = r*2
      return new Point(x-r+Math.random()*d, y-r+Math.random()*d)
  }
/* physics.js */

  // if called as a worker thread, set up a run loop for the Physics object and bail out
  if (typeof(window)=='undefined') return (function(){
  /* hermetic.js */  $={each:function(d,e){if($.isArray(d)){for(var c=0,b=d.length;c<b;c++){e(c,d[c])}}else{for(var a in d){e(a,d[a])}}},map:function(a,c){var b=[];$.each(a,function(f,e){var d=c(e);if(d!==undefined){b.push(d)}});return b},extend:function(c,b){if(typeof b!="object"){return c}for(var a in b){if(b.hasOwnProperty(a)){c[a]=b[a]}}return c},isArray:function(a){if(!a){return false}return(a.constructor.toString().indexOf("Array")!=-1)},inArray:function(c,a){for(var d=0,b=a.length;d<b;d++){if(a[d]===c){return d}}return -1},isEmptyObject:function(a){if(typeof a!=="object"){return false}var b=true;$.each(a,function(c,d){b=false});return b},};
  /*     worker.js */  var PhysicsWorker=function(){var b=20;var a=null;var d=null;var c=null;var g=[];var f=new Date().valueOf();var e={init:function(h){e.timeout(h.timeout);a=Physics(h.dt,h.stiffness,h.repulsion,h.friction,e.tock);return e},timeout:function(h){if(h!=b){b=h;if(d!==null){e.stop();e.go()}}},go:function(){if(d!==null){return}c=null;d=setInterval(e.tick,b)},stop:function(){if(d===null){return}clearInterval(d);d=null},tick:function(){a.tick();var h=a.systemEnergy();if((h.mean+h.max)/2<0.05){if(c===null){c=new Date().valueOf()}if(new Date().valueOf()-c>1000){e.stop()}else{}}else{c=null}},tock:function(h){h.type="geometry";postMessage(h)},modifyNode:function(i,h){a.modifyNode(i,h);e.go()},modifyPhysics:function(h){a.modifyPhysics(h)},update:function(h){var i=a._update(h)}};return e};var physics=PhysicsWorker();onmessage=function(a){if(!a.data.type){postMessage("¿kérnèl?");return}if(a.data.type=="physics"){var b=a.data.physics;physics.init(a.data.physics);return}switch(a.data.type){case"modify":physics.modifyNode(a.data.id,a.data.mods);break;case"changes":physics.update(a.data.changes);physics.go();break;case"start":physics.go();break;case"stop":physics.stop();break;case"sys":var b=a.data.param||{};if(!isNaN(b.timeout)){physics.timeout(b.timeout)}physics.modifyPhysics(b);physics.go();break}};
  })()


  arbor = (typeof(arbor)!=='undefined') ? arbor : {}
  $.extend(arbor, {
    // object constructors (don't use ‘new’, just call them)
    ParticleSystem:ParticleSystem,
    Point:function(x, y){ return new Point(x, y) },

    // immutable object with useful methods
    etc:{      
      trace:trace,              // ƒ(msg) -> safe console logging
      dirname:dirname,          // ƒ(path) -> leading part of path
      basename:basename,        // ƒ(path) -> trailing part of path
      ordinalize:ordinalize,    // ƒ(num) -> abbrev integers (and add commas)
      objcopy:objcopy,          // ƒ(old) -> clone an object
      objcmp:objcmp,            // ƒ(a, b, strict_ordering) -> t/f comparison
      objkeys:objkeys,          // ƒ(obj) -> array of all keys in obj
      objmerge:objmerge,        // ƒ(dst, src) -> like $.extend but non-destructive
      uniq:uniq,                // ƒ(arr) -> array of unique items in arr
      arbor_path:arbor_path,    // ƒ() -> guess the directory of the lib code
    }
  })
  
})(this.jQuery)