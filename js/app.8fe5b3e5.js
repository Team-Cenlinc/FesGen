(function(t){function e(e){for(var a,s,o=e[0],l=e[1],f=e[2],u=0,c=[];u<o.length;u++)s=o[u],Object.prototype.hasOwnProperty.call(i,s)&&i[s]&&c.push(i[s][0]),i[s]=0;for(a in l)Object.prototype.hasOwnProperty.call(l,a)&&(t[a]=l[a]);d&&d(e);while(c.length)c.shift()();return r.push.apply(r,f||[]),n()}function n(){for(var t,e=0;e<r.length;e++){for(var n=r[e],a=!0,o=1;o<n.length;o++){var l=n[o];0!==i[l]&&(a=!1)}a&&(r.splice(e--,1),t=s(s.s=n[0]))}return t}var a={},i={app:0},r=[];function s(e){if(a[e])return a[e].exports;var n=a[e]={i:e,l:!1,exports:{}};return t[e].call(n.exports,n,n.exports,s),n.l=!0,n.exports}s.m=t,s.c=a,s.d=function(t,e,n){s.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:n})},s.r=function(t){"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},s.t=function(t,e){if(1&e&&(t=s(t)),8&e)return t;if(4&e&&"object"===typeof t&&t&&t.__esModule)return t;var n=Object.create(null);if(s.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var a in t)s.d(n,a,function(e){return t[e]}.bind(null,a));return n},s.n=function(t){var e=t&&t.__esModule?function(){return t["default"]}:function(){return t};return s.d(e,"a",e),e},s.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},s.p="/FesGen/";var o=window["webpackJsonp"]=window["webpackJsonp"]||[],l=o.push.bind(o);o.push=e,o=o.slice();for(var f=0;f<o.length;f++)e(o[f]);var d=l;r.push([0,"chunk-vendors"]),n()})({0:function(t,e,n){t.exports=n("56d7")},"01c7":function(t,e,n){},"150b":function(t,e,n){},"18b0":function(t,e,n){},3004:function(t,e,n){"use strict";n("b70e")},"56d7":function(t,e,n){"use strict";n.r(e);n("e260"),n("e6cf"),n("cca6"),n("a79d");var a=n("2b0e"),i=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",{attrs:{id:"app"}},[n("HeaderFlex",{attrs:{title:t.titles}}),n("Signs",{attrs:{signStyles:t.signStyle}}),n("h3",[t._v("Data from editor.vue -> App.vue:")]),n("p",[t._v(t._s(t.signStyle||"你尚未选择")+" ")]),n("Editor",{on:{someChanged:t.updateData}}),n("FooterFlex",{attrs:{title:t.titles}})],1)},r=[],s=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("header",[n("div",{staticClass:"header-flex"},[n("h1",[n("small",[n("a",{staticClass:"header-nav-home",attrs:{href:"/"}},[t._v(t._s(t.title))])])]),t._m(0)])])},o=[function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("span",[n("a",{staticClass:"header-nav",attrs:{href:"/"}},[t._v("About")]),n("a",{staticClass:"header-nav",attrs:{href:"/"}},[t._v("Help")]),n("a",{staticClass:"header-nav",attrs:{href:"https://www.fetarute.net/wiki/index.php/FesGen"}},[t._v("Wiki")])])}],l={name:"header",props:["title"]},f=l,d=(n("3004"),n("2877")),u=Object(d["a"])(f,s,o,!1,null,null,null),c=u.exports,p=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("footer",[n("div",{staticClass:"footer-flex"},[n("div",{attrs:{id:"footer-description"}},[n("p",[t._v(" "+t._s(t.title)+" - Beta"),n("br"),t._v(" 是由 Cenlinc Studio 开发的导视牌生成器。")])]),t._m(0)])])},g=[function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",[n("span",[t._v(" Powered by Fetarute Community"),n("br"),t._v(" © 2022 Team Cenlinc ")])])}],v={name:"footer",props:["title"]},h=v,m=(n("9768"),Object(d["a"])(h,p,g,!1,null,"35511138",null)),C=m.exports,y=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",{attrs:{id:"canvas"}},[n(t.signStyles,{ref:"svg",tag:"component"}),n("h3",[t._v("Data from editor.vue -> App.vue -> sign.vue :")]),n("p",[t._v(t._s(t.signStyles||"你尚未选择"))]),n("input",{directives:[{name:"model",rawName:"v-model.lazy",value:t.ekiName,expression:"ekiName",modifiers:{lazy:!0}}],attrs:{type:"text",value:"EkiName"},domProps:{value:t.ekiName},on:{change:[function(e){t.ekiName=e.target.value},t.svgChangeTest]}}),n("p",[t._v("Data above is entered in sign.vue. And the next step is to modify the offset and pass the data from editor.vue to svg")]),n("hr")],1)},x=[],w=n("e66e"),_=n.n(w),k=n("a399"),b=n.n(k);window.componentsConfig={"kitajuku-dentetsu":"../assets/signs/kitajuku-dentetsu.svg","test-sign":"../assets/signs/test-sign.svg",test3:"./test3.vue",test4:"./test4.vue"};var S={name:"Sign",components:{KitajukuDentetsu:_.a,TestSign:b.a},methods:{svgChangeTest:function(){var t=this.$refs.svg.querySelector("#MID-kanji-text");t.innerHTML=this.ekiName}},data:function(){return{ekiName:"EkiNameHere"}},props:{signStyles:String}},L=S,E=(n("dd48"),Object(d["a"])(L,y,x,!1,null,"3ffa7343",null)),F=E.exports,M=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",{staticClass:"form",attrs:{id:"editor"}},[n("div",{staticClass:"row"},[n("div",[n("h2",[t._v("整体调整")]),n("div",{staticClass:"form-min-row"},[n("p",[t._v("站牌样式")]),n("select",{directives:[{name:"model",rawName:"v-model",value:t.signStyle,expression:"signStyle"}],on:{change:[function(e){var n=Array.prototype.filter.call(e.target.options,(function(t){return t.selected})).map((function(t){var e="_value"in t?t._value:t.value;return e}));t.signStyle=e.target.multiple?n:n[0]},t.sendData]}},[n("option",{attrs:{disabled:"",value:""}},[t._v("请选择")]),n("option",{attrs:{value:"test-sign"}},[t._v("测试用")]),n("option",{attrs:{value:"kitajuku-dentetsu"}},[t._v("北宿电铁")])])]),n("div",{staticClass:"form-min-row"},[n("p",[t._v("灯光效果")]),n("select",{on:{change:t.sendData}},[n("option",{attrs:{value:"none"}},[t._v("无")]),n("option",{attrs:{value:"fluore"}},[t._v("荧光灯")]),n("option",{attrs:{value:"led"}},[t._v("LED")])])])]),t._m(0)]),t._m(1)])},P=[function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",[n("h2",[t._v("站牌大小")]),n("div",{staticClass:"form-min-row"},[n("p",[t._v("宽度")]),n("div",[n("input",{attrs:{type:"number",value:"2160"}}),t._v(" px")])]),n("div",{staticClass:"form-min-row"},[n("p",[t._v("高度")]),n("div",[n("input",{attrs:{type:"number",value:"720"}}),t._v(" px")])])])},function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",{staticClass:"row"},[n("div",[n("h2",[t._v("站名")]),n("div",{staticClass:"form-min-row"},[n("p",[t._v("站名 中文")]),n("input",{attrs:{"data-bind":"staNameChinese",type:"text"}})]),n("div",{staticClass:"form-min-row"},[n("p",[t._v("站名 英语")]),n("input",{attrs:{"data-bind":"staNameEnglish",type:"text"}})]),n("div",{staticClass:"form-min-row"},[n("p",[t._v("站名 假名")]),n("input",{attrs:{"data-bind":"staNameKana",type:"text"}})]),n("div",{staticClass:"form-min-row"},[n("p",[t._v("站名 上浦语")]),n("input",{attrs:{"data-bind":"staNameSyapolenus",type:"text"}})])])])}],j={name:"editor",data:function(){return{signStyle:""}},methods:{sendData:function(){this.$emit("someChanged",this.signStyle)}}},D=j,O=(n("f4e0"),Object(d["a"])(D,M,P,!1,null,"174e7788",null)),A=O.exports,N={name:"App",components:{HeaderFlex:c,FooterFlex:C,Signs:F,Editor:A},data:function(){return{titles:"FesGen"}},props:{signStyle:String},methods:{updateData:function(t){this.signStyle=t,console.log(this.signStyle)}}},z=N,$=(n("944b"),Object(d["a"])(z,i,r,!1,null,"c9787af6",null)),T=$.exports;n("150b");a["a"].config.productionTip=!1,new a["a"]({render:function(t){return t(T)}}).$mount("#app")},"7f75":function(t,e,n){},"944b":function(t,e,n){"use strict";n("96e9")},"96e9":function(t,e,n){},9768:function(t,e,n){"use strict";n("7f75")},a399:function(t,e){t.exports={functional:!0,render(t,e){const{_c:n,_v:a,data:i,children:r=[]}=e,{class:s,staticClass:o,style:l,staticStyle:f,attrs:d={},...u}=i;return n("svg",{class:[s,o],style:[l,f],attrs:Object.assign({width:"620px",height:"220px",viewBox:"0 0 620 220",version:"1.1",xmlns:"http://www.w3.org/2000/svg","xmlns:xlink":"http://www.w3.org/1999/xlink"},d),...u},r.concat([n("rect",{attrs:{id:"background",stroke:"#4D4D4D","stroke-width":"2",fill:"#ECECEC",x:"1",y:"1",width:"598",height:"198"}}),n("text",{attrs:{id:"MID-kanji","font-family":".PingFangSC-Regular, .PingFang SC","font-size":"62.208","font-weight":"normal",fill:"#383838"}},[n("tspan",{attrs:{id:"MID-kanji-text",x:"156",y:"100"}},[a("海浜宿海")])]),n("line",{attrs:{x1:"2",y1:"177.846485",x2:"598.003562",y2:"177.846485",id:"line",stroke:"#7297DD","stroke-width":"15"}})]))}}},b70e:function(t,e,n){},dd48:function(t,e,n){"use strict";n("18b0")},e66e:function(t,e){t.exports={functional:!0,render(t,e){const{_c:n,_v:a,data:i,children:r=[]}=e,{class:s,staticClass:o,style:l,staticStyle:f,attrs:d={},...u}=i;return n("svg",{class:[s,o],style:[l,f],attrs:Object.assign({width:"620px",height:"220px",viewBox:"0 0 620 220",version:"1.1",xmlns:"http://www.w3.org/2000/svg","xmlns:xlink":"http://www.w3.org/1999/xlink"},d),...u},r.concat([n("title",[a("EX")]),n("defs",[n("filter",{attrs:{x:"-2.2%",y:"-6.8%",width:"104.5%",height:"113.5%",filterUnits:"objectBoundingBox",id:"filter-1"}},[n("feOffset",{attrs:{dx:"3",dy:"3",in:"SourceAlpha",result:"shadowOffsetOuter1"}}),n("feGaussianBlur",{attrs:{stdDeviation:"2",in:"shadowOffsetOuter1",result:"shadowBlurOuter1"}}),n("feColorMatrix",{attrs:{values:"0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.5 0",type:"matrix",in:"shadowBlurOuter1",result:"shadowMatrixOuter1"}}),n("feMerge",[n("feMergeNode",{attrs:{in:"shadowMatrixOuter1"}}),n("feMergeNode",{attrs:{in:"SourceGraphic"}})])])]),n("g",{attrs:{id:"页面-1",stroke:"none","stroke-width":"1",fill:"none","fill-rule":"evenodd"}},[n("g",{attrs:{id:"EX",filter:"url(#filter-1)",transform:"translate(10.000000, 10.000000)"}},[n("rect",{attrs:{id:"background",stroke:"#4D4D4D","stroke-width":"2",fill:"#ECECEC",x:"1",y:"1",width:"598",height:"198"}}),n("g",{attrs:{id:"Main",transform:"translate(70.000000, 14.000000)",fill:"#383838","font-weight":"normal"}},[n("g",{attrs:{id:"编组-9"}},[n("text",{attrs:{id:"MID-eng","font-family":"Helvetica","font-size":"23.328"}},[n("tspan",{attrs:{x:"291",y:"62"}},[a("Kaihin-Shukukai")])]),n("text",{attrs:{id:"MID-kana","font-family":".PingFangSC-Regular, .PingFang SC","font-size":"20.736"}},[n("tspan",{attrs:{x:"273",y:"31"}},[a("かいひんしゅくかい")])]),n("text",{attrs:{id:"MID-kanji","font-family":".PingFangSC-Regular, .PingFang SC","font-size":"62.208"}},[n("tspan",{attrs:{id:"MID-kanji-text",x:"0",y:"60"}},[a("海浜宿海")])])])]),n("line",{attrs:{x1:"2",y1:"177.846485",x2:"598.003562",y2:"177.846485",id:"line",stroke:"#7297DD","stroke-width":"15"}}),n("g",{attrs:{id:"Right",transform:"translate(472.000000, 120.000000)"}},[n("text",{attrs:{id:"Right-kanji","font-family":".PingFangSC-Regular, .PingFang SC","font-size":"24.8832","font-weight":"normal",fill:"#737373"}},[n("tspan",{attrs:{x:"0",y:"24"}},[a("北宿")])]),n("g",{attrs:{id:"icon",transform:"translate(53.100000, 3.800000)"}},[n("path",{attrs:{d:"M5.508,2.052 L5.508,20.484 L2.88,20.484 C2.24376797,20.484 1.66776797,20.226116 1.25082598,19.809174 C0.833883984,19.392232 0.576,18.816232 0.576,18.18 L0.576,18.18 L0.576,4.356 C0.576,3.71976797 0.833883984,3.14376797 1.25082598,2.72682598 C1.66776797,2.30988398 2.24376797,2.052 2.88,2.052 L2.88,2.052 L5.508,2.052 Z",id:"rec1",stroke:"#7A7A7A","stroke-width":"1.152",fill:"#7A7A7A"}}),n("path",{attrs:{d:"M30.852,2.276 C31.4263761,2.276 31.9463761,2.50881193 32.3227821,2.8852179 C32.6991881,3.26162386 32.932,3.78162386 32.932,4.356 L32.932,4.356 L32.932,18.18 C32.932,18.7543761 32.6991881,19.2743761 32.3227821,19.6507821 C31.9463761,20.0271881 31.4263761,20.26 30.852,20.26 L30.852,20.26 L5.732,20.26 L5.732,2.276 Z",id:"rec2",stroke:"#7A7A7A","stroke-width":"1.6"}}),n("text",{attrs:{id:"number","font-family":"PingFangSC-Medium, PingFang SC","font-size":"14.92992","font-weight":"400",fill:"#7A7A7A"}},[n("tspan",{attrs:{x:"10.116",y:"16"}},[a("02")])])]),n("path",{attrs:{d:"M44.4403628,56.6376551 C46.6495018,56.6376551 48.0481869,54.6838124 49.4403628,52.6376551 C50.147638,51.598134 50.0067802,50.7516832 51.2432808,49.752862 C51.6064123,49.4595314 52.234694,49.3128661 53.128126,49.3128661 L56.5755452,49.3128661 C49.3722921,46.437622 45.2699895,45 44.2686375,45 C43.3037763,45 39.2142305,46.437622 32,49.3128661 L35.5930172,49.3128661 C36.0291578,49.3264432 36.4428059,49.4295662 36.8339617,49.622235 C37.8503086,50.12285 38.870861,52.2054812 39.0504228,52.4841404 C40.3787559,54.5455602 42.2312238,56.6376551 44.4403628,56.6376551 Z",id:"epli",fill:"#ECECEC"}}),n("text",{attrs:{id:"Right-eng","font-family":"Helvetica","font-size":"18.6624","font-weight":"normal",fill:"#6C6C6C"}},[n("tspan",{attrs:{x:"7",y:"44"}},[a("Hokuriku")])])]),n("g",{attrs:{id:"Left",transform:"translate(29.000000, 121.000000)"}},[n("text",{attrs:{id:"LEFT-kanji","font-family":".PingFangSC-Regular, .PingFang SC","font-size":"24.8832","font-weight":"normal",fill:"#383838"}},[n("tspan",{attrs:{x:"0",y:"24"}},[a("錦岡")]),n("tspan",{attrs:{x:"50.4133632",y:"24","font-family":".AppleSystemUIFont"}})]),n("g",{attrs:{id:"icon",transform:"translate(55.000000, 4.000000)"}},[n("path",{attrs:{d:"M5.508,2.052 L5.508,20.484 L2.88,20.484 C2.24376797,20.484 1.66776797,20.226116 1.25082598,19.809174 C0.833883984,19.392232 0.576,18.816232 0.576,18.18 L0.576,18.18 L0.576,4.356 C0.576,3.71976797 0.833883984,3.14376797 1.25082598,2.72682598 C1.66776797,2.30988398 2.24376797,2.052 2.88,2.052 L2.88,2.052 L5.508,2.052 Z",id:"rec1",stroke:"#565656","stroke-width":"1.152",fill:"#565656"}}),n("path",{attrs:{d:"M30.852,2.276 C31.4263761,2.276 31.9463761,2.50881193 32.3227821,2.8852179 C32.6991881,3.26162386 32.932,3.78162386 32.932,4.356 L32.932,4.356 L32.932,18.18 C32.932,18.7543761 32.6991881,19.2743761 32.3227821,19.6507821 C31.9463761,20.0271881 31.4263761,20.26 30.852,20.26 L30.852,20.26 L5.732,20.26 L5.732,2.276 Z",id:"rec2",stroke:"#565656","stroke-width":"1.6"}}),n("text",{attrs:{id:"number","font-family":"PingFangSC-Medium, PingFang SC","font-size":"14.92992","font-weight":"400",fill:"#565656"}},[n("tspan",{attrs:{x:"10.116",y:"16"}},[a("04")])])]),n("path",{attrs:{d:"M45.3406106,56.6376551 C47.5497496,56.6376551 48.9484347,54.6838124 50.3406106,52.6376551 C51.0478858,51.598134 50.9070279,50.7516832 52.1435285,49.752862 C52.50666,49.4595314 53.1349418,49.3128661 54.0283738,49.3128661 L57.475793,49.3128661 C50.2725399,46.437622 46.1702373,45 45.1688852,45 C44.2040241,45 40.1144782,46.437622 32.9002478,49.3128661 L36.493265,49.3128661 C36.9294055,49.3264432 37.3430537,49.4295662 37.7342095,49.622235 C38.7505564,50.12285 39.7711088,52.2054812 39.9506706,52.4841404 C41.2790036,54.5455602 43.1314716,56.6376551 45.3406106,56.6376551 Z",id:"epli",fill:"#ECECEC"}}),n("text",{attrs:{id:"Left-eng","font-family":"Helvetica-Light, Helvetica","font-size":"18.6624","font-weight":"300",fill:"#383838"}},[n("tspan",{attrs:{x:"1",y:"43"}},[a("Nishikioka")])])]),n("g",{attrs:{id:"Middle",transform:"translate(235.000000, 100.000000)"}},[n("g",{attrs:{id:"icon",transform:"translate(43.000000, 31.000000)"}},[n("path",{attrs:{d:"M39.2144,2.08 C39.9659491,2.08 40.6463491,2.38462546 41.1388618,2.87713818 C41.6313745,3.36965091 41.936,4.05005091 41.936,4.8016 L41.936,4.8016 L41.936,23.04928 C41.936,23.8008291 41.6313745,24.4812291 41.1388618,24.9737418 C40.6463491,25.4662545 39.9659491,25.77088 39.2144,25.77088 L39.2144,25.77088 L8.8016,25.77088 C8.05005091,25.77088 7.36965091,25.4662545 6.87713818,24.9737418 C6.38462546,24.4812291 6.08,23.8008291 6.08,23.04928 L6.08,23.04928 L6.08,4.8016 C6.08,4.05005091 6.38462546,3.36965091 6.87713818,2.87713818 C7.36965091,2.38462546 8.05005091,2.08 8.8016,2.08 L8.8016,2.08 Z",id:"rec2",stroke:"#565656","stroke-width":"2.16"}}),n("text",{attrs:{id:"number","font-family":"PingFangSC-Medium, PingFang SC","font-size":"19.7074944","font-weight":"400",fill:"#565656"}},[n("tspan",{attrs:{x:"12.17312",y:"21"}},[a("03")])]),n("path",{attrs:{d:"M7.77,2.08 L7.77,25.77 L2.8740096,25.77 C2.37860753,25.77 1.93010513,25.5691986 1.60545325,25.2445468 C1.28080136,24.9198949 1.08,24.4713925 1.08,23.9759904 L1.08,23.9759904 L1.08,3.8740096 C1.08,3.37860753 1.28080136,2.93010513 1.60545325,2.60545325 C1.93010513,2.28080136 2.37860753,2.08 2.8740096,2.08 L2.8740096,2.08 L7.77,2.08 Z",id:"rec1",stroke:"#565656","stroke-width":"2.16",fill:"#565656"}})]),n("g",{attrs:{id:"line-icon",transform:"translate(0.000000, 2.000000)"}},[n("rect",{attrs:{id:"rec",stroke:"#565656","stroke-width":"1.14960384",fill:"#565656",x:"0.57480192",y:"1.14960384",width:"18.3936614",height:"18.3936614",rx:"2.8740096"}}),n("text",{attrs:{id:"line-abbr","font-family":"PingFangSC-Regular, PingFang SC","font-size":"14.8988658","font-weight":"normal",fill:"#ECECEC"}},[n("tspan",{attrs:{x:"5.17321728",y:"16"}},[a("T")])])]),n("path",{attrs:{d:"M65.4403628,77.6376551 C67.6495018,77.6376551 69.0481869,75.6838124 70.4403628,73.6376551 C71.147638,72.598134 71.0067802,71.7516832 72.2432808,70.752862 C72.6064123,70.4595314 73.234694,70.3128661 74.128126,70.3128661 L77.5755452,70.3128661 C70.3722921,67.437622 66.2699895,66 65.2686375,66 C64.3037763,66 60.2142305,67.437622 53,70.3128661 L56.5930172,70.3128661 C57.0291578,70.3264432 57.4428059,70.4295662 57.8339617,70.622235 C58.8503086,71.12285 59.870861,73.2054812 60.0504228,73.4841404 C61.3787559,75.5455602 63.2312238,77.6376551 65.4403628,77.6376551 Z",id:"epli",fill:"#ECECEC"}}),n("text",{attrs:{id:"line-name","font-family":".PingFangSC-Regular, .PingFang SC","font-size":"21","font-weight":"normal",fill:"#383838"}},[n("tspan",{attrs:{x:"25",y:"20"}},[a("東海岸本線")])])]),n("polygon",{attrs:{id:"Toward",fill:"#565656",points:"38.0841482 86 42.9975182 86 33.901557 95.9466813 54.9221016 95.9466813 54.9221016 99.8063645 33.901557 99.8063645 42.9975182 110 38.0841482 110 27.4197153 98"}})])])]))}}},f4e0:function(t,e,n){"use strict";n("01c7")}});
//# sourceMappingURL=app.8fe5b3e5.js.map