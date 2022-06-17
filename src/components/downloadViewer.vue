<template>
  <div class="download-viewer">
    <div class="canvas">
      <canvas id="preview-sign-canvas" />
    </div>
    <div class="form">
      <div class="row">
        <div>
          <h2><span class="material-symbols-outlined icon-editor">tune</span> 导出设置</h2>
          <div class="form-min-row">
            <p>导出格式</p>
            <select v-bind:class="{'not-chose': this.fileType !== ''}" v-model="fileType">
              <option disabled value="">请选择</option>
              <option value="json">.json</option>
              <option value="png">.png</option>
              <option value="jpg">.jpg</option>
            </select>
          </div>
          <div class="form-min-row">
            <p>文件名</p>
            <div><input v-model="fileName" placeholder="请输入" type="text"></div>
          </div>
          <div class="form-min-row">
            <p>文件质量</p>
            <div><input v-model="fileQuality" max="100" type="range"></div>
          </div>
        </div>
        <div class="download-tools">
          <h2><span class="material-symbols-outlined icon-editor">done</span> 操作</h2>
          <div class="form-min-row">
            <p class="hint">在下载前，请确认您所需要的变更已执行并确认显示正确。</p>
            <p class="hint">若不正确，请返回并使用刷新以强制执行更改</p>
            <p class="hint">若无任何图像信息，请选择一种站牌样式或返回编辑器以编辑。</p>
          </div>
          <div class="form-min-row">
            <button @click="downloadItems" class="material-symbols-outlined icon-action">file_download</button>
            <button @click="switchViewerReturn" class="material-symbols-outlined icon-return" title="返回编辑器">undo</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "downloadViewer",
  data() {
    return {
      signStyle: "kitajuku-dentetsu",
      fileName: "",
      fileType: "",
      fileQuality: 1,
      jsonCache: {}
    }
  },
  methods: {
    switchViewerReturn() {
      this.$emit("switchViewer", "")
    },
    convertToCanvas() {
      let signElementId
      let signName = sessionStorage.getItem("instanceSignStyle")
      if (signName === "kitajuku-dentetsu") {
        signElementId = 'svg-sign'
      } else if (signName === "test-sign") {
        signElementId = 'sign-entrance'
      }
      let svgDom = document.getElementById(signElementId)
      let width = svgDom.getBBox().width
      let height = svgDom.getBBox().height
      let clonedSvgElements = svgDom.cloneNode(true)
      let outerHTML = clonedSvgElements.outerHTML,
          blob = new Blob([outerHTML], {type: 'image/svg+xml;charset=utf-8'});
      let URL = window.URL || window.webkitURL || window;
      let blobURL = URL.createObjectURL(blob);

      let image = new Image();
      image.onload = () => {
        let canvas = document.getElementById('preview-sign-canvas');
        canvas.width = width;
        canvas.height = height;
        let context = canvas.getContext('2d');
        context.drawImage(image, 0, 0, width, height);
      };
      image.src = blobURL;
    },
    downloadItems() {
      let fileQualityRanged = this.fileQuality / 100
      console.log(this.fileQuality)
      let canvas = document.getElementById("preview-sign-canvas");
      let png = canvas.toDataURL('image/png', fileQualityRanged);
      let jpeg = canvas.toDataURL('image/jpeg', fileQualityRanged);
      let json = this.configVersionModifier()
      let download = function (href, name) {
        let link = document.createElement('a');
        link.download = name;
        link.style.opacity = "0";
        document.body.append(link);
        link.href = href;
        link.click();
        link.remove();
      }
      let fileName
      if (this.fileName === "") {
        fileName = this.signStyle
      } else {
        fileName = this.fileName
      }

      if (this.fileType === "png") {
        download(png, fileName + ".png");
      } else if (this.fileType === "jpg") {
        download(jpeg, fileName + ".jpg");
      } else if (this.fileType === "json") {
        download(json, fileName + ".json")
      }
    },
    configVersionModifier(){
      let jsonConfig = JSON.parse(sessionStorage.getItem("instanceConfig"))
      jsonConfig.configVersion = "beta-v0.1.1"
      let data = JSON.stringify(jsonConfig)
      return 'data:text/csv;charset=utf-8,\ufeff' + encodeURIComponent(data)
    },
  }
}




</script>

<style scoped>

.download-viewer{
  max-width: 1000px;
  margin: 0 auto;
  padding: 10px 10px 300px 10px;
}

.canvas{
  margin: 30px auto 1px;
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.icon-return{
  padding: 10px;
  background-color: #ffffff;
  border-radius: 100%;
  border-style: none;
  box-shadow: 5px 5px 5px gray;
  transition: 225ms ease-out;
}

.icon-return:hover{
  background-color: gray;
  color: #ffffff;
}

.icon-action{
  float: right;
  padding: 10px;
  background-color: #ffffff;
  border-radius: 100%;
  border-style: none;
  box-shadow: 5px 5px 5px gray;
  transition: 225ms ease-out;
}

.icon-action:hover{
  background-color: gray;
  color: #ffffff;
}

.form {
  max-width: 1000px;
  margin: 0 auto;
  padding: 10px 10px;
}
.row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  border-top: 1px solid #9E9E9E;
  margin: 30px auto 30px;
}

.row h2 {
  border-bottom: 8px solid #a0d4e8;
  width: fit-content;
  height: 27px;
  margin: 20px 0 10px 10px;
}

input {
  border-top-style: none;
  border-left-style: none;
  border-right-style: none;
  border-bottom-width: 2px;
  border-bottom: #4e4e4e;
  background: #ffffff;
}

.hint {
  font-weight: bold;
  height: 16px;
  border-bottom: 8px solid #ffe58e;
}

.form-min-row {
  margin: 0;
  padding: 10px 20px 10px 10px;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
}

.not-chose{

}

.material-symbols-outlined{
  font-variation-settings:
      'FILL' 0,
      'wght' 400,
      'GRAD' 0,
      'opsz' 48
}

</style>