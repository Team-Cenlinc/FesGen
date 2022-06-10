<template>
  <div id="canvas">
    <keep-alive>
      <component :is="this.signStyle" ref="svg"></component>
    </keep-alive>
    <div class="data">
      <h4>SignStyle: </h4>
      <p>{{ this.signStyle || '你尚未选择'}}</p>
    </div>
    <hr/>
    <button>下载</button>
    <div class="data">
      <p v-show="false">{{ this.signInfo || 'NO'}}</p>
    </div>
  </div>
</template>

<script>
import KitajukuDentetsu from '../assets/signs/kitajuku-dentetsu.svg'
import TestSign from '../assets/signs/test-sign.svg'
window.componentsConfig = {    //左边是key值，右边是组件的引入路径
  'kitajuku-dentetsu': '../assets/signs/kitajuku-dentetsu.svg',
  'test-sign': '../assets/signs/test-sign.svg',
  'test3': './test3.vue',
  'test4': './test4.vue',
}
export default {
  name: 'Sign',
  components: {
    KitajukuDentetsu, TestSign
  },
  data(){
    return{
      signStyle: 'kitajuku-dentetsu',
      lightStyle: 'fluore',
      output: {
        outputWidth: 620,
        outputHeight: 220,
      },
      signInfo:{
        main: {
          staNameEnglish: 'Kaihin-Shukukai',
          staNameChinese: '海浜宿海',
          staNameKana: 'かいひんしゅくかい',
          mainTextColor: '#383838',
        },
        left: {
          leftStaNumber: '04',
          leftStaNameEnglish: 'Nishikioka',
          leftStaNameChinese: '錦岡',
          leftTextColor: '#383838',
        },
        middle: {
          lineName: '東海岸本線',
          lineAbbr: 'T',
          middleStaNumber: '03',
        },
        right: {
          rightStaNumber: '02',
          rightStaNameEnglish: 'Hokuriku',
          rightStaNameChinese: '北宿',
          rightTextColor: '#7a7a7a',
        },
        lineColor: '#7297DD',
        backgroundColor: '#ECECEC',
        frameThickness: '2',
        displayForwardArrow: true,
      },
    }
  },
  updated() {
    this.UpdateSignData()
  },
  methods: {
    UpdateData(signInfo, lightStyle, signScale){
      this.lightStyle = lightStyle
      this.signInfo = signInfo
      this.output = signScale
    },
    UpdateSignStyle(signStyle){
      this.signStyle = signStyle
    },
    UpdateSignData(){

      //signInfo.main

      let dom = this.$refs.svg.getElementById("Main")
      dom.attributes.fill.value = this.signInfo.main.mainTextColor

      dom = this.$refs.svg.getElementById("staNameChinese")
      dom.childNodes[0].innerHTML = this.signInfo.main.staNameChinese

      dom = this.$refs.svg.getElementById("staNameKana")
      dom.childNodes[0].innerHTML = this.signInfo.main.staNameKana

      dom = this.$refs.svg.getElementById("staNameEnglish")
      dom.childNodes[0].innerHTML = this.signInfo.main.staNameEnglish

      dom = this.$refs.svg.getElementById("middleIconOuter")
      dom.attributes.stroke.value = this.signInfo.main.mainTextColor
      dom.attributes.fill.value = this.signInfo.main.mainTextColor

      dom = this.$refs.svg.getElementById("middleIconInner")
      dom.attributes.stroke.value = this.signInfo.main.mainTextColor

      //signInfo.right

      dom = this.$refs.svg.getElementById("rightStaNameChinese")
      dom.childNodes[0].innerHTML = this.signInfo.right.rightStaNameChinese
      dom.attributes.fill.value = this.signInfo.right.rightTextColor

      dom = this.$refs.svg.getElementById("rightStaNameEnglish")
      dom.childNodes[0].innerHTML = this.signInfo.right.rightStaNameEnglish
      dom.attributes.fill.value = this.signInfo.right.rightTextColor

      dom = this.$refs.svg.getElementById("rightStaNumber")
      dom.childNodes[0].innerHTML = this.signInfo.right.rightStaNumber
      dom.attributes.fill.value = this.signInfo.right.rightTextColor

      //signInfo.left

      dom = this.$refs.svg.getElementById("leftStaNameChinese")
      dom.childNodes[0].innerHTML = this.signInfo.left.leftStaNameChinese
      dom.attributes.fill.value = this.signInfo.left.leftTextColor

      dom = this.$refs.svg.getElementById("leftStaNameEnglish")
      dom.childNodes[0].innerHTML = this.signInfo.left.leftStaNameEnglish
      dom.attributes.fill.value = this.signInfo.left.leftTextColor

      dom = this.$refs.svg.getElementById("leftStaNumber")
      dom.childNodes[0].innerHTML = this.signInfo.left.leftStaNumber
      dom.attributes.fill.value = this.signInfo.left.leftTextColor

      // signInfo.middle

      dom = this.$refs.svg.getElementById("lineAbbr")
      dom.childNodes[0].innerHTML = this.signInfo.middle.lineAbbr

      // Line Abbr. Color is same as background.

      dom.attributes.fill.value = this.signInfo.backgroundColor

      // Other sections are same as the "main" part.

      dom = this.$refs.svg.getElementById("lineName")
      dom.childNodes[0].innerHTML = this.signInfo.middle.lineName
      dom.attributes.fill.value = this.signInfo.main.mainTextColor

      dom = this.$refs.svg.getElementById("middleStaNumber")
      dom.childNodes[0].innerHTML = this.signInfo.middle.middleStaNumber
      dom.attributes.fill.value = this.signInfo.main.mainTextColor

      // console.log(dom.childNodes[0].innerHTML)

      // dom.innerHTML = this.signInfo.main.staNameChinese

      dom = this.$refs.svg.getElementById("lineColorBelt")
      dom.attributes.stroke.value = this.signInfo.lineColor

      dom = this.$refs.svg.getElementById("background")
      dom.attributes.stroke.width.value = this.signInfo.frameThickness
      dom.attributes.fill.value = this.signInfo.backgroundColor

      dom = this.$refs.svg.getElementById("leftEpli")
      dom.attributes.fill.value = this.signInfo.backgroundColor

      dom = this.$refs.svg.getElementById("rightEpli")
      dom.attributes.fill.value = this.signInfo.backgroundColor

      dom = this.$refs.svg.getElementById("middleEpli")
      dom.attributes.fill.value = this.signInfo.backgroundColor

      if (this.signInfo.displayForwardArrow){
        dom = this.$refs.svg.getElementById("Toward")
        dom.attributes.visibility.value = "visible"
      }
    },
    RequireRearrange(lightStyle, signInfo, signScale) {

      this.lightStyle = lightStyle
      this.signInfo = signInfo
      this.output = signScale

      // Calculation Zone

      /** Rearrange Accept list (For Dev)
       * mainStaCHN(/Kanji) (Ref. Pt. Depend)
       * midLineAbbrIcon (Ref. Pt. Depend)
       * midLineName (Ref. Pt. Depend)
       *
       * leftStaIcon (Ref. Pt. Depend)
       *
       * rightStaNameCHN (Ref. Pt. Depend)
       * rightStaNameEng (Ref. Pt. Depend)
       */

      // Reference Size
      let weightBorderX
      let weightBorderY
      let contentLength
      let xValueFin
      let yValueFin
      let xRefPoint
      let yRefPoint
      let dom

      // X value + 100%; Y value + 50%
      // signInfo.output · 第一次偏差值求值
      weightBorderX = this.output.outputWidth + 20
      weightBorderY = this.output.outputHeight + 20

      // 牌子viewBox与画板大小
      dom = this.$refs.svg.getElementById("canvasGlobal")
      dom.attributes.width.value = weightBorderX.toString() + "px"
      dom.attributes.height.value = weightBorderY.toString() + "px"

      // 第二次偏差值求值

      weightBorderX = this.output.outputWidth - 600
      weightBorderY = this.output.outputHeight - 200

      // 非计算元素 - 直接加值

      dom = this.$refs.svg.getElementById("staNameEnglish")
      xRefPoint = 255
      yRefPoint = 65
      xValueFin = xRefPoint + weightBorderX
      yValueFin = yRefPoint + weightBorderY
      dom.childNodes[0].innerHTML.attributes.x.value = xValueFin
      dom.childNodes[0].innerHTML.attributes.y.value = yValueFin

      dom = this.$refs.svg.getElementById("staNameKana")
      xRefPoint = 255
      yRefPoint = 30
      xValueFin = xRefPoint + weightBorderX
      yValueFin = yRefPoint + weightBorderY
      dom.childNodes[0].innerHTML.attributes.x.value = xValueFin
      dom.childNodes[0].innerHTML.attributes.y.value = yValueFin


      // signInfo.main

      contentLength = this.signInfo.main.staNameChinese.length

      xRefPoint = 240
      yRefPoint = 60
      xValueFin = xRefPoint + (contentLength * 60) + weightBorderX
      yValueFin = yRefPoint + (weightBorderY / 4)
      dom = this.$refs.svg.getElementById("staNameChinese")
      dom.childNodes[0].innerHTML.attributes.x.value = xValueFin
      dom.childNodes[0].innerHTML.attributes.y.value = yValueFin

      // signInfo.middle - Abbr Icon bind with signInfo.main in position





    }
  },
}
</script>

<style scoped>
#canvas {
  margin: 30px auto 1px;
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}
hr{
  width: 600px;
}
.data {
  display: flex;
  flex-direction: row;
  align-items: center;
}
.data h4 {
  margin-right: 20px;
  color: #333333;
}

button {
  font-size: 24px;
  background-color: #a0d4e7;
  color: #4e4e4e;
  margin: 10px;
  padding: 5px 20px;
  border: #000000 10px;
  transition: 225ms ease-out;
}

button:hover {
  background-color: rgba(79, 79, 79, .65);
  color: #f3f3f3;
}

</style>
