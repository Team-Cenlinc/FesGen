<template>
  <div id="canvas">
    <component :is="signStyles" ref="svg"></component>
    <h3>Data from editor.vue -> App.vue -> sign.vue :</h3>
    <p>{{ signStyles || '你尚未选择'}}</p>
    <h3>Data from sign.vue :</h3>
    <input type="text" value="EkiName" v-model.lazy="ekiName" @change="svgChangeTest"/>
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
  methods: {
    svgChangeTest() {
      const dom = this.$refs.svg.querySelector("#MID-kanji-text");
      dom.innerHTML = this.ekiName;
    },
  },
  data(){
    return{
      ekiName: "EkiNameHere",
    }
  },
  props: {
    signStyles: String,
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
