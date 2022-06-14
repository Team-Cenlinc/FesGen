<template>
  <div class="side-tools" v-bind:class="{solid: isSolid}">
    <div class="to-header" v-bind:class="{visible: isVisible}" >
      <button @click="scrollToTop" class="material-symbols-outlined side-tools-topic" title="返回标题">keyboard_double_arrow_up</button>
    </div>
    <div class="sync" v-bind:class="{position: !isVisible}">
      <button @click="requestRearrange" class="material-symbols-outlined side-tools-topic" title="重置信息">sync</button>
    </div>
    <div class="files">
      <button @click="hiddenTrigger" class="material-symbols-outlined side-tools-topic" title="文件管理">folder_open</button>
      <ul v-bind:class="{visible: status_clicked}">
        <li><button @click="switchViewerDownload" class="material-symbols-outlined side-tools-content" title="下载文件">download</button></li>
        <li><button @click="switchViewerUpload" class="material-symbols-outlined side-tools-content" title="上传文件">upload</button></li>
      </ul>
    </div>
  </div>
</template>

<script>
import Sign from "@/components/sign.vue"

export default {
  name: "sideTools",
  data() {
    return{
      status_clicked: false,
      isSolid: false,
      isVisible: false,
    }
  },
  mounted() {
    window.addEventListener("scroll", this.handleScroll)
  },
  methods: {
    handleScroll() {
      let scrollOffset = window.scrollY
      let flag
      if (scrollOffset >= 70) {
        flag = "on"
        this.solidTrigger(flag)
      } else if (scrollOffset < 70) {
        flag = "off"
        this.solidTrigger(flag)
      }
    },
    solidTrigger(flag) {
      let solidStatus = this.isSolid
      if (solidStatus === false && flag === "on") {
        this.isVisible = true
        this.isSolid = true
      } else if (solidStatus === true && flag === "off") {
        this.isVisible = false
        this.isSolid = false
      }
    },
    hiddenTrigger() {
      console.log("triggered")
      this.status_clicked = !this.status_clicked;
    },
    requestRearrange() {
      this.$emit("contentNeedRearrange", Sign.data().lightStyle, Sign.data().signInfo, Sign.data().output)
    },
    scrollToTop() {
      let time;
      let step = document.documentElement.scrollTop;
      time = window.setInterval(function () {
        step -= 20;
        if (step <= 0) {
          window.clearInterval(time);
        }
        window.scrollTo(0, step);
      }, 10);
    },
    switchViewerDownload() {
      this.$emit("switchViewer", "download")
    },
    switchViewerUpload() {
      this.$emit("switchViewer", "upload")
    }
  },
  beforeDestroy() {
    window.removeEventListener("scroll", this.handleScroll);
  }
}
</script>

<style scoped>

.side-tools{
  justify-content: flex-end;
  margin: 15px;
  display: -webkit-flex; /* Safari */
  display: flex;
  flex-direction: column;
  position: fixed;
}

.files{
  margin: 0 0 30px 0;
}

.side-tools.solid{
  position: fixed;
  margin: -50px 15px 0 15px;
}

.side-tools button.side-tools-topic{
  margin: 0 0 15px 0;
  padding: 10px;
  background-color: #ffffff;
  border-radius: 100%;
  border-style: none;
  box-shadow: 5px 5px 5px gray;
  transform: scale(125%, 125%);
  transition: 225ms ease-out;
}

.side-tools button.side-tools-content{
  margin: -3px 0 8px 0;
  padding: 10px;
  background-color: #ffffff;
  border-radius: 100%;
  border-style: none;
  box-shadow: 5px 5px 5px gray;
  transform: scale(100%, 100%);
  flex-direction: column;
  transition: 225ms ease-out;
}

.side-tools button.side-tools-topic:hover{
  background-color: gray;
  color: #ffffff;
}

.side-tools button.side-tools-content:hover{
  background-color: gray;
  color: #ffffff;
}

.to-header {
  visibility: hidden;
}

.visible {
  visibility: visible;
}

.position {
  margin: -60px 0 0 0;
}

ul{
  visibility: hidden;
  list-style: none;
}

.material-symbols-outlined {
  font-variation-settings:
      'FILL' 0,
      'wght' 300,
      'GRAD' 0,
      'opsz' 40
}

</style>