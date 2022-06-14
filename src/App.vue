<template>
  <div id="app">
    <HeaderFlex :title="titles"/>
    <div>

    </div>
    <SideTools @contentNeedRearrange="RequireRearrange"/>
    <Signs v-if="signStyle === 'kitajuku-dentetsu'" ref="signs"/>
    <EntranceGuideSign v-if="signStyle === 'test-sign'" ref="entrancesSign"/>
    <Editor v-if="signStyle === 'kitajuku-dentetsu'" @someChanged="UpdateData" @signChanged="UpdateSignStyle" @contentNeedRearrange="RequireRearrange"/>
    <EntranceGuideEditor v-if="signStyle === 'test-sign'" @someChanged="UpdateData" @signChanged="UpdateSignStyle"/>
    <FooterFlex :title="titles"/>
  </div>
</template>

<script>
import HeaderFlex from './components/header'
import SideTools from "./components/sideTools";
import FooterFlex from './components/footer'
import Signs from "./components/sign"
import Editor from "@/components/editor"
import EntranceGuideSign from "./components/entranceGuideSign";
import EntranceGuideEditor from "@/components/entranceGuideEditor";

export default {
  name: 'App',
  components: {HeaderFlex, FooterFlex, Signs, EntranceGuideSign, EntranceGuideEditor, SideTools, Editor},
  data()  {
    return{
      titles: 'FesGen',
      signStyle: "kitajuku-dentetsu"
      }
  },
  methods: {
    UpdateSignStyle(signStyle){
      this.signStyle = signStyle
      console.log(signStyle)
    },
    UpdateData(lightStyle, signInfo, signScale){
      this.$refs.signs.UpdateData(signInfo, lightStyle, signScale)
    },
    RequireRearrange(lightStyle, signInfo, signScale){
      this.$refs.signs.RequireRearrange(lightStyle, signInfo, signScale)
    },
    entranceUpdateData(lightStyle, signInfo, signScale){
      this.$refs.entrancesSign.UpdateData(signInfo, lightStyle, signScale)
    },
  },
}
</script>

<style scoped>
p, h3 {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
