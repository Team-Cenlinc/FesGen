<template>
  <div class="upload-viewer">
    <div class="canvas">

    </div>
    <div class="submission-form">
      <input class="file" type="file" draggable="true">
    </div>
    <div class="form">
      <div class="row">
        <div>
          <h2><span class="material-symbols-outlined icon-editor">done</span> 导入检查器</h2>
        </div>
        <div>
          <h2><span class="material-symbols-outlined icon-editor">ads_click</span> 操作与提示</h2>
          <div class="form-min-row">
            <p class="hint">导入检查器会自动检查提交的文件</p>
          </div>
        </div>
      </div>
    </div>
    <div class="return-to-previous-editor">
      <button @click="switchViewerReturn" class="material-symbols-outlined icon-return" title="返回编辑器">undo</button>
    </div>
  </div>
</template>

<script>
export default {
  name: "uploadViewer",
  data() {
    return {

    }
  },
  methods: {
    switchViewerReturn() {
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
  display: -webkit-flex; /* Safari */
  display: flex;
  align-content: center;
}

.canvas{

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

.form-min-row.action-button{
  display: -webkit-flex; /* Safari */
  display: flex;
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