<template>
  <div class="download-viewer">
    <button @click="convertToPng">测试</button>
    <div class="canvas">
      <canvas id="preview-sign-canvas" />
    </div>
    <div class="return-to-previous-editor">
      <button @click="switchViewerReturn" class="material-symbols-outlined icon-return" title="返回编辑器">undo</button>
    </div>
  </div>
</template>

<script>
import {Canvg} from 'canvg'

export default {
  name: "downloadViewer",
  data() {
    return {
    }
  },
  methods: {
    switchViewerReturn() {
      this.$emit("switchViewer", "")
    },
    convertToCanvas() {
      let svgXml = new XMLSerializer().serializeToString(document.getElementById("svg-sign"));
      console.log(svgXml);
      let canvas = document.getElementById("preview-sign-canvas");
      let ctx = canvas.getContext('2d')
      Canvg.from(ctx, svgXml);
    },
    convertToPng() {
      let canvas = document.getElementById("preview-sign-canvas");
      let ahref = document.createElement("a");
      ahref.href = canvas.toDataURL("image/png");
      ahref.download = "exportPng";
    }
  }
}


</script>

<style scoped>

.canvas{
  padding: 500px;
}

.icon-return{
  margin: -65px 15px;
  float: right;
  padding: 10px;
  background-color: #ffffff;
  border-radius: 100%;
  border-style: none;
  box-shadow: 5px 5px 5px gray;
  transform: scale(125%, 125%);
  transition: 225ms ease-out;
}

.icon-return:hover{
  background-color: gray;
  color: #ffffff;
}

.material-symbols-outlined {
  font-variation-settings:
      'FILL' 0,
      'wght' 300,
      'GRAD' 0,
      'opsz' 40
}

</style>