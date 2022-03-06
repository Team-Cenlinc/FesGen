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
      output: {
        outputWidth: Number,
        outputHeight: Number,
        lightStyle: String,
      },
      signInfo:{
        main: {
          staNameEnglish: String,
          staNameChinese: String,
          staNameKana: String,
        },
        left: {
          leftStaNumber: Number,
          leftStaNameEnglish: String,
          leftStaNameChinese: String,
        },
        middle: {
          lineName: String,
          lineAbbr: String,
          middleStaNumber: Number,
        },
        right: {
          rightStaNumber: Number,
          rightStaNameEnglish: String,
          rightStaNameChinese: String,

        },
        lineColor: Number,
        backgroundColor: Number,
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
      let dom = this.$refs.svg.getElementById("MID-kanji-text")
      dom.innerHTML = this.signInfo.main.staNameChinese

      dom = this.$refs.svg.getElementById("line")
      dom.attributes.stroke.value = this.signInfo.lineColor


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
