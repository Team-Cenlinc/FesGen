<template>
  <div id="app">
    <HeaderFlex :title="titles"/>
    <Signs :signStyles="signStyle" :sign="sign"/>
      <h3>Data from editor.vue -> App.vue:</h3>
    <div class="data">
      <p>{{ signStyle || '你尚未选择'}}</p>
      <p>{{ output || ''}}</p>
    </div>
    <div class="data">
      <p>{{ signInfo || ''}}</p>
    </div>
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
    updateData(signStyle, signInfo, signScale){
      this.signStyle = signStyle
      this.signInfo = signInfo
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
