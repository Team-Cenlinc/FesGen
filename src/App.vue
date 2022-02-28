<template>
  <div id="app">
    <HeaderFlex :title="titles"/>
    <Signs ref="signs" :signStyle="signStyle" :signInfo="signInfo"/>
    <Editor @someChanged="UpdateData"/>
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
      lightStyle: String,
      output: {
        outputWidth: Number,
        outputHeight: Number,
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
    UpdateData(signStyle, lightStyle, signInfo, signScale){
      this.signStyle = signStyle
      this.lightStyle = lightStyle
      this.signInfo = signInfo
      this.output = signScale
      console.log(this.signStyle)
      this.$refs.signs.UpdateSign(signStyle, signInfo)
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
