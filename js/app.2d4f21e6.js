(function(t){function e(e){for(var i,r,o=e[0],l=e[1],u=e[2],g=0,f=[];g<o.length;g++)r=o[g],Object.prototype.hasOwnProperty.call(a,r)&&a[r]&&f.push(a[r][0]),a[r]=0;for(i in l)Object.prototype.hasOwnProperty.call(l,i)&&(t[i]=l[i]);d&&d(e);while(f.length)f.shift()();return s.push.apply(s,u||[]),n()}function n(){for(var t,e=0;e<s.length;e++){for(var n=s[e],i=!0,o=1;o<n.length;o++){var l=n[o];0!==a[l]&&(i=!1)}i&&(s.splice(e--,1),t=r(r.s=n[0]))}return t}var i={},a={app:0},s=[];function r(e){if(i[e])return i[e].exports;var n=i[e]={i:e,l:!1,exports:{}};return t[e].call(n.exports,n,n.exports,r),n.l=!0,n.exports}r.m=t,r.c=i,r.d=function(t,e,n){r.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:n})},r.r=function(t){"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},r.t=function(t,e){if(1&e&&(t=r(t)),8&e)return t;if(4&e&&"object"===typeof t&&t&&t.__esModule)return t;var n=Object.create(null);if(r.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var i in t)r.d(n,i,function(e){return t[e]}.bind(null,i));return n},r.n=function(t){var e=t&&t.__esModule?function(){return t["default"]}:function(){return t};return r.d(e,"a",e),e},r.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},r.p="/FesGen/";var o=window["webpackJsonp"]=window["webpackJsonp"]||[],l=o.push.bind(o);o.push=e,o=o.slice();for(var u=0;u<o.length;u++)e(o[u]);var d=l;s.push([0,"chunk-vendors"]),n()})({0:function(t,e,n){t.exports=n("56d7")},"150b":function(t,e,n){},3004:function(t,e,n){"use strict";n("b70e")},"408d":function(t,e,n){},"56d7":function(t,e,n){"use strict";n.r(e);n("e260"),n("e6cf"),n("cca6"),n("a79d");var i=n("2b0e"),a=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",{attrs:{id:"app"}},[n("HeaderFlex",{attrs:{title:t.titles}}),n("Signs",{ref:"signs"}),n("h3",[t._v("Data from editor.vue -> App.vue:")]),n("Editor",{on:{someChanged:t.UpdateData,signChanged:t.UpdateSignStyle}}),n("FooterFlex",{attrs:{title:t.titles}})],1)},s=[],r=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("header",[n("div",{staticClass:"header-flex"},[n("h1",[n("small",[n("a",{staticClass:"header-nav-home",attrs:{href:"/"}},[t._v(t._s(t.title))])])]),t._m(0)])])},o=[function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("span",[n("a",{staticClass:"header-nav",attrs:{href:"/"}},[t._v("About")]),n("a",{staticClass:"header-nav",attrs:{href:"/"}},[t._v("Help")]),n("a",{staticClass:"header-nav",attrs:{href:"https://www.fetarute.net/wiki/index.php/FesGen"}},[t._v("Wiki")])])}],l={name:"header",props:["title"]},u=l,d=(n("3004"),n("2877")),g=Object(d["a"])(u,r,o,!1,null,null,null),f=g.exports,m=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("footer",[n("div",{staticClass:"footer-flex"},[n("div",{attrs:{id:"footer-description"}},[n("p",[t._v(" "+t._s(t.title)+" - Beta"),n("br"),t._v(" 是由 Cenlinc Studio 开发的导视牌生成器。")])]),t._m(0)])])},p=[function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",[n("span",[t._v(" Powered by Fetarute Community"),n("br"),t._v(" © 2022 Team Cenlinc ")])])}],c={name:"footer",props:["title"]},h=c,v=(n("9768"),Object(d["a"])(h,m,p,!1,null,"35511138",null)),C=v.exports,S=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",{attrs:{id:"canvas"}},[n("keep-alive",[n(this.signStyle,{ref:"svg",tag:"component"})],1),n("h3",[t._v("Data from editor.vue -> App.vue -> sign.vue :")]),n("div",{staticClass:"data"},[n("p",[t._v(t._s(this.signStyle||"你尚未选择"))])]),n("div",{staticClass:"data"},[n("p",[t._v(t._s(this.signInfo||"NO"))])]),n("hr")],1)},w=[],y=(n("a9e3"),n("e66e")),x=n.n(y),N=n("a399"),b=n.n(N);window.componentsConfig={"kitajuku-dentetsu":"../assets/signs/kitajuku-dentetsu.svg","test-sign":"../assets/signs/test-sign.svg",test3:"./test3.vue",test4:"./test4.vue"};var k={name:"Sign",components:{KitajukuDentetsu:x.a,TestSign:b.a},data:function(){return{signStyle:"kitajuku-dentetsu",output:{outputWidth:Number,outputHeight:Number,lightStyle:String},signInfo:{main:{staNameEnglish:String,staNameChinese:String,staNameKana:String},left:{leftStaNumber:Number,leftStaNameEnglish:String,leftStaNameChinese:String},middle:{lineName:String,lineAbbr:String,middleStaNumber:Number},right:{rightStaNumber:Number,rightStaNameEnglish:String,rightStaNameChinese:String},lineColor:Number,backgroundColor:Number}}},updated:function(){this.UpdateSignData()},methods:{UpdateData:function(t,e,n){this.lightStyle=e,this.signInfo=t,this.output=n},UpdateSignStyle:function(t){this.signStyle=t},UpdateSignData:function(){var t=this.$refs.svg.getElementById("MID-kanji-text");t.innerHTML=this.signInfo.main.staNameChinese,t=this.$refs.svg.getElementById("line"),t.attributes.stroke.value=this.signInfo.lineColor}}},_=k,I=(n("e2ab"),Object(d["a"])(_,S,w,!1,null,"0c530508",null)),E=I.exports,D=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",{staticClass:"form",attrs:{id:"editor"}},[n("div",{staticClass:"row"},[n("div",[n("h2",[t._v("整体调整")]),n("div",{staticClass:"form-min-row"},[n("p",[t._v("站牌样式")]),n("select",{directives:[{name:"model",rawName:"v-model",value:t.signStyle,expression:"signStyle"}],on:{change:[function(e){var n=Array.prototype.filter.call(e.target.options,(function(t){return t.selected})).map((function(t){var e="_value"in t?t._value:t.value;return e}));t.signStyle=e.target.multiple?n:n[0]},t.sendSign]}},[n("option",{attrs:{disabled:"",value:""}},[t._v("请选择")]),n("option",{attrs:{value:"test-sign"}},[t._v("测试用")]),n("option",{attrs:{value:"kitajuku-dentetsu"}},[t._v("北宿电铁")])])]),n("div",{staticClass:"form-min-row"},[n("p",[t._v("灯光效果")]),n("select",{directives:[{name:"model",rawName:"v-model",value:t.lightStyle,expression:"lightStyle"}],on:{change:[function(e){var n=Array.prototype.filter.call(e.target.options,(function(t){return t.selected})).map((function(t){var e="_value"in t?t._value:t.value;return e}));t.lightStyle=e.target.multiple?n:n[0]},t.sendData]}},[n("option",{attrs:{value:"none"}},[t._v("无")]),n("option",{attrs:{value:"fluore"}},[t._v("荧光灯")]),n("option",{attrs:{value:"led"}},[t._v("LED")])])])]),n("div",[n("h2",[t._v("站牌大小")]),n("div",{staticClass:"form-min-row"},[n("p",[t._v("宽度")]),n("div",[n("input",{directives:[{name:"model",rawName:"v-model",value:t.output.outputWidth,expression:"output.outputWidth"}],attrs:{type:"number",value:"2160"},domProps:{value:t.output.outputWidth},on:{change:t.sendData,input:function(e){e.target.composing||t.$set(t.output,"outputWidth",e.target.value)}}}),t._v(" px")])]),n("div",{staticClass:"form-min-row"},[n("p",[t._v("高度")]),n("div",[n("input",{directives:[{name:"model",rawName:"v-model",value:t.output.outputHeight,expression:"output.outputHeight"}],attrs:{type:"number",value:"720"},domProps:{value:t.output.outputHeight},on:{change:t.sendData,input:function(e){e.target.composing||t.$set(t.output,"outputHeight",e.target.value)}}}),t._v(" px")])])])]),n("div",{staticClass:"row"},[n("div",[n("h2",[t._v("本站名")]),n("div",{staticClass:"form-min-row"},[n("p",[t._v("站名 中文")]),n("input",{directives:[{name:"model",rawName:"v-model.lazy",value:t.signInfo.main.staNameChinese,expression:"signInfo.main.staNameChinese",modifiers:{lazy:!0}}],attrs:{type:"text"},domProps:{value:t.signInfo.main.staNameChinese},on:{change:[function(e){return t.$set(t.signInfo.main,"staNameChinese",e.target.value)},t.sendData]}})]),n("div",{staticClass:"form-min-row"},[n("p",[t._v("站名 英语")]),n("input",{directives:[{name:"model",rawName:"v-model",value:t.signInfo.main.staNameEnglish,expression:"signInfo.main.staNameEnglish"}],attrs:{type:"text"},domProps:{value:t.signInfo.main.staNameEnglish},on:{change:t.sendData,input:function(e){e.target.composing||t.$set(t.signInfo.main,"staNameEnglish",e.target.value)}}})]),n("div",{staticClass:"form-min-row"},[n("p",[t._v("站名 假名")]),n("input",{directives:[{name:"model",rawName:"v-model",value:t.signInfo.main.staNameKana,expression:"signInfo.main.staNameKana"}],attrs:{type:"text"},domProps:{value:t.signInfo.main.staNameKana},on:{change:t.sendData,input:function(e){e.target.composing||t.$set(t.signInfo.main,"staNameKana",e.target.value)}}})])]),n("div",[n("h2",[t._v("主要信息")]),n("div",{staticClass:"form-min-row"},[n("p",[t._v("线路颜色")]),n("input",{directives:[{name:"model",rawName:"v-model",value:t.signInfo.lineColor,expression:"signInfo.lineColor"}],attrs:{type:"color"},domProps:{value:t.signInfo.lineColor},on:{change:t.sendData,input:function(e){e.target.composing||t.$set(t.signInfo,"lineColor",e.target.value)}}})]),n("div",{staticClass:"form-min-row"},[n("p",[t._v("背景颜色")]),n("input",{directives:[{name:"model",rawName:"v-model",value:t.signInfo.backgroundColor,expression:"signInfo.backgroundColor"}],attrs:{type:"color"},domProps:{value:t.signInfo.backgroundColor},on:{change:t.sendData,input:function(e){e.target.composing||t.$set(t.signInfo,"backgroundColor",e.target.value)}}})]),n("div",{staticClass:"form-min-row"},[n("p",[t._v("线路名称")]),n("input",{directives:[{name:"model",rawName:"v-model",value:t.signInfo.middle.lineName,expression:"signInfo.middle.lineName"}],attrs:{type:"text"},domProps:{value:t.signInfo.middle.lineName},on:{change:t.sendData,input:function(e){e.target.composing||t.$set(t.signInfo.middle,"lineName",e.target.value)}}})]),n("div",{staticClass:"form-min-row"},[n("p",[t._v("线路缩写")]),n("input",{directives:[{name:"model",rawName:"v-model",value:t.signInfo.middle.lineAbbr,expression:"signInfo.middle.lineAbbr"}],attrs:{type:"text"},domProps:{value:t.signInfo.middle.lineAbbr},on:{change:t.sendData,input:function(e){e.target.composing||t.$set(t.signInfo.middle,"lineAbbr",e.target.value)}}})]),n("div",{staticClass:"form-min-row"},[n("p",[t._v("本站编号")]),n("input",{directives:[{name:"model",rawName:"v-model",value:t.signInfo.middle.middleStaNumber,expression:"signInfo.middle.middleStaNumber"}],attrs:{type:"Number"},domProps:{value:t.signInfo.middle.middleStaNumber},on:{input:function(e){e.target.composing||t.$set(t.signInfo.middle,"middleStaNumber",e.target.value)}}})])])]),n("div",{staticClass:"row"},[n("div",[n("h2",[t._v("左侧站点信息")]),n("div",{staticClass:"form-min-row"},[n("p",[t._v("站名 中文")]),n("input",{directives:[{name:"model",rawName:"v-model",value:t.signInfo.left.leftStaNameChinese,expression:"signInfo.left.leftStaNameChinese"}],attrs:{value:"锦冈",type:"text"},domProps:{value:t.signInfo.left.leftStaNameChinese},on:{change:t.sendData,input:function(e){e.target.composing||t.$set(t.signInfo.left,"leftStaNameChinese",e.target.value)}}})]),n("div",{staticClass:"form-min-row"},[n("p",[t._v("站名 英语")]),n("input",{directives:[{name:"model",rawName:"v-model",value:t.signInfo.left.leftStaNameEnglish,expression:"signInfo.left.leftStaNameEnglish"}],attrs:{value:"Nishikioka",type:"text"},domProps:{value:t.signInfo.left.leftStaNameEnglish},on:{change:t.sendData,input:function(e){e.target.composing||t.$set(t.signInfo.left,"leftStaNameEnglish",e.target.value)}}})]),n("div",{staticClass:"form-min-row"},[n("p",[t._v("站点编号")]),n("input",{directives:[{name:"model",rawName:"v-model",value:t.signInfo.left.leftStaNumber,expression:"signInfo.left.leftStaNumber"}],attrs:{value:"04",type:"number"},domProps:{value:t.signInfo.left.leftStaNumber},on:{change:t.sendData,input:function(e){e.target.composing||t.$set(t.signInfo.left,"leftStaNumber",e.target.value)}}})])]),n("div",[n("h2",[t._v("右侧站点信息")]),n("div",{staticClass:"form-min-row"},[n("p",[t._v("站名 中文")]),n("input",{directives:[{name:"model",rawName:"v-model",value:t.signInfo.right.rightStaNameChinese,expression:"signInfo.right.rightStaNameChinese"}],attrs:{value:"北宿",type:"text"},domProps:{value:t.signInfo.right.rightStaNameChinese},on:{change:t.sendData,input:function(e){e.target.composing||t.$set(t.signInfo.right,"rightStaNameChinese",e.target.value)}}})]),n("div",{staticClass:"form-min-row"},[n("p",[t._v("站名 英语")]),n("input",{directives:[{name:"model",rawName:"v-model",value:t.signInfo.right.rightStaNameEnglish,expression:"signInfo.right.rightStaNameEnglish"}],attrs:{value:"Hokuriku",type:"text"},domProps:{value:t.signInfo.right.rightStaNameEnglish},on:{change:t.sendData,input:function(e){e.target.composing||t.$set(t.signInfo.right,"rightStaNameEnglish",e.target.value)}}})]),n("div",{staticClass:"form-min-row"},[n("p",[t._v("站点编号")]),n("input",{directives:[{name:"model",rawName:"v-model",value:t.signInfo.right.rightStaNumber,expression:"signInfo.right.rightStaNumber"}],attrs:{value:"02",type:"number"},domProps:{value:t.signInfo.right.rightStaNumber},on:{change:t.sendData,input:function(e){e.target.composing||t.$set(t.signInfo.right,"rightStaNumber",e.target.value)}}})])])])])},L=[],P={name:"editor",data:function(){return{signStyle:"kitajuku-dentetsu",lightStyle:"fluore",output:{outputWidth:620,outputHeight:220},signInfo:{main:{staNameEnglish:"Kaihin-Shukukai",staNameChinese:"海浜宿海",staNameKana:"かいひんしゅくかい"},left:{leftStaNumber:"04",leftStaNameEnglish:"Nishikioka",leftStaNameChinese:"錦岡"},middle:{lineName:"東海岸本線",lineAbbr:"T",middleStaNumber:"03"},right:{rightStaNumber:"02",rightStaNameEnglish:"北宿",rightStaNameChinese:"Hokuriku"},lineColor:"#7297DD",backgroundColor:"#4D4D4D"}}},methods:{sendData:function(){this.$emit("someChanged",this.lightStyle,this.signInfo,this.output)},sendSign:function(){this.$emit("signChanged",this.signStyle,this.lightStyle,this.signInfo,this.output)}}},F=P,M=(n("f408"),Object(d["a"])(F,D,L,!1,null,"794141b3",null)),j=M.exports,$={name:"App",components:{HeaderFlex:f,FooterFlex:C,Signs:E,Editor:j},data:function(){return{titles:"FesGen"}},methods:{UpdateSignStyle:function(t){this.$refs.signs.UpdateSignStyle(t)},UpdateData:function(t,e,n){this.$refs.signs.UpdateData(e,t,n)}}},O=$,A=(n("deb0"),Object(d["a"])(O,a,s,!1,null,"074166b6",null)),H=A.exports;n("150b");i["a"].config.productionTip=!1,new i["a"]({render:function(t){return t(H)}}).$mount("#app")},"7f75":function(t,e,n){},9768:function(t,e,n){"use strict";n("7f75")},"9d84":function(t,e,n){},a399:function(t,e){t.exports={functional:!0,render(t,e){const{_c:n,_v:i,data:a,children:s=[]}=e,{class:r,staticClass:o,style:l,staticStyle:u,attrs:d={},...g}=a;return n("svg",{class:[r,o],style:[l,u],attrs:Object.assign({width:"620px",height:"220px",viewBox:"0 0 620 220",version:"1.1",xmlns:"http://www.w3.org/2000/svg","xmlns:xlink":"http://www.w3.org/1999/xlink"},d),...g},s.concat([n("rect",{attrs:{id:"background",stroke:"#4D4D4D","stroke-width":"2",fill:"#ECECEC",x:"1",y:"1",width:"598",height:"198"}}),n("text",{attrs:{id:"MID-kanji","font-family":".PingFangSC-Regular, .PingFang SC","font-size":"62.208","font-weight":"normal",fill:"#383838"}},[n("tspan",{attrs:{id:"MID-kanji-text",x:"156",y:"100"}},[i("海浜宿海")])]),n("line",{attrs:{x1:"2",y1:"177.846485",x2:"598.003562",y2:"177.846485",id:"line",stroke:"#7297DD","stroke-width":"15"}})]))}}},b70e:function(t,e,n){},deb0:function(t,e,n){"use strict";n("408d")},e2ab:function(t,e,n){"use strict";n("effd")},e66e:function(t,e){t.exports={functional:!0,render(t,e){const{_c:n,_v:i,data:a,children:s=[]}=e,{class:r,staticClass:o,style:l,staticStyle:u,attrs:d={},...g}=a;return n("svg",{class:[r,o],style:[l,u],attrs:Object.assign({width:"620px",height:"220px",viewBox:"0 0 620 220",version:"1.1",xmlns:"http://www.w3.org/2000/svg","xmlns:xlink":"http://www.w3.org/1999/xlink"},d),...g},s.concat([n("title",[i("EX")]),n("defs",[n("filter",{attrs:{x:"-2.2%",y:"-6.8%",width:"104.5%",height:"113.5%",filterUnits:"objectBoundingBox",id:"filter-1"}},[n("feOffset",{attrs:{dx:"3",dy:"3",in:"SourceAlpha",result:"shadowOffsetOuter1"}}),n("feGaussianBlur",{attrs:{stdDeviation:"2",in:"shadowOffsetOuter1",result:"shadowBlurOuter1"}}),n("feColorMatrix",{attrs:{values:"0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.5 0",type:"matrix",in:"shadowBlurOuter1",result:"shadowMatrixOuter1"}}),n("feMerge",[n("feMergeNode",{attrs:{in:"shadowMatrixOuter1"}}),n("feMergeNode",{attrs:{in:"SourceGraphic"}})])])]),n("g",{attrs:{id:"页面-1",stroke:"none","stroke-width":"1",fill:"none","fill-rule":"evenodd"}},[n("g",{attrs:{id:"EX",filter:"url(#filter-1)",transform:"translate(10.000000, 10.000000)"}},[n("rect",{attrs:{id:"background",stroke:"#4D4D4D","stroke-width":"2",fill:"#ECECEC",x:"1",y:"1",width:"598",height:"198"}}),n("g",{attrs:{id:"Main",transform:"translate(70.000000, 14.000000)",fill:"#383838","font-weight":"normal"}},[n("g",{attrs:{id:"编组-9"}},[n("text",{attrs:{id:"MID-eng","font-family":"Helvetica","font-size":"23.328"}},[n("tspan",{attrs:{x:"291",y:"62"}},[i("Kaihin-Shukukai")])]),n("text",{attrs:{id:"MID-kana","font-family":".PingFangSC-Regular, .PingFang SC","font-size":"20.736"}},[n("tspan",{attrs:{x:"273",y:"31"}},[i("かいひんしゅくかい")])]),n("text",{attrs:{id:"MID-kanji","font-family":".PingFangSC-Regular, .PingFang SC","font-size":"62.208"}},[n("tspan",{attrs:{id:"MID-kanji-text",x:"0",y:"60"}},[i("海浜宿海")])])])]),n("line",{attrs:{x1:"2",y1:"177.846485",x2:"598.003562",y2:"177.846485",id:"line",stroke:"#7297DD","stroke-width":"15"}}),n("g",{attrs:{id:"Right",transform:"translate(472.000000, 120.000000)"}},[n("text",{attrs:{id:"Right-kanji","font-family":".PingFangSC-Regular, .PingFang SC","font-size":"24.8832","font-weight":"normal",fill:"#737373"}},[n("tspan",{attrs:{x:"0",y:"24"}},[i("北宿")])]),n("g",{attrs:{id:"icon",transform:"translate(53.100000, 3.800000)"}},[n("path",{attrs:{d:"M5.508,2.052 L5.508,20.484 L2.88,20.484 C2.24376797,20.484 1.66776797,20.226116 1.25082598,19.809174 C0.833883984,19.392232 0.576,18.816232 0.576,18.18 L0.576,18.18 L0.576,4.356 C0.576,3.71976797 0.833883984,3.14376797 1.25082598,2.72682598 C1.66776797,2.30988398 2.24376797,2.052 2.88,2.052 L2.88,2.052 L5.508,2.052 Z",id:"rec1",stroke:"#7A7A7A","stroke-width":"1.152",fill:"#7A7A7A"}}),n("path",{attrs:{d:"M30.852,2.276 C31.4263761,2.276 31.9463761,2.50881193 32.3227821,2.8852179 C32.6991881,3.26162386 32.932,3.78162386 32.932,4.356 L32.932,4.356 L32.932,18.18 C32.932,18.7543761 32.6991881,19.2743761 32.3227821,19.6507821 C31.9463761,20.0271881 31.4263761,20.26 30.852,20.26 L30.852,20.26 L5.732,20.26 L5.732,2.276 Z",id:"rec2",stroke:"#7A7A7A","stroke-width":"1.6"}}),n("text",{attrs:{id:"number","font-family":"PingFangSC-Medium, PingFang SC","font-size":"14.92992","font-weight":"400",fill:"#7A7A7A"}},[n("tspan",{attrs:{x:"10.116",y:"16"}},[i("02")])])]),n("path",{attrs:{d:"M44.4403628,56.6376551 C46.6495018,56.6376551 48.0481869,54.6838124 49.4403628,52.6376551 C50.147638,51.598134 50.0067802,50.7516832 51.2432808,49.752862 C51.6064123,49.4595314 52.234694,49.3128661 53.128126,49.3128661 L56.5755452,49.3128661 C49.3722921,46.437622 45.2699895,45 44.2686375,45 C43.3037763,45 39.2142305,46.437622 32,49.3128661 L35.5930172,49.3128661 C36.0291578,49.3264432 36.4428059,49.4295662 36.8339617,49.622235 C37.8503086,50.12285 38.870861,52.2054812 39.0504228,52.4841404 C40.3787559,54.5455602 42.2312238,56.6376551 44.4403628,56.6376551 Z",id:"epli",fill:"#ECECEC"}}),n("text",{attrs:{id:"Right-eng","font-family":"Helvetica","font-size":"18.6624","font-weight":"normal",fill:"#6C6C6C"}},[n("tspan",{attrs:{x:"7",y:"44"}},[i("Hokuriku")])])]),n("g",{attrs:{id:"Left",transform:"translate(29.000000, 121.000000)"}},[n("text",{attrs:{id:"LEFT-kanji","font-family":".PingFangSC-Regular, .PingFang SC","font-size":"24.8832","font-weight":"normal",fill:"#383838"}},[n("tspan",{attrs:{x:"0",y:"24"}},[i("錦岡")]),n("tspan",{attrs:{x:"50.4133632",y:"24","font-family":".AppleSystemUIFont"}})]),n("g",{attrs:{id:"icon",transform:"translate(55.000000, 4.000000)"}},[n("path",{attrs:{d:"M5.508,2.052 L5.508,20.484 L2.88,20.484 C2.24376797,20.484 1.66776797,20.226116 1.25082598,19.809174 C0.833883984,19.392232 0.576,18.816232 0.576,18.18 L0.576,18.18 L0.576,4.356 C0.576,3.71976797 0.833883984,3.14376797 1.25082598,2.72682598 C1.66776797,2.30988398 2.24376797,2.052 2.88,2.052 L2.88,2.052 L5.508,2.052 Z",id:"rec1",stroke:"#565656","stroke-width":"1.152",fill:"#565656"}}),n("path",{attrs:{d:"M30.852,2.276 C31.4263761,2.276 31.9463761,2.50881193 32.3227821,2.8852179 C32.6991881,3.26162386 32.932,3.78162386 32.932,4.356 L32.932,4.356 L32.932,18.18 C32.932,18.7543761 32.6991881,19.2743761 32.3227821,19.6507821 C31.9463761,20.0271881 31.4263761,20.26 30.852,20.26 L30.852,20.26 L5.732,20.26 L5.732,2.276 Z",id:"rec2",stroke:"#565656","stroke-width":"1.6"}}),n("text",{attrs:{id:"number","font-family":"PingFangSC-Medium, PingFang SC","font-size":"14.92992","font-weight":"400",fill:"#565656"}},[n("tspan",{attrs:{x:"10.116",y:"16"}},[i("04")])])]),n("path",{attrs:{d:"M45.3406106,56.6376551 C47.5497496,56.6376551 48.9484347,54.6838124 50.3406106,52.6376551 C51.0478858,51.598134 50.9070279,50.7516832 52.1435285,49.752862 C52.50666,49.4595314 53.1349418,49.3128661 54.0283738,49.3128661 L57.475793,49.3128661 C50.2725399,46.437622 46.1702373,45 45.1688852,45 C44.2040241,45 40.1144782,46.437622 32.9002478,49.3128661 L36.493265,49.3128661 C36.9294055,49.3264432 37.3430537,49.4295662 37.7342095,49.622235 C38.7505564,50.12285 39.7711088,52.2054812 39.9506706,52.4841404 C41.2790036,54.5455602 43.1314716,56.6376551 45.3406106,56.6376551 Z",id:"epli",fill:"#ECECEC"}}),n("text",{attrs:{id:"Left-eng","font-family":"Helvetica-Light, Helvetica","font-size":"18.6624","font-weight":"300",fill:"#383838"}},[n("tspan",{attrs:{x:"1",y:"43"}},[i("Nishikioka")])])]),n("g",{attrs:{id:"Middle",transform:"translate(235.000000, 100.000000)"}},[n("g",{attrs:{id:"icon",transform:"translate(43.000000, 31.000000)"}},[n("path",{attrs:{d:"M39.2144,2.08 C39.9659491,2.08 40.6463491,2.38462546 41.1388618,2.87713818 C41.6313745,3.36965091 41.936,4.05005091 41.936,4.8016 L41.936,4.8016 L41.936,23.04928 C41.936,23.8008291 41.6313745,24.4812291 41.1388618,24.9737418 C40.6463491,25.4662545 39.9659491,25.77088 39.2144,25.77088 L39.2144,25.77088 L8.8016,25.77088 C8.05005091,25.77088 7.36965091,25.4662545 6.87713818,24.9737418 C6.38462546,24.4812291 6.08,23.8008291 6.08,23.04928 L6.08,23.04928 L6.08,4.8016 C6.08,4.05005091 6.38462546,3.36965091 6.87713818,2.87713818 C7.36965091,2.38462546 8.05005091,2.08 8.8016,2.08 L8.8016,2.08 Z",id:"rec2",stroke:"#565656","stroke-width":"2.16"}}),n("text",{attrs:{id:"number","font-family":"PingFangSC-Medium, PingFang SC","font-size":"19.7074944","font-weight":"400",fill:"#565656"}},[n("tspan",{attrs:{x:"12.17312",y:"21"}},[i("03")])]),n("path",{attrs:{d:"M7.77,2.08 L7.77,25.77 L2.8740096,25.77 C2.37860753,25.77 1.93010513,25.5691986 1.60545325,25.2445468 C1.28080136,24.9198949 1.08,24.4713925 1.08,23.9759904 L1.08,23.9759904 L1.08,3.8740096 C1.08,3.37860753 1.28080136,2.93010513 1.60545325,2.60545325 C1.93010513,2.28080136 2.37860753,2.08 2.8740096,2.08 L2.8740096,2.08 L7.77,2.08 Z",id:"rec1",stroke:"#565656","stroke-width":"2.16",fill:"#565656"}})]),n("g",{attrs:{id:"line-icon",transform:"translate(0.000000, 2.000000)"}},[n("rect",{attrs:{id:"rec",stroke:"#565656","stroke-width":"1.14960384",fill:"#565656",x:"0.57480192",y:"1.14960384",width:"18.3936614",height:"18.3936614",rx:"2.8740096"}}),n("text",{attrs:{id:"line-abbr","font-family":"PingFangSC-Regular, PingFang SC","font-size":"14.8988658","font-weight":"normal",fill:"#ECECEC"}},[n("tspan",{attrs:{x:"5.17321728",y:"16"}},[i("T")])])]),n("path",{attrs:{d:"M65.4403628,77.6376551 C67.6495018,77.6376551 69.0481869,75.6838124 70.4403628,73.6376551 C71.147638,72.598134 71.0067802,71.7516832 72.2432808,70.752862 C72.6064123,70.4595314 73.234694,70.3128661 74.128126,70.3128661 L77.5755452,70.3128661 C70.3722921,67.437622 66.2699895,66 65.2686375,66 C64.3037763,66 60.2142305,67.437622 53,70.3128661 L56.5930172,70.3128661 C57.0291578,70.3264432 57.4428059,70.4295662 57.8339617,70.622235 C58.8503086,71.12285 59.870861,73.2054812 60.0504228,73.4841404 C61.3787559,75.5455602 63.2312238,77.6376551 65.4403628,77.6376551 Z",id:"epli",fill:"#ECECEC"}}),n("text",{attrs:{id:"line-name","font-family":".PingFangSC-Regular, .PingFang SC","font-size":"21","font-weight":"normal",fill:"#383838"}},[n("tspan",{attrs:{x:"25",y:"20"}},[i("東海岸本線")])])]),n("polygon",{attrs:{id:"Toward",fill:"#565656",points:"38.0841482 86 42.9975182 86 33.901557 95.9466813 54.9221016 95.9466813 54.9221016 99.8063645 33.901557 99.8063645 42.9975182 110 38.0841482 110 27.4197153 98"}})])])]))}}},effd:function(t,e,n){},f408:function(t,e,n){"use strict";n("9d84")}});
//# sourceMappingURL=app.2d4f21e6.js.map