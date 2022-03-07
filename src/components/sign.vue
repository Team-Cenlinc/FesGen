<template>
  <div id="canvas">
    <keep-alive>
      <component :is="this.signStyle" ref="svg"></component>
    </keep-alive>
    <h3>Data from editor.vue -> App.vue -> sign.vue :</h3>
    <div class="data">
      <p>{{ this.signStyle || '你尚未选择'}}</p>
    </div>
    <div class="data">
      <p>{{ this.signInfo || 'NO'}}</p>
    </div>
    <hr/>

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
        },
        left: {
          leftStaNumber: '04',
          leftStaNameEnglish: 'Nishikioka',
          leftStaNameChinese: '錦岡',
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

        },
        lineColor: '#7297DD',
        backgroundColor: '#4D4D4D',
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
      let dom = this.$refs.svg.getElementById("staNameChinese")
      dom.childNodes[0].innerHTML = this.signInfo.main.staNameChinese

      dom = this.$refs.svg.getElementById("staNameKana")
      dom.childNodes[0].innerHTML = this.signInfo.main.staNameKana

      dom = this.$refs.svg.getElementById("staNameEnglish")
      dom.childNodes[0].innerHTML = this.signInfo.main.staNameEnglish
      //signInfo.left
      dom = this.$refs.svg.getElementById("leftStaNameChinese")
      dom.childNodes[0].innerHTML = this.signInfo.left.leftStaNameChinese

      dom = this.$refs.svg.getElementById("leftStaNameEnglish")
      dom.childNodes[0].innerHTML = this.signInfo.left.leftStaNameEnglish

      dom = this.$refs.svg.getElementById("leftStaNumber")
      dom.childNodes[0].innerHTML = this.signInfo.left.leftStaNumber
      //signInfo.right
      dom = this.$refs.svg.getElementById("rightStaNameChinese")
      dom.childNodes[0].innerHTML = this.signInfo.right.rightStaNameChinese

      dom = this.$refs.svg.getElementById("rightStaNameEnglish")
      dom.childNodes[0].innerHTML = this.signInfo.right.rightStaNameEnglish

      dom = this.$refs.svg.getElementById("rightStaNumber")
      dom.childNodes[0].innerHTML = this.signInfo.right.rightStaNumber

      //signInfo.middle
      dom = this.$refs.svg.getElementById("lineAbbr")
      dom.childNodes[0].innerHTML = this.signInfo.middle.lineAbbr

      dom = this.$refs.svg.getElementById("lineName")
      dom.childNodes[0].innerHTML = this.signInfo.middle.lineName

      dom = this.$refs.svg.getElementById("middleStaNumber")
      dom.childNodes[0].innerHTML = this.signInfo.middle.middleStaNumber




      console.log(dom.childNodes[0].innerHTML)
      //dom.innerHTML = this.signInfo.main.staNameChinese

      dom = this.$refs.svg.getElementById("line")
      dom.attributes.stroke.value = this.signInfo.lineColor

      dom = this.$refs.svg.getElementById("background")
      dom.attributes.fill.value = this.signInfo.backgroundColor


    },
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

</style>
