<template>
  <div class="download-viewer">
    <div class="canvas">
      <canvas id="preview-sign-canvas" />
    </div>
    <div class="form">
      <div class="row">
        <div>
          <h2><span class="material-symbols-outlined icon-editor">tune</span>导出设置</h2>
          <div class="form-min-row">
            <p>导出格式</p>
            <select v-bind:class="{'not-chose': this.fileType === ''}" v-model="fileType">
              <option disabled value="">请选择</option>
              <option value="json">.json</option>
              <option value="png">.png</option>
              <option value="jpg">.jpg</option>
            </select>
          </div>
          <div class="form-min-row">
            <p>文件名</p>
            <input v-model="fileName" placeholder="请输入" type="text">
          </div>
          <div class="form-min-row" v-if="this.fileType !== 'json' || ''">
            <p>文件质量</p>
            <input v-model="fileQuality" max="100" min="0" type="range">
            <input v-model="fileQuality" max="100" min="0" type="number">
          </div>
        </div>
        <div class="download-tools">
          <h2><span class="material-symbols-outlined icon-editor">ads_click</span>操作</h2>
          <div class="form-min-row">
            <p class="hint">在下载前，请确认您所需要的变更已执行并确认显示正确。</p>
            <p class="hint">若不正确，请返回并使用刷新以强制执行更改</p>
            <p class="hint">若无任何图像信息，请选择一种站牌样式或返回编辑器以编辑。</p>
          </div>
          <div class="form-min-row action-button">
            <button v-bind:disabled="this.fileType === ''" @click="downloadItems" class="material-symbols-outlined icon-action" title="下载文件">cloud_download</button>
            <button @click="switchViewerReturn" class="material-symbols-outlined icon-action" title="返回编辑器">undo</button>
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
      fileQuality: 100,
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
      } else if (signName === 'FTA-station') {
        signElementId = 'svg-sign-FTA-station'
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
        fileName = sessionStorage.getItem("instanceSignStyle")
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
      let signName = sessionStorage.getItem("instanceSignStyle")
      let configKey
      if (signName === "kitajuku-dentetsu") {
        configKey = "instanceConfig"
      } else if (signName === "test-sign") {
        configKey = "instanceConfigEntrance"
      } else if (signName === 'FTA-station') {
        configKey = "instanceConfigFTAStation"
      }
      let jsonConfig = JSON.parse(sessionStorage.getItem(configKey))
      jsonConfig.configVersion = "beta-v0.1.1"
      let data = JSON.stringify(jsonConfig)
      return 'data:text/csv;charset=utf-8,\ufeff' + encodeURIComponent(data)
    },
  }
}




</script>

<style scoped>

.download-viewer{
  color: var(--editor-selector-color);
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

.form-min-row.action-button{
  display: -webkit-flex; /* Safari */
  display: flex;
}

.icon-action{
  padding: 10px;
  background-color: var(--editor-selector-bg-color);
  color: var(--editor-selector-color);
  border-radius: 100%;
  border-style: none;
  box-shadow: 5px 5px 5px var(--tool-icon-shade-color);
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
  border-top: 1px solid var(--editor-row-border);
  margin: 30px auto 30px;
}

.row h2 {
  border-bottom: 8px solid var(--editor-topic-highlight);
  width: fit-content;
  height: 27px;
  margin: 20px 0 10px 10px;
}

input {
  background: var(--editor-selector-bg-color);
  color: var(--editor-selector-color);
  border-style: none;
}

input[type="text"] {
  padding: 5px;
  border-radius: 3px;
}

input[type="number"] {
  padding: 5px;
  border-radius: 3px;
}

input[type="range"] {
  border-style: none;
  color: var(--file-range-color);
}

select {
  padding: 5px;
  background: var(--editor-selector-bg-color);
  color: var(--editor-selector-color);
  border-radius: 3px;
}

.hint {
  font-weight: bold;
  height: 16px;
  border-bottom: 8px solid var(--global-alert);
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
  border-color: #ff0000;
}

.material-symbols-outlined{
  font-variation-settings:
      'FILL' 0,
      'wght' 400,
      'GRAD' 0,
      'opsz' 48
}

</style>