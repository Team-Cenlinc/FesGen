<template>
  <div class="download-viewer">
    <div class="canvas">

    </div>
    <div class="return-to-previous-editor">
      <button @click="switchViewerReturn" class="material-symbols-outlined icon-return" title="返回编辑器">undo</button>
    </div>
  </div>
</template>

<script>
export default {
  name: "downloadViewer",
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