<template>
  <div id="canvas">
    <keep-alive>
      <component :is="this.signStyle" ref="svg" id="sign-entrance"></component>
    </keep-alive>
    <div class="data">
      <p v-show="false">{{ this.signInfo || 'NO'}}</p>
    </div>
  </div>
</template>

<script>
import TestSign from '../assets/signs/test-sign.svg'
window.componentsConfig = {    //左边是key值，右边是组件的引入路径
  'test-sign': '../assets/signs/test-sign.svg',
}

export default {
  name: "entranceGuideSign",
  components: {
    TestSign
  },
  data(){
    return{
      signStyle: 'test-sign',
      lightStyle: 'fluore',
      output: {
        outputWidth: 0,
        outputHeight: 0,
      },
      signInfo: {

      }
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
    UpdateSignData() {
      console.log("Under Construction")
    },
  }
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