<template>
  <div id="app">
    <HeaderFlex :title="titles"/>
    <Signs :signStyles="signStyle" :sign="sign"/>
      <h3>Data from editor.vue -> App.vue:</h3>
      <p>{{ signStyle || '你尚未选择'}}</p>
      <p>{{ sign || '你尚未输入有关标识信息'}}</p>
      <p>{{ output || '你尚未输入有关输出信息'}}</p>
    <Editor @someChanged="updateData"/>
    <FooterFlex :title="titles"/>
  </div>
</template>

<script>
import HeaderFlex from './components/header'
import FooterFlex from './components/footer'
import Signs from "./components/sign"
import Editor from "@/components/editor"

export default {
  name: 'App',
  components: {HeaderFlex, FooterFlex, Signs, Editor},
  data()  {
    return{
      titles: 'FesGen',
    }
  },
  props: {
      signStyle: String,
      output: {
        outputWidth: Number,
        outputHeight: Number,
        lightStyle: String,
      },
      sign:{
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
    updateData(signStyle, signInfo, signScale){
      this.signStyle = signStyle
      this.sign = signInfo
      this.output = signScale
      console.log(this.signStyle)
    }
  }
}
</script>

<style scoped>
p, h3 {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
