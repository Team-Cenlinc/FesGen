<template>
  <div id="editor" class="form">
    <div id="editor" class="form">

      <div class="row">
        <div>
          <h2><span class="material-symbols-outlined icon-editor">palette</span>FesGen编辑器设置</h2>
          <div class="form-min-row">
            <p>站牌样式</p>
            <select v-model="signStyle" @change="sendSign">
              <option disabled value="">请选择</option>
              <option value="test-sign">测试用</option>
              <option value="kitajuku-dentetsu">北宿电铁</option>
              <option value="FTA-station">FTA 车站牌</option>
            </select>
          </div>
          <div class="form-min-row">
            <p>灯光效果</p>
            <select v-model="lightStyle" @change="sendData">
              <option value="none">无</option>
              <option value="fluore">荧光灯</option>
              <option value="led">LED</option>
            </select>
          </div>
        </div>
        <div>
          <h2><span class="material-symbols-outlined icon-editor">tune</span>北宿电铁-站牌: 全局设置</h2>
          <div class="form-min-row">
            <p>宽度</p>
            <div><input v-model="output.outputWidth" placeholder="600" min="0" @change="requestRearrange" type="number" value="600"> px</div>
          </div>
          <div class="form-min-row">
            <p>高度</p>
            <div><input v-model="output.outputHeight" placeholder="200" min="0" @change="requestRearrange" type="number" value="200"> px</div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
export default {
  name: "StationSignFTAEditor",
  data() {
    return {
      signStyle: 'FTA-station',
      lightStyle: 'fluore',
      output: {
        outputWidth: 600,
        outputHeight: 200,
      },
      signInfo: {
        thisStation: {
          nameMain: "壑湖",
          nameSub: "Horhuu / Lake He",
        },
        lineInfo: [
          {
            name: "Waterside Line · 浦蓝线",
            color: "#55CCFF",
            stationNumber: "04"
          },
          {
            name: "Discover Line · 探索线",
            color: "#F8B62D",
            stationNumber: "08"
          }
        ]
      }
    }
  },
  mounted() {
    this.reloadCache()
    this.dataToJson()
  },
  methods: {
    sendData(){
      this.dataToJson()
      this.$emit('someChanged', this.lightStyle, this.signInfo, this.output)
    },
    sendSign(){
      this.dataToJson()
      this.$emit('signChanged', this.signStyle, this.lightStyle, this.signInfo, this.output)
    },
    requestRearrange(){
      this.dataToJson()

      this.$emit("contentNeedRearrange", this.lightStyle, this.signInfo, this.output)
    },
    dataToJson(){
      let jsonData = JSON.stringify(this.$data);
      sessionStorage.setItem("instanceConfigEntrance", jsonData)
    },
    reloadCache() {
      if (sessionStorage.getItem("instanceConfigEntrance") !== null) {
        let jsonData = JSON.parse(sessionStorage.getItem("instanceConfigEntrance"))
        if (jsonData.signStyle === "test-sign") {
          this.signInfo = jsonData.signInfo
          this.signStyle = jsonData.signStyle
          this.lightStyle = jsonData.lightStyle
          this.output = jsonData.output
          this.$emit('contentNeedRearrange', this.lightStyle, this.signInfo, this.output)
        }
      }
    },
    resetData(){
      this.signInfo = {
        thisStation: {
          nameMain: "壑湖",
          nameSub: "Horhuu / Lake He",
        },
        lineInfo: [
          {
            name: "Waterside Line · 浦蓝线",
            color: "#55CCFF",
            stationNumber: "04"
          },
          {
            name: "Discover Line · 探索线",
            color: "#F8B62D",
            stationNumber: "08"
          }
        ]
      }
      this.signStyle = "FTA-station"
      this.lightStyle = "fluore"
      this.output = {
        outputWidth: 600,
        outputHeight: 200,
      }
      this.dataToJson()
      this.$emit('contentNeedRearrange', this.lightStyle, this.signInfo, this.output)
    }
  }
}
</script>

<style scoped>
.form {
  color: var(--editor-selector-color);
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
  width: fit-content;
  height: 27px;
  margin: 20px 0 10px 10px;
  border-bottom: 8px solid var(--editor-topic-highlight);
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

input[type="color"] {
  background: transparent;
}

input[type="button"] {
  border-radius: 3px;
}

select {
  padding: 5px;
  background: var(--editor-selector-bg-color);
  color: var(--editor-selector-color);
  border-style: none;
  border-radius: 3px;
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

.button{
  height: 30px;
  width: 100px;
  border-radius: 3px;
  border-width: 0;
  transition: 200ms ease-out;
  margin: 5px;
  background-color: var(--editor-selector-bg-color);
  color: var(--editor-selector-color);
}

.button:hover{
  background-color: #565656;
  color: rgb(255, 255, 255)
}

.button-alert{
  height: 40px;
  width: 120px;
  font-size: 19px;
  border-width: 0;
  border-radius: 3px;
  border-bottom: 5px solid var(--global-alert);
  transition: 200ms ease-out;
  color: var(--editor-selector-color);
  background-color: var(--editor-selector-bg-color);
}
.button-alert:hover{
  background-color: var(--global-alert);
  color: var(--editor-selector-color);
}

.button-danger{
  height: 40px;
  width: 120px;
  font-size: 19px;
  border-width: 0;
  border-radius: 3px;
  border-bottom: 5px solid var(--global-danger);
  transition: 200ms ease-out;
  color: var(--editor-selector-color);
  background-color: var(--editor-selector-bg-color);
}
.button-danger:hover{
  background-color: var(--global-danger);
  color: var(--editor-selector-color);
}

.material-symbols-outlined{
  margin-right: 4px;
  transform: translateY(3px);
  font-variation-settings:
      'FILL' 0,
      'wght' 400,
      'GRAD' 0,
      'opsz' 48
}
</style>