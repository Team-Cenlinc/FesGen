<template>
  <div id="canvas">
    <component :is="signStyle" ref="svg"></component>
    <h3>Data from editor.vue -> App.vue -> sign.vue :</h3>
    <div class="data">
      <p>{{ signStyle || '你尚未选择'}}</p>
    </div>
    <div class="data">
      <p>{{ signInfo || ''}}</p>
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
    }
  },
  props: {
    signStyle: String,
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
  },
  methods: {
    UpdateSign(signStyle, signInfo){
      let dom = this.$refs.svg.querySelector("#MID-kanji-text");
      dom.innerHTML = signInfo.main.staNameChinese;
      dom = this.$refs.svg.getElementById("line");
      if(signInfo.lineColor)
        this.$refs.svg.getElementById("line").attributes.stroke.value = signInfo.lineColor;
      console.log(this.$refs.svg.getElementById("line").attributes.getNamedItem("stroke").value);
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
