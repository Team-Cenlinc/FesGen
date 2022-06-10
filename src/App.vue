<template>
  <div id="app">
    <HeaderFlex :title="titles"/>
    <Signs ref="signs"/>
    <Editor @someChanged="UpdateData" @signChanged="UpdateSignStyle" @contentNeedRearrange="RequireRearrange"/>
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
    UpdateSignStyle(signStyle){
      this.$refs.signs.UpdateSignStyle(signStyle)
    },
    UpdateData(lightStyle, signInfo, signScale){
      this.$refs.signs.UpdateData(signInfo, lightStyle, signScale)
    },
    RequireRearrange(lightStyle, signInfo, signScale){
      this.$refs.signs.RequireRearrange(lightStyle, signInfo, signScale)
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
