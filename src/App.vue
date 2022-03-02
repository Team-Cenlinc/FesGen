<template>
  <div id="app">
    <HeaderFlex :title="titles"/>
    <Signs ref="signs"/>
      <h3>Data from editor.vue -> App.vue:</h3>
    <Editor @someChanged="UpdateData" @signChanged="UpdateSign"/>
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
  methods: {
    UpdateSign(signStyle, lightStyle, signInfo, signScale){
      this.$refs.signs.UpdateSign(signStyle)
      this.UpdateData(lightStyle, signInfo, signScale)
    },
    UpdateData(lightStyle, signInfo, signScale){

      this.$refs.signs.UpdateData(signInfo, lightStyle, signScale)
    },
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
