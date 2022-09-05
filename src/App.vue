<template>
  <div id="app">
    <HeaderFlex :title="titles"/>
    <div>

    </div>
    <SideTools @contentNeedRearrange="{RequireRearrange, stationFTARearrangement, guideSignFTAUpdateData}" @switchViewer="updateViewer" ref="sideTools"/>
    <Signs v-if="signStyle === 'kitajuku-dentetsu'  && viewerType === ''" ref="signs"/>
    <EntranceGuideSign v-if="signStyle === 'test-sign'  && viewerType === ''" ref="entrancesSign"/>
    <StationSignFTA v-if="signStyle === 'FTA-station'  && viewerType === ''" ref="stationSignFTA"/>
    <GuideSignFTA v-if="signStyle === 'FTA-guide'  && viewerType === ''" ref="guideSignFTA"/>
    <Editor v-if="signStyle === 'kitajuku-dentetsu'  && viewerType === ''" @someChanged="UpdateData" @signChanged="UpdateSignStyle" @contentNeedRearrange="RequireRearrange"/>
    <EntranceGuideEditor v-if="signStyle === 'test-sign' && viewerType === ''" @someChanged="entranceUpdateData" @signChanged="UpdateSignStyle" @contentNeedRearrange="entranceRearrangement"/>
    <StationSignFTAEditor v-if="signStyle === 'FTA-station' && viewerType === ''" @someChanged="stationFTAUpdateData"
                          @signChanged="UpdateSignStyle" @contentNeedRearrange="stationFTARearrangement" @beltDeleted="delBeltFTA"/>
    <GuideSignFTAEditor v-if="signStyle === 'FTA-guide' && viewerType === ''" @signChanged="UpdateSignStyle" @contentChanged="guideSignFTAUpdateData"/>
    <DownloadViewer v-if="viewerType === 'download'" @switchViewer="updateViewer" ref="download"/>
    <UploadViewer v-if="viewerType === 'upload'" @switchViewer="updateViewer" @switchStyle="UpdateSignStyle" ref="upload"/>
    <FooterFlex :title="titles"/>
  </div>
</template>

<script>
import HeaderFlex from './components/header'
import SideTools from "./components/sideTools";
import FooterFlex from './components/footer'
import Signs from "./components/signs/sign"
import Editor from "@/components/signs/editor"
import EntranceGuideSign from "./components/signs/entranceGuideSign";
import EntranceGuideEditor from "@/components/signs/entranceGuideEditor";
import DownloadViewer from "@/components/files/downloadViewer";
import UploadViewer from "@/components/files/uploadViewer";
import StationSignFTA from "@/components/signs/stationSignFTA";
import StationSignFTAEditor from "@/components/signs/stationSignFTAEditor";
import GuideSignFTA from "@/components/signs/guideSignFTA";
import GuideSignFTAEditor from "@/components/signs/guideSignFTAEditor";

export default {
  name: 'App',
  components: {
    StationSignFTA, StationSignFTAEditor, GuideSignFTA, GuideSignFTAEditor,
    HeaderFlex, FooterFlex, Signs, EntranceGuideSign, EntranceGuideEditor, SideTools, DownloadViewer, UploadViewer, Editor},
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
    entranceRearrangement(lightStyle, signInfo, signScale){
      this.$refs.entrancesSign.RequireRearrange(lightStyle, signInfo, signScale)
    },
    stationFTAUpdateData(lightStyle, signInfo, signScale){
      this.$refs.stationSignFTA.UpdateData(signInfo, lightStyle, signScale)
    },
    stationFTARearrangement(lightStyle, signInfo, signScale){
      this.$refs.stationSignFTA.RequireRearrange(lightStyle, signInfo, signScale)
    },
    delBeltFTA(lightStyle, signInfo, signScale, index){
      this.$refs.stationSignFTA.removeBelt(lightStyle, signInfo, signScale, index)
    },
    guideSignFTAUpdateData(signInfo, lightStyle, signScale){
      console.log("reached")
      this.$refs.guideSignFTA.UpdateData(signInfo, lightStyle, signScale)
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
