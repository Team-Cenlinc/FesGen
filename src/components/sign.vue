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
          textColor: '#383838',
        },
        left: {
          leftStaNumber: '04',
          leftStaNameEnglish: 'Nishikioka',
          leftStaNameChinese: '錦岡',
          textColor: '#383838',
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
          textColor: '#7a7a7a',
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
      dom.attributes.fill.value = this.signInfo.main.textColor

      dom = this.$refs.svg.getElementById("staNameChinese")
      dom.childNodes[0].innerHTML = this.signInfo.main.staNameChinese

      dom = this.$refs.svg.getElementById("staNameKana")
      dom.childNodes[0].innerHTML = this.signInfo.main.staNameKana

      dom = this.$refs.svg.getElementById("staNameEnglish")
      dom.childNodes[0].innerHTML = this.signInfo.main.staNameEnglish

      dom = this.$refs.svg.getElementsByTagName("path")

      //signInfo.right

      dom = this.$refs.svg.getElementById("rightStaNameChinese")
      dom.childNodes[0].innerHTML = this.signInfo.right.rightStaNameChinese
      dom.attributes.fill.value = this.signInfo.right.textColor

      dom = this.$refs.svg.getElementById("rightStaNameEnglish")
      dom.childNodes[0].innerHTML = this.signInfo.right.rightStaNameEnglish
      dom.attributes.fill.value = this.signInfo.right.textColor

      dom = this.$refs.svg.getElementById("rightStaNumber")
      dom.childNodes[0].innerHTML = this.signInfo.right.rightStaNumber
      dom.attributes.fill.value = this.signInfo.right.textColor

      //signInfo.left

      dom = this.$refs.svg.getElementById("leftStaNameChinese")
      dom.childNodes[0].innerHTML = this.signInfo.left.leftStaNameChinese
      dom.attributes.fill.value = this.signInfo.left.textColor

      dom = this.$refs.svg.getElementById("leftStaNameEnglish")
      dom.childNodes[0].innerHTML = this.signInfo.left.leftStaNameEnglish
      dom.attributes.fill.value = this.signInfo.left.textColor

      dom = this.$refs.svg.getElementById("leftStaNumber")
      dom.childNodes[0].innerHTML = this.signInfo.left.leftStaNumber
      dom.attributes.fill.value = this.signInfo.left.textColor

      // signInfo.middle

      dom = this.$refs.svg.getElementById("lineAbbr")
      dom.childNodes[0].innerHTML = this.signInfo.middle.lineAbbr

      // Line Abbr. Color is same as background.

      dom.attributes.fill.value = this.signInfo.backgroundColor

      // Other sections are same as the "main" part.

      dom = this.$refs.svg.getElementById("lineName")
      dom.childNodes[0].innerHTML = this.signInfo.middle.lineName
      dom.attributes.fill.value = this.signInfo.main.textColor

      dom = this.$refs.svg.getElementById("middleStaNumber")
      dom.childNodes[0].innerHTML = this.signInfo.middle.middleStaNumber
      dom.attributes.fill.value = this.signInfo.main.textColor

      // --
      console.log(dom.childNodes[0].innerHTML)

      // dom.innerHTML = this.signInfo.main.staNameChinese

      dom = this.$refs.svg.getElementById("line")
      dom.attributes.stroke.value = this.signInfo.lineColor
      dom = this.$refs.svg.getElementById("background")
      dom.attributes[3].value = this.signInfo.frameThickness
      //console.log(dom.attributes[3])
      dom.attributes.fill.value = this.signInfo.backgroundColor
      dom = this.$refs.svg.getElementById("leftEpli")
      dom.attributes.fill.value = this.signInfo.backgroundColor
      dom = this.$refs.svg.getElementById("rightEpli")
      dom.attributes.fill.value = this.signInfo.backgroundColor
      dom = this.$refs.svg.getElementById("middleEpli")
      dom.attributes.fill.value = this.signInfo.backgroundColor

      if (this.signInfo.displayForwardArrow){
        dom = this.$refs.svg.getElementById("Toward")
        dom.hidden
      }
    },
    RequireRearrange(lightStyle, signInfo, signScale) {

      this.lightStyle = lightStyle
      this.signInfo = signInfo
      this.output = signScale

      // Calculation Zone

      /** Rearrange Accept list (For Dev)
       * midStaCHN(/Kanji) (Ref Pt. Toward Left)
       * midLineAbbr
       * midLineAbbrIcon
       * midLineName
       * midLine
       */

      // Reference Size
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
