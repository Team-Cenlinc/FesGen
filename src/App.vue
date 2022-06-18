<template>
  <div id="app">
    <HeaderFlex :title="titles"/>
    <div>

    </div>
    <SideTools @contentNeedRearrange="RequireRearrange" @switchViewer="updateViewer" ref="sideTools"/>
    <Signs v-if="signStyle === 'kitajuku-dentetsu'  && viewerType === ''" ref="signs"/>
    <EntranceGuideSign v-if="signStyle === 'test-sign'  && viewerType === ''" ref="entrancesSign"/>
    <Editor v-if="signStyle === 'kitajuku-dentetsu'  && viewerType === ''" @someChanged="UpdateData" @signChanged="UpdateSignStyle" @contentNeedRearrange="RequireRearrange"/>
    <EntranceGuideEditor v-if="signStyle === 'test-sign' && viewerType === ''" @someChanged="UpdateData" @signChanged="UpdateSignStyle"/>
    <DownloadViewer v-if="viewerType === 'download'" @switchViewer="updateViewer" ref="download"/>
    <UploadViewer v-if="viewerType === 'upload'" @switchViewer="updateViewer" ref="upload"/>
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
import DownloadViewer from "@/components/downloadViewer";
import UploadViewer from "@/components/uploadViewer";

export default {
  name: 'App',
  components: {HeaderFlex, FooterFlex, Signs, EntranceGuideSign, EntranceGuideEditor, SideTools, DownloadViewer, UploadViewer, Editor},
  data()  {
    return{
      titles: 'FesGen',
      signStyle: "kitajuku-dentetsu",
      viewerType: ""
      }
  },
  methods: {
    UpdateSignStyle(signStyle){
      this.signStyle = signStyle
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
    updateViewer(viewerType){
      sessionStorage.setItem("instanceSignStyle", this.signStyle)
      this.viewerType = viewerType
    },
  },
  beforeDestroy() {
    sessionStorage.clear()
  }
}
</script>

<style scoped>
p, h3 {
  display: flex;
  flex-direction: column;
  align-items: center;
}
SideTools {
  float: right;
}
</style>
