<template>
  <div class="upload-viewer">
    <div class="canvas">

    </div>
    <div class="submission-form" id="drop-area">
      <input class="file" type="file" draggable="true" id="input-file">
      <label v-if="!this.dropActive" id="label-file" for="input-file" draggable="true"><span class="material-symbols-outlined icon-upload">cloud_upload</span><br>请选择1个文件以上传</label>
      <label v-if="this.dropActive" id="drag-file"><span class="material-symbols-outlined icon-upload">cloud_upload</span><br>将文件拖到此处</label>
    </div>
    <div class="form">
      <div class="row">
        <div>
          <h2><span class="material-symbols-outlined icon-editor">done</span>导入检查器</h2>
          <div class="form-min-row">
            <p v-if="this.correctFormat">文件格式</p>
            <p class="danger"  v-if="!this.correctFormat">错误的格式文件格式</p>
            <input v-model="this.correctFormat" type="checkbox" disabled="disabled">
          </div>
        </div>
        <div>
          <h2><span class="material-symbols-outlined icon-editor">ads_click</span>操作与提示</h2>
          <div class="form-min-row">
            <p v-if="this.wrongFileCount" class="danger">请上传 1 个文件！</p>
            <p v-if="this.completeness" class="danger">文件不完整！</p>
          </div>
          <div class="form-min-row">
            <p class="hint">导入检查器会自动检查提交的文件</p>
            <p class="hint">检查器检查完毕后请检查是否为上传的文件</p>
            <p class="hint">若正确请点击按钮以跳转</p>
          </div>
          <div class="form-min-row">
            <button v-bind:disabled="!this.completeness && !this.correctFormat" @click="switchStyle" class="material-symbols-outlined icon-action" title="导入">input</button>
            <button @click="switchViewerReturn" class="material-symbols-outlined icon-action" title="返回编辑器">undo</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "uploadViewer",
  data() {
    return {
      sign: '',
      dropActive: false,
      correctFormat: false,
      completeness: false,
      wrongFileCount: false
    }
  },
  mounted() {
    let dropArea = document.getElementById('drop-area')
    dropArea.addEventListener('drop', this.dropEvent, false)
    dropArea.addEventListener('dragleave', (e) => {
      e.stopPropagation()
      e.preventDefault()
      this.dropActive = false
    })
    dropArea.addEventListener('dragenter', (e) => {
      e.stopPropagation()
      e.preventDefault()
      this.dropActive = true
    })
    dropArea.addEventListener('dragover', (e) => {
      e.stopPropagation()
      e.preventDefault()
      this.dropActive = true
    })
  },
  methods: {
    switchViewerReturn() {
      this.$emit("switchViewer", "")
    },
    dropEvent(e) {
      this.dropActive = false
      e.stopPropagation()
      e.preventDefault()
      this.checkFile(e.dataTransfer.files)
    },
    checkFile(file) {
      if (file.length >= 2) {
        this.wrongFileCount = true
      } else {
        this.wrongFileCount = false
        let fileName = file[0].name
        const fileParted = fileName.split('.')
        let suffix = fileParted[fileParted.length - 1]
        if (suffix === "json") {
          this.correctFormat = true
          let fileJson = file[0]
          let reader = new FileReader()
          reader.readAsText(fileJson, "utf-8")
          reader.onload = function () {
            let jsonObj = JSON.parse(this.result)
            try {
              let configVersion = jsonObj.configVersion
              if (configVersion === "beta-v0.1.1") {
                if (jsonObj.signStyle === "kitajuku-dentetsu") {
                  sessionStorage.setItem("instanceConfig", this.result)
                } else if (jsonObj.signStyle === "test-sign") {
                  sessionStorage.setItem("instanceConfigEntrance", this.result)
                }
                sessionStorage.setItem("instanceSignStyle", jsonObj.signStyle)
              }
              this.completeness = true
            } catch (error) {
              this.completeness = false
            }
          }
        } else {
          this.correctFormat = false
        }
      }
    },
    switchStyle() {
      this.$emit("switchStyle", sessionStorage.getItem("instanceSignStyle"))
      this.$emit("switchViewer", "")
    }
  }
}


</script>

<style scoped>

.upload-viewer{
  max-width: 1000px;
  margin: 0 auto;
  padding: 10px 10px 300px 10px;
}

.submission-form{
  margin: 50px auto 1px;
  display: -webkit-flex; /* Safari */
  display: flex;
  flex-direction: column;
  align-items: center;
}

.canvas{

}

input[type="file"] {
  width: 0;
  height: 0;
  opacity: 0;
  overflow: hidden;
  position: absolute;
  z-index: -1;
}

#input-file + label {
  padding: 20px 100px;
  background-color: #ffffff;
  transition: 225ms ease-out;
  text-align: center;
  border-radius: 5px;
}

#input-file:focus + label,
#input-file + label:hover {
  background-color: #737373;
  color: white;
}

#drag-file {
  padding: 20px 150px;
  background-color: #ffffff;
  border-style: double;
  transition: 225ms ease-out;
  text-align: center;
  border-radius: 5px;
}

.icon-action{
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

span.icon-upload {
  margin: -10px 0 0 0;
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

.alert{
  font-weight: bold;
  height: 16px;
  border-bottom: 8px solid #ffe58e;
}

.danger {
  font-weight: bold;
  height: 16px;
  border-bottom: 8px solid #ff5858;
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

.material-symbols-outlined {
  font-variation-settings:
      'FILL' 0,
      'wght' 300,
      'GRAD' 0,
      'opsz' 40
}

</style>