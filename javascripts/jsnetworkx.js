(function(){function e(a){throw a;}var g=void 0,j=null,k=!1;function aa(a){return function(){return a}}var l,ba=this;
function m(a){var b=typeof a;if("object"==b)if(a){if(a instanceof Array)return"array";if(a instanceof Object)return b;var c=Object.prototype.toString.call(a);if("[object Window]"==c)return"object";if("[object Array]"==c||"number"==typeof a.length&&"undefined"!=typeof a.splice&&"undefined"!=typeof a.propertyIsEnumerable&&!a.propertyIsEnumerable("splice"))return"array";if("[object Function]"==c||"undefined"!=typeof a.call&&"undefined"!=typeof a.propertyIsEnumerable&&!a.propertyIsEnumerable("call"))return"function"}else return"null";
else if("function"==b&&"undefined"==typeof a.call)return"object";return b}function n(a){return a!==g}function o(a){return a!=j}function p(a){return"array"==m(a)}function q(a){var b=m(a);return"array"==b||"object"==b&&"number"==typeof a.length}function r(a){return"string"==typeof a}function ca(a){return"boolean"==typeof a}function da(a){var b=typeof a;return"object"==b&&a!=j||"function"==b}var ea="closure_uid_"+Math.floor(2147483648*Math.random()).toString(36),fa=0;
function s(a,b){var c=a.split("."),d=ba;!(c[0]in d)&&d.execScript&&d.execScript("var "+c[0]);for(var f;c.length&&(f=c.shift());)!c.length&&n(b)?d[f]=b:d=d[f]?d[f]:d[f]={}}function u(a,b){function c(){}c.prototype=b.prototype;a.ta=b.prototype;a.prototype=new c;a.prototype.constructor=a};var v=Array.prototype,w=v.forEach?function(a,b,c){v.forEach.call(a,b,c)}:function(a,b,c){for(var d=a.length,f=r(a)?a.split(""):a,h=0;h<d;h++)h in f&&b.call(c,f[h],h,a)},ga=v.filter?function(a,b,c){return v.filter.call(a,b,c)}:function(a,b,c){for(var d=a.length,f=[],h=0,i=r(a)?a.split(""):a,t=0;t<d;t++)if(t in i){var S=i[t];b.call(c,S,t,a)&&(f[h++]=S)}return f},x=v.map?function(a,b,c){return v.map.call(a,b,c)}:function(a,b,c){for(var d=a.length,f=Array(d),h=r(a)?a.split(""):a,i=0;i<d;i++)i in h&&(f[i]=
b.call(c,h[i],i,a));return f};function ha(a,b){if(a.reduce)return a.reduce(b,0);var c=0;w(a,function(d,f){c=b.call(g,c,d,f,a)});return c}function ia(a,b){var c;a:{c=a.length;for(var d=r(a)?a.split(""):a,f=0;f<c;f++)if(f in d&&b.call(g,d[f],f,a)){c=f;break a}c=-1}return 0>c?j:r(a)?a.charAt(c):a[c]}function y(a){return v.concat.apply(v,arguments)}function ja(a){if(p(a))return y(a);for(var b=[],c=0,d=a.length;c<d;c++)b[c]=a[c];return b}
function z(a,b,c){return 2>=arguments.length?v.slice.call(a,b):v.slice.call(a,b,c)}function ka(a){for(var b=[],c=0;c<a;c++)b[c]=0;return b}function la(a){if(!arguments.length)return[];for(var b=[],c=0;;c++){for(var d=[],f=0;f<arguments.length;f++){var h=arguments[f];if(c>=h.length)return b;d.push(h[c])}b.push(d)}};var A="StopIteration"in ba?ba.StopIteration:Error("StopIteration");function B(){}B.prototype.next=function(){e(A)};B.prototype.f=function(){return this};function C(a){if(a instanceof B)return a;if("function"==typeof a.f)return a.f(k);if(q(a)){var b=0,c=new B;c.next=function(){for(;;){b>=a.length&&e(A);if(b in a)return a[b++];b++}};return c}e(Error("Not implemented"))}function ma(a,b,c){if(q(a))try{w(a,b,c)}catch(d){d!==A&&e(d)}else{a=C(a);try{for(;;)b.call(c,a.next(),g,a)}catch(f){f!==A&&e(f)}}}
function na(a,b,c){var a=C(a),d=new B;d.next=function(){for(;;){var d=a.next();return b.call(c,d,g,a)}};return d}function oa(a,b){var c={};ma(a,function(a){c=b.call(g,c,a)});return c}function pa(a){if(q(a))return p(a)?y(a):ja(a);var a=C(a),b=[];ma(a,function(a){b.push(a)});return b};function D(a,b,c){for(var d in a)b.call(c,a[d],d,a)}function qa(a,b,c){var d={},f;for(f in a)d[f]=b.call(c,a[f],f,a);return d}function E(a){var b=0,c;for(c in a)b++;return b}function F(a){var b=[],c=0,d;for(d in a)b[c++]=a[d];return b}function G(a){var b=[],c=0,d;for(d in a)b[c++]=d;return b}function H(a){for(var b in a)delete a[b]}function I(a,b){b in a&&delete a[b]}function J(a,b,c){return b in a?a[b]:c}function K(a){var b={},c;for(c in a)b[c]=a[c];return b}var ra="constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf".split(",");
function L(a,b){for(var c,d,f=1;f<arguments.length;f++){d=arguments[f];for(c in d)a[c]=d[c];for(var h=0;h<ra.length;h++)c=ra[h],Object.prototype.hasOwnProperty.call(d,c)&&(a[c]=d[c])}};var sa={};function ta(a){return oa(M(a),function(a,c){a[c[0]]=c[1];return a})}function N(a){return a instanceof B||"function"==m(a.f)}function ua(a){if(r(a)||q(a)||"length"in a)return a.length;if(va(a))return E(a);e(new TypeError)}function O(a,b,c,d){ca(c)&&(d=c,c=j);if(d)var f=b,b=function(a){f.apply(this,a)};N(a)?ma(a,b,c):q(a)||r(a)?w(a,b,c):da(a)&&O(G(a),b,c)}s("jsnx.forEach",O);function P(a,b,c){if(q(a))return x(a,b,c);if(N(a))return na(a,b,c);if(da(a))return qa(a,b,c);e(new TypeError)}
function wa(){var a=arguments,b=a[0];if(q(b))return la.apply(j,a);if(N(b)){var b=new B,c=a.length;b.next=function(){for(var b=[],f=0;f<c;f++)b.push(a[f].next());return b};return b}if(da(b))return la.apply(j,x(a,G));e(new TypeError)}function Q(a){if(q(a))return p(a)?y(a):ja(a);if(N(a))return pa(a);if(da(a))return G(a);e(new TypeError)}s("jsnx.toArray",Q);function R(a){var b=[];D(a,function(a,d){b.push([d,a])});return b}
function T(a){var b=new B,c=C(G(a));b.next=function(){var b=c.next();return[b,a[b]]};return b}function M(a){"object"===m(a)&&!q(a)&&!N(a)&&(a=G(a));return C(a)}
function U(a){var b=new B,c=z(arguments,1);if(0===c.length)return a;try{a=C(a)}catch(d){return b.next=function(){"Not implemented"===d.message&&e(new TypeError)},b}var f=j;b.next=function(){var d,i;try{for(;!n(d);)d=f.next()}catch(t){for(;!n(i)||!n(d);)i=a.next(),d=c[0](i);if(N(d))return f=U.apply(j,y([d],z(c,1))),b.next();f=j}return d};return b}s("jsnx.sentinelIterator",function(a,b){var c=new B;c.next=function(){var c;try{c=C(a).next()}catch(f){f!=A&&e(f),c=b}return c};return c});
function va(a){var b=Object.prototype.hasOwnProperty;if(!a||"object"!==m(a)||a.nodeType||a==a.window)return k;try{if(a.constructor&&!b.call(a,"constructor")&&!b.call(a.constructor.prototype,"isPrototypeOf"))return k}catch(c){return k}for(var d in a);return d===g||b.call(a,d)}
function V(a,b){var b=b||[],c=m(a);if("object"==c&&va(a)||"array"==c){var d=ia(b,function(b){return a===b[0]});if(d!==j)return d[1];if(a.D)return d=[a,a.D()],b.push(d),d[1];c="array"==c?[]:{};d=[a,c];b.push(d);for(var f in a)c[f]=V(a[f],b);return c}return a}function xa(a){function b(){}var c={},d;b.prototype=a.constructor.prototype;for(d in a)a.hasOwnProperty(d)&&(c[d]=a[d]);c=V(c);a=new b;for(d in c)a[d]=c[d];return a};function W(a){this.name="JSNetworkXException";this.message=a}W.prototype=Error();W.prototype.constructor=W;s("jsnx.JSNetworkXException",W);function X(a){W.call(this,a);this.name="JSNetworkXError"}u(X,W);s("jsnx.JSNetworkXError",X);function ya(a){W.call(this,a);this.name="JSNetworkXPointlessConcept"}u(ya,W);s("jsnx.JSNetworkXPointlessConcept",ya);function Y(a){W.call(this,a);this.name="JSNetworkXAlgorithmError"}u(Y,W);s("jsnx.JSNetworkXAlgorithmError",Y);
function za(a){Y.call(this,a);this.name="JSNetworkXUnfeasible"}u(za,Y);s("jsnx.JSNetworkXUnfeasible",za);function Aa(a){za.call(this,a);this.name="JSNetworkXNoPath"}u(Aa,za);s("jsnx.JSNetworkXNoPath",Aa);function Ba(a){Y.call(this,a);this.name="JSNetworkXUnbounded"}u(Ba,Y);s("jsnx.JSNetworkXUnbounded",Ba);function Ca(a){if("function"==typeof a.m)return a.m();if(r(a))return a.split("");if(q(a)){for(var b=[],c=a.length,d=0;d<c;d++)b.push(a[d]);return b}return F(a)};function Da(a,b){this.c={};this.b=[];var c=arguments.length;if(1<c){c%2&&e(Error("Uneven number of arguments"));for(var d=0;d<c;d+=2)this.set(arguments[d],arguments[d+1])}else a&&this.C(a)}l=Da.prototype;l.r=0;l.B=0;l.m=function(){Ea(this);for(var a=[],b=0;b<this.b.length;b++)a.push(this.c[this.b[b]]);return a};l.clear=function(){this.c={};this.B=this.r=this.b.length=0};
function Ea(a){if(a.r!=a.b.length){for(var b=0,c=0;b<a.b.length;){var d=a.b[b];Object.prototype.hasOwnProperty.call(a.c,d)&&(a.b[c++]=d);b++}a.b.length=c}if(a.r!=a.b.length){for(var f={},c=b=0;b<a.b.length;)d=a.b[b],Object.prototype.hasOwnProperty.call(f,d)||(a.b[c++]=d,f[d]=1),b++;a.b.length=c}}l.set=function(a,b){Object.prototype.hasOwnProperty.call(this.c,a)||(this.r++,this.b.push(a),this.B++);this.c[a]=b};
l.C=function(a){var b;a instanceof Da?(Ea(a),b=a.b.concat(),a=a.m()):(b=G(a),a=F(a));for(var c=0;c<b.length;c++)this.set(b[c],a[c])};l.D=function(){return new Da(this)};l.f=function(a){Ea(this);var b=0,c=this.b,d=this.c,f=this.B,h=this,i=new B;i.next=function(){for(;;){f!=h.B&&e(Error("The map has changed since the iterator was created"));b>=c.length&&e(A);var i=c[b++];return a?i:d[i]}};return i};function Fa(a){this.c=new Da;a&&this.C(a)}function Ga(a){var b=typeof a;return"object"==b&&a||"function"==b?"o"+(a[ea]||(a[ea]=++fa)):b.substr(0,1)+a}l=Fa.prototype;l.add=function(a){this.c.set(Ga(a),a)};l.C=function(a){for(var a=Ca(a),b=a.length,c=0;c<b;c++)this.add(a[c])};l.clear=function(){this.c.clear()};l.contains=function(a){a=Ga(a);return Object.prototype.hasOwnProperty.call(this.c.c,a)};l.m=function(){return this.c.m()};l.D=function(){return new Fa(this)};l.f=function(){return this.c.f(k)};function Ha(a){if(o(a))try{a.clear()}catch(b){e(Error("Input graph is not a jsnx graph type"))}else a=new sa.pa;return a}
function Ia(a,b,c){var d;if(a.hasOwnProperty("adj"))try{return d=Ja(a.adj,b,k),"graph"in a&&"object"===m(a.graph)&&(d.graph=K(a.graph)),"node"in a&&"object"===m(a.node)&&(d.node=qa(a.node,function(a){return K(a)})),d}catch(f){e(Error("Input is not a correct jsnx graph"))}if("object"===m(a))try{return Ja(a,b,c)}catch(h){try{return Ka(a,b)}catch(i){e(Error("Input is not known type."))}}if(q(a))try{return La(a,b)}catch(t){e(Error("Input is not valid edge list"))}}s("jsnx.to_networkx_graph",Ia);
s("jsnx.convert_to_undirected",sa.ra);s("jsnx.convert_to_undirected",sa.qa);s("jsnx.to_dict_of_lists",sa.ua);function Ka(a,b){var c=Ha(b);c.d(a);var d=[];D(a,function(a,b){w(a,function(a){d.push([b,a])})});c.a(d);return c}
function Ja(a,b,c){var d=Ha(b),f,h;d.d(a);c?d.h()?(f=[],D(a,function(a,b){q(a)&&e(Error());D(a,function(a,c){D(a,function(a){f.push([b,c,a])})})}),d.a(f)):(h=new Fa,D(a,function(a,b){q(a)&&e(Error());D(a,function(a,c){h.contains([b,c].toString())||(f=[],D(a,function(a){f.push([b,c,a])}),d.a(f),h.add([c,b].toString()))})})):(f=[],D(a,function(a,b){q(a)&&e(Error());D(a,function(a,c){f.push([b,c,a])})}),d.a(f));return d}function La(a,b){var c=Ha(b);c.a(a);return c};function Ma(a){return ha(arguments,function(a,c){return a+c})};function Z(a,b){if(!(this instanceof Z))return new Z(a,b);this.graph={};this.node={};this.adj={};o(a)&&Ia(a,this);L(this.graph,b||{});this.edge=this.adj}s("jsnx.classes.Graph",Z);s("jsnx.Graph",Z);Z.__name__="Graph";Z.prototype.da=j;Z.prototype.graph=Z.prototype.da;Z.prototype.I=j;Z.prototype.node=Z.prototype.I;Z.prototype.Z=j;Z.prototype.adj=Z.prototype.Z;Z.prototype.aa=j;Z.prototype.edge=Z.prototype.aa;
Z.prototype.name=function(a){if(n(a))this.graph.name=a.toString();else return this.graph.name||""};Z.prototype.name=Z.prototype.name;Z.prototype.toString=function(){return this.name()};Z.prototype.toString=Z.prototype.toString;Z.prototype.f=function(){return M(this.adj)};Z.prototype.__iterator__=Z.prototype.f;Z.prototype.N=function(a){a in this.adj||e({name:"KeyError",message:"Graph does not contain node "+a+"."});return this.adj[a]};Z.prototype.get_node=Z.prototype.N;
Z.prototype.q=function(a,b){o(b)||(b={});"object"!==m(b)&&e(new X("The attr_dict argument must be an object."));a in this.adj?L(this.node[a],b||{}):(this.adj[a]={},this.node[a]=b||{})};Z.prototype.add_node=Z.prototype.q;Z.prototype.d=function(a,b){var c,d,f,h,i,b=b||{};O(a,function(a){c=!(a in this.adj);p(a)?(d=a[0],f=a[1],d in this.adj?(i=this.node[d],L(i,b,f)):(this.adj[d]={},h=K(b),L(h,f),this.node[d]=h)):c?(this.adj[a]={},this.node[a]=K(b)):L(this.node[a],b)},this)};
Z.prototype.add_nodes_from=Z.prototype.d;Z.prototype.w=function(a){var b=this.adj,c;a in this.node||e(new X("The node "+a+" is not in the graph"));c=G(b[a]);I(this.node,a);w(c,function(c){I(b[c],a)});I(b,a)};Z.prototype.remove_node=Z.prototype.w;Z.prototype.z=function(a){var b=this.adj;O(a,function(a){try{I(this.node,a),D(b[a],function(d,h){I(b[h],a)}),I(b,a)}catch(d){}},this)};Z.prototype.remove_nodes_from=Z.prototype.z;Z.prototype.J=function(a){return a?T(this.node):M(G(this.adj))};
Z.prototype.nodes_iter=Z.prototype.J;Z.prototype.Q=function(a){return pa(this.J(a))};Z.prototype.nodes=Z.prototype.Q;Z.prototype.o=function(){return E(this.adj)};Z.prototype.number_of_nodes=Z.prototype.o;Z.prototype.ka=function(){return E(this.adj)};Z.prototype.order=Z.prototype.ka;Z.prototype.k=function(a){return!p(a)&&a in this.adj};Z.prototype.has_node=Z.prototype.k;
Z.prototype.p=function(a,b,c){c=c||{};"object"!==m(c)&&e(new X("The attr_dict argument must be an object."));a in this.adj||(this.adj[a]={},this.node[a]={});b in this.adj||(this.adj[b]={},this.node[b]={});var d=J(this.adj[a],b,{});L(d,c);this.adj[a][b]=d;this.adj[b][a]=d};Z.prototype.add_edge=Z.prototype.p;
Z.prototype.a=function(a,b){b=b||{};"object"!==m(b)&&e(new X("The attr_dict argument must be an object."));O(a,function(a){var d=ua(a),f,h,i;3===d?(f=a[0],h=a[1],i=a[2]):2===d?(f=a[0],h=a[1],i={}):e(new X("Edge tuple "+a.toString()+" must be a 2-tuple or 3-tuple."));f in this.adj||(this.adj[f]={},this.node[f]={});h in this.adj||(this.adj[h]={},this.node[h]={});a=J(this.adj[f],h,{});L(a,b,i);this.adj[f][h]=a;this.adj[h][f]=a},this)};Z.prototype.add_edges_from=Z.prototype.a;
Z.prototype.Y=function(a,b,c){c=c||{};r(b)||(c=b,b="weight");this.a(P(a,function(a){var c={};c[b]=a[2];return[a[0],a[1],c]}),c)};Z.prototype.add_weighted_edges_from=Z.prototype.Y;Z.prototype.u=function(a,b){try{I(this.adj[a],b),a!=b&&I(this.adj[b],a)}catch(c){c instanceof TypeError&&e(new X("The edge "+a+"-"+b+" is not in the graph")),e(c)}};Z.prototype.remove_edge=Z.prototype.u;
Z.prototype.v=function(a){O(a,function(a){var c=a[0],a=a[1];c in this.adj&&a in this.adj[c]&&(I(this.adj[c],a),c!=a&&I(this.adj[a],c))},this)};Z.prototype.remove_edges_from=Z.prototype.v;Z.prototype.ea=function(a,b){return a in this.adj&&b in this.adj[a]};Z.prototype.has_edge=Z.prototype.ea;Z.prototype.n=function(a){a in this.adj||e(new X("The node "+a+" is not in the graph."));return Q(this.adj[a])};Z.prototype.neighbors=Z.prototype.n;
Z.prototype.H=function(a){a in this.adj||e(new X("The node "+a+" is not in the graph."));return M(this.adj[a])};Z.prototype.neighbors_iter=Z.prototype.H;Z.prototype.s=function(a,b){return Q(this.g(a,b))};Z.prototype.edges=Z.prototype.s;
Z.prototype.g=function(a,b){ca(a)&&(b=a,a=j);var c={},d,f;d=o(a)?P(this.e(a),function(a){return[a,this.adj[a]]},this):T(this.adj);return b?U(d,function(a){f=a[0];var b=new B,d=T(a[1]);b.next=function(){try{return d.next()}catch(a){a===A&&(c[f]=1);e(a)}};return b},function(a){if(!(a[0]in c))return[f,a[0],a[1]]}):U(d,function(a){f=a[0];var b=new B,d=M(a[1]);b.next=function(){try{return d.next()}catch(a){a===A&&(c[f]=1);e(a)}};return b},function(a){if(!(a in c))return[f,a]})};
Z.prototype.edges_iter=Z.prototype.g;Z.prototype.ca=function(a,b,c){n(c)||(c=j);return a in this.adj?J(this.adj[a],b,c):c};Z.prototype.get_edge_data=Z.prototype.ca;Z.prototype.$=function(){return Q(P(this.i(),function(a){return G(a[1])}))};Z.prototype.adjacency_list=Z.prototype.$;Z.prototype.i=function(){return T(this.adj)};Z.prototype.adjacency_iter=Z.prototype.i;Z.prototype.j=function(a,b){return this.k(a)?this.l(a,b).next()[1]:ta(pa(this.l(a,b)))};Z.prototype.degree=Z.prototype.j;
Z.prototype.l=function(a,b){var c;c=o(a)?P(this.e(a),function(a){return[a,this.adj[a]]},this):T(this.adj);return b?P(c,function(a){var c=a[0],a=a[1],h=0,i;for(i in a)h+=+J(a[i],b,1);h+=+(c in a&&J(a[c],b,1));return[c,h]}):P(c,function(a){return[a[0],E(a[1])+ +(a[0]in a[1])]})};Z.prototype.degree_iter=Z.prototype.l;Z.prototype.clear=function(){this.name("");H(this.adj);H(this.node);H(this.graph)};Z.prototype.clear=Z.prototype.clear;Z.prototype.copy=function(){return xa(this)};Z.prototype.copy=Z.prototype.copy;
Z.prototype.G=aa(k);Z.prototype.is_multigraph=Z.prototype.G;Z.prototype.h=aa(k);Z.prototype.is_directed=Z.prototype.h;Z.prototype.L=function(){var a=new $;a.name(this.name());a.d(this);a.a(function(){var a;return U(this.i(),function(c){a=c[0];return T(c[1])},function(c){return[a,c[0],V(c[1])]})}.call(this));a.graph=V(this.graph);a.node=V(this.node);return a};Z.prototype.to_directed=Z.prototype.L;
Z.prototype.M=function(){var a=new Z;a.name(this.name());a.d(this);a.a(function(){var a;return U(this.i(),function(c){a=c[0];return T(c[1])},function(c){return[a,c[0],V(c[1])]})}.call(this));a.graph=V(this.graph);a.node=V(this.node);return a};Z.prototype.to_undirected=Z.prototype.M;
Z.prototype.A=function(a){var a=this.e(a),b=new this.constructor,c=b.adj,d=this.adj;O(a,function(a){var b={};c[a]=b;D(d[a],function(d,t){t in c&&(b[t]=d,c[t][a]=d)})});O(b,function(a){b.node[a]=this.node[a]},this);b.graph=this.graph;return b};Z.prototype.subgraph=Z.prototype.A;Z.prototype.ia=function(){return x(ga(R(this.adj),function(a){return a[0]in a[1]}),function(a){return a[0]})};Z.prototype.nodes_with_selfloops=Z.prototype.ia;
Z.prototype.S=function(a){return a?x(ga(R(this.adj),function(a){return a[0]in a[1]}),function(a){var c=a[0];return[c,c,a[1][c]]}):x(ga(R(this.adj),function(a){return a[0]in a[1]}),function(a){return[a[0],a[0]]})};Z.prototype.selfloop_edges=Z.prototype.S;Z.prototype.ja=function(){return this.S.length};Z.prototype.number_of_selfloops=Z.prototype.ja;Z.prototype.size=function(a){var b=Ma.apply(j,F(this.j(a)))/2;return o(a)?b:Math.floor(b)};Z.prototype.size=Z.prototype.size;
Z.prototype.t=function(a,b){return!o(a)?Math.floor(this.size()):b in this.adj[a]?1:0};Z.prototype.number_of_edges=Z.prototype.t;Z.prototype.X=function(a,b){var c=Q(a),d=c[0];this.a(P(z(c,1),function(a){return[d,a]}),b)};Z.prototype.add_star=Z.prototype.X;Z.prototype.W=function(a,b){var c=Q(a);this.a(la(z(c,0,c.length-1),z(c,1)),b)};Z.prototype.add_path=Z.prototype.W;Z.prototype.V=function(a,b){var c=Q(a);this.a(la(c,y(z(c,1),[c[0]])),b)};Z.prototype.add_cycle=Z.prototype.V;
Z.prototype.e=function(a){return o(a)?this.k(a)?M([a.toString()]):function(a,c){var d=new B,f=U(a,function(a){if(a in c)return a.toString()});d.next=function(){try{return f.next()}catch(a){a instanceof TypeError&&e(new X("nbunch is not a node or a sequence of nodes")),e(a)}};return d}(a,this.adj):M(this.adj)};Z.prototype.nbunch_iter=Z.prototype.e;s("jsnx.nodes",function(a){return a.Q()});s("jsnx.nodes_iter",function(a){return a.J()});s("jsnx.edges",function(a,b){return a.s(b)});s("jsnx.edges_iter",function(a,b){return a.g(b)});s("jsnx.degree",function(a,b,c){return a.j(b,c)});s("jsnx.neighbors",function(a,b){return a.n(b)});s("jsnx.number_of_nodes",function(a){return a.o()});s("jsnx.number_of_edges",function(a){return a.t()});s("jsnx.density",function(a){var b=a.o(),c=a.t();return 0===c?0:a.h()?c/(b*(b-1)):2*c/(b*(b-1))});
s("jsnx.degree_histogram",function(a){var a=F(a.j()),b=Math.max.apply(Math,a)+1,c=ka(b);w(a,function(a){c[a]+=1});return c});s("jsnx.is_directed",function(a){return a.h()});s("jsnx.freeze",function(a){function b(){e(new X("Frozen graph can't be modified"))}a.q=b;a.d=b;a.w=b;a.z=b;a.p=b;a.a=b;a.u=b;a.v=b;a.clear=b;a.ba=!0;return a});s("jsnx.is_frozen",function(a){return!!a.ba});s("jsnx.subgraph",function(a,b){return a.A(b)});
s("jsnx.create_empty_copy",function(a,b){n(b)||(b=!0);var c=new a.constructor;b&&c.d(a);return c});
s("jsnx.info",function(a,b){var c="";if(o(b))a.k(b)||e(new X("node "+b+" not in graph")),c=c+("Node "+b+" has the following properties:\n")+("Degree: "+a.j(b)+"\n"),c+="Neighbors: "+a.n(b).join(" ");else{var c=c+("Name: "+a.name()+"\n"),c=c+("Type: "+a.constructor.__name__+"\n"),c=c+("Number of nodes: "+a.o()+"\n"),c=c+("Number of edges: "+a.t()+"\n"),d=a.o();if(0<d)if(a.h())c+="Average in degree: "+(Ma.apply(j,F(a.O()))/d).toFixed(4)+"\n",c+="Average out degree: "+(Ma.apply(j,F(a.R()))/d).toFixed(4);
else var f=Ma.apply(j,F(a.j())),c=c+("Average degree: "+(f/d).toFixed())}return c});s("jsnx.set_node_attributes",function(a,b,c){D(c,function(c,f){a.I[f][b]=c})});function Na(a,b){var c={};D(a.I,function(a,f){b in a&&(c[f]=a[b])});return c}s("jsnx.get_node_attributes",Na);s("jsnx.set_edge_attributes",function(a,b,c){D(c,function(b,c){c=c.split(",");a.N(c[0])[c[1]]=b})});Na=function(a,b){var c={};D(a.s(!0),function(a){b in a[2]&&(c[[a[0],a[1]]]=a[2][b])});return c};s("jsnx.get_edge_attributes",{}.sa);function $(a,b){if(!(this instanceof $))return new $(a,b);this.graph={};this.node={};this.adj={};this.pred={};this.succ=this.adj;o(a)&&Ia(a,this);L(this.graph,b||{});this.edge=this.adj}s("jsnx.classes.DiGraph",$);s("jsnx.DiGraph",$);u($,Z);$.__name__="DiGraph";$.prototype.q=function(a,b){o(b)||(b={});"object"!==m(b)&&e(new X("The attr_dict argument must be an object."));a in this.succ?L(this.node[a],b):(this.succ[a]={},this.pred[a]={},this.node[a]=b)};$.prototype.add_node=$.prototype.q;
$.prototype.d=function(a,b){var c,d,f,h,i,b=b||{};O(M(a),function(a){c=!(a in this.succ);p(a)?(d=a[0],f=a[1],d in this.succ?(i=this.node[d],L(i,b,f)):(this.succ[d]={},this.pred[d]={},h=K(b),L(h,f),this.node[d]=h)):c?(this.succ[a]={},this.pred[a]={},this.node[a]=K(b)):L(this.node[a],b)},this)};$.prototype.add_nodes_from=$.prototype.d;
$.prototype.w=function(a){a in this.node||e(new X("The node "+a+" is not in the graph"));var b=this.succ[a];I(this.node,a);D(b,function(b,d){I(this.pred[d],a)},this);I(this.succ,a);D(this.pred[a],function(b,d){I(this.succ[d],a)},this);I(this.pred,a)};$.prototype.remove_node=$.prototype.w;
$.prototype.z=function(a){var b;O(a,function(a){a in this.succ&&(b=this.succ[a],I(this.node,a),D(b,function(b,f){I(this.pred[f],a)},this),I(this.succ,a),D(this.pred[a],function(b,f){I(this.succ[f],a)},this),I(this.pred,a))},this)};$.prototype.remove_nodes_from=$.prototype.z;
$.prototype.p=function(a,b,c){c=c||{};"object"!==m(c)&&e(new X("The attr_dict argument must be an object."));a in this.succ||(this.succ[a]={},this.pred[a]={},this.node[a]={});b in this.succ||(this.succ[b]={},this.pred[b]={},this.node[b]={});var d=J(this.adj[a],b,{});L(d,c);this.succ[a][b]=d;this.pred[b][a]=d};$.prototype.add_edge=$.prototype.p;
$.prototype.a=function(a,b){b=b||{};"object"!==m(b)&&e(new X("The attr_dict argument must be an object."));O(a,function(a){var d=ua(a),f,h,i;3===d?(f=a[0],h=a[1],i=a[2]):2===d?(f=a[0],h=a[1],i={}):e(new X("Edge tuple "+a.toString()+" must be a 2-tuple or 3-tuple."));f in this.succ||(this.succ[f]={},this.pred[f]={},this.node[f]={});h in this.succ||(this.succ[h]={},this.pred[h]={},this.node[h]={});a=J(this.adj[f],h,{});L(a,b,i);this.succ[f][h]=a;this.pred[h][f]=a},this)};
$.prototype.add_edges_from=$.prototype.a;$.prototype.u=function(a,b){try{I(this.succ[a],b),I(this.pred[b],a)}catch(c){c instanceof TypeError&&e(new X("The edge "+a+"-"+b+" is not in the graph")),e(c)}};$.prototype.remove_edge=$.prototype.u;$.prototype.v=function(a){O(a,function(a){var c=a[0],a=a[1];c in this.succ&&a in this.succ[c]&&(I(this.succ[c],a),I(this.pred[a],c))},this)};$.prototype.remove_edges_from=$.prototype.v;$.prototype.ga=function(a,b){return a in this.succ&&b in this.succ[a]};
$.prototype.has_successor=$.prototype.ga;$.prototype.fa=function(a,b){return a in this.pred&&b in this.pred[a]};$.prototype.has_predecessor=$.prototype.fa;$.prototype.U=function(a){a in this.succ||e(new X("The node "+a+" is not in the digraph."));return M(this.succ[a])};$.prototype.successors_iter=$.prototype.U;$.prototype.oa=function(a){a in this.pred||e(new X("The node "+a+" is not in the digraph."));return M(this.pred[a])};$.prototype.predecessors_iter=$.prototype.oa;
$.prototype.T=function(a){a in this.succ||e(new X("The node "+a+" is not in the digraph."));return Q(this.succ[a])};$.prototype.successors=$.prototype.T;$.prototype.na=function(a){a in this.succ||e(new X("The node "+a+" is not in the digraph."));return Q(this.pred[a])};$.prototype.predecessors=$.prototype.na;$.prototype.n=$.prototype.T;$.prototype.neighbors=$.prototype.n;$.prototype.H=$.prototype.U;$.prototype.neighbors_iter=$.prototype.H;
$.prototype.g=function(a,b){ca(a)&&(b=a,a=j);var c,d,f;c=o?P(this.e(a),function(a){return[a,this.adj[a]]},this):R(this.adj);return b?U(c,function(a){d=a[0];f=a[1];return T(f)},function(a){return[d,a[0],a[1]]}):U(c,function(a){d=a[0];f=a[1];return T(f)},function(a){return[d,a[0]]})};$.prototype.edges_iter=$.prototype.g;$.prototype.ma=$.prototype.g;$.prototype.out_edges_iter=$.prototype.ma;$.prototype.la=Z.prototype.s;$.prototype.out_edges=$.prototype.la;
$.prototype.P=function(a,b){ca(a)&&(b=a,a=j);var c,d,f;c=o?P(this.e(a),function(a){return[a,this.pred[a]]},this):R(this.pred);return b?U(c,function(a){d=a[0];f=a[1];return T(f)},function(a){return[a[0],d,a[1]]}):U(c,function(a){d=a[0];f=a[1];return T(f)},function(a){return[a[0],d]})};$.prototype.in_edges_iter=$.prototype.P;$.prototype.ha=function(a,b){return Q(this.P(a,b))};$.prototype.in_edges=$.prototype.ha;
$.prototype.l=function(a,b){var c;c=o(a)?wa(P(this.e(a),function(a){return[a,this.succ[a]]},this),P(this.e(a),function(a){return[a,this.pred[a]]},this)):wa(T(this.succ),T(this.pred));return b?P(c,function(a){var c=a[0][1],h=a[1][1],i=0,t;for(t in c)i+=+J(c[t],b,1);for(t in h)i+=+J(h[t],b,1);return[a[0][0],i]}):P(c,function(a){return[a[0][0],ua(a[0][1])+ua(a[1][1])]})};$.prototype.degree_iter=$.prototype.l;
$.prototype.F=function(a,b){var c;c=o(a)?P(this.e(a),function(a){return[a,this.pred[a]]},this):T(this.pred);return b?P(c,function(a){var c=0,h=a[1],i;for(i in h)c+=+J(h[i],b,1);return[a[0],c]}):P(c,function(a){return[a[0],E(a[1])]})};$.prototype.in_degree_iter=$.prototype.F;$.prototype.K=function(a,b){var c;c=o(a)?P(this.e(a),function(a){return[a,this.succ[a]]},this):T(this.succ);return b?P(c,function(a){var c=0,h=a[1],i;for(i in h)c+=+J(h[i],b,1);return[a[0],c]}):P(c,function(a){return[a[0],E(a[1])]})};
$.prototype.out_degree_iter=$.prototype.K;$.prototype.O=function(a,b){return this.k(a)?this.F(a,b).next()[1]:ta(this.F(a,b))};$.prototype.in_degree=$.prototype.O;$.prototype.R=function(a,b){return this.k(a)?this.K(a,b).next()[1]:ta(this.K(a,b))};$.prototype.out_degree=$.prototype.R;$.prototype.clear=function(){H(this.succ);H(this.pred);H(this.node);H(this.graph)};$.prototype.clear=$.prototype.clear;$.prototype.G=aa(k);$.prototype.is_multigraph=$.prototype.G;$.prototype.h=aa(!0);
$.prototype.is_directed=$.prototype.h;$.prototype.L=function(){return xa(this)};$.prototype.to_directed=$.prototype.L;$.prototype.M=function(a){var b=new Z;b.name(this.name());b.d(this);var c=this.pred,d;a?b.a(U(this.i(),function(a){d=a[0];return T(a[1])},function(a){if(a[0]in c[d])return[d,a[0],V(a[1])]})):b.a(U(this.i(),function(a){d=a[0];return T(a[1])},function(a){return[d,a[0],V(a[1])]}));b.graph=V(this.graph);b.node=V(this.node);return b};$.prototype.to_undirected=$.prototype.M;
$.prototype.reverse=function(a){(a=!n(a)||a)?(a=new this.constructor(j,{name:"Reverse of ("+this.name()+")"}),a.d(this),a.a(P(this.g(!0),function(a){return[a[1],a[0],V(a[2])]})),a.graph=V(this.graph),a.node=V(this.node)):(a=this.succ,this.succ=this.pred,this.pred=a,this.adj=this.succ,a=this);return a};$.prototype.reverse=$.prototype.reverse;
$.prototype.A=function(a){var a=this.e(a),b=new this.constructor,c=b.succ,d=b.pred,f=this.succ;O(a,function(a){c[a]={};d[a]={}});O(c,function(a){var b=c[a];D(f[a],function(f,S){S in c&&(b[S]=f,d[S][a]=f)})});O(b,function(a){b.node[a]=this.node[a]},this);b.graph=this.graph;return b};$.prototype.subgraph=$.prototype.A;}());