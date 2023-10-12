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
              <option value="FTA-guide">FTA 导视牌</option>
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
          <div class="form-min-row">
            <button @click="requestRearrange" class="button-alert">刷新数据</button>
            <button @click="resetData" class="button-danger">重置数据</button>
          </div>
        </div>
        <div>
          <h2><span class="material-symbols-outlined icon-editor">tune</span>FTA 车站牌: 全局设置</h2>
          <div class="form-min-row">
            <p>宽度</p>
            <div><input v-model="output.outputWidth" placeholder="600" min="0" @change="requestRearrange" type="number" value="600"> px</div>
          </div>
          <div class="form-min-row">
            <p>高度</p>
            <div><input v-model="output.outputHeight" placeholder="200" min="0" @change="requestRearrange" type="number" value="200"> px</div>
          </div>
          <div class="form-min-row">
            <p>字体颜色</p>
            <input v-model="signInfo.layoutInfo.textColor" @change="requestRearrange" type="color">
          </div>
          <div class="form-min-row">
            <p>线路名字体颜色</p>
            <input v-model="signInfo.layoutInfo.stationNameColor" @change="requestRearrange" type="color">
          </div>
          <div class="form-min-row">
            <p>背景颜色</p>
            <input v-model="signInfo.layoutInfo.backgroundColor" @change="requestRearrange" type="color">
          </div>
          <div class="form-min-row">
            <p>站名斜体</p>
            <input v-model="signInfo.signConfig.stationNameItalic" @change="requestRearrange" type="checkbox">
          </div>
          <div class="form-min-row">
            <p>信息精简化</p>
            <input v-model="signInfo.signConfig.simplifySign" @change="requestRearrange" type="checkbox">
          </div>
          <div class="form-min-row">
            <p>显示Logo</p>
            <input v-model="signInfo.logoInfo.enableLogo" @change="requestRearrange" type="checkbox">
          </div>
          <div v-if="signInfo.logoInfo.enableLogo" class="form-min-row">
            <p>Logo选项</p>
            <select v-model="signInfo.logoInfo.logoStyle" @change="requestRearrange">
              <option value="FTA-Logo-SUR">生存铁路</option>
              <option value="FTA-Logo-NLRR">北方大陆铁路</option>
              <option value="FTA-Logo-MLR">大都会联贯铁路</option>
              <option value="FTA-Logo-Lobby">大厅区域交通</option>
              <option value="FTA-Logo-PUAT">蒲塘桥都市区域交通</option>
              <option value="FTA-Logo-SUR-Reversed">生存铁路-反色</option>
              <option value="FTA-Logo-NLRR-Reversed">北方大陆铁路-反色</option>
              <option value="FTA-Logo-MLR-Reversed">大都会联贯铁路-反色</option>
              <option value="FTA-Logo-Lobby-Reversed">大厅区域交通-反色</option>
              <option value="FTA-Logo-PUAT-Reversed">蒲塘桥都市区域交通-反色</option>
            </select>
          </div>
        </div>
      </div>

      <div class="row">
        <div>
          <h2><span class="material-symbols-outlined icon-editor">info</span>本站信息</h2>
          <div class="form-min-row">
            <p>站名</p>
            <div><input v-model="signInfo.thisStation.nameMain" @change="requestRearrange" type="text"></div>
          </div>
          <div class="form-min-row">
            <p>站名 - 第二语言</p>
            <div><input v-model="signInfo.thisStation.nameSub" @change="requestRearrange" type="text"></div>
          </div>

        </div>
        <div>
          <h2><span class="material-symbols-outlined icon-editor">info</span>线路信息</h2>
          <div v-for="line in signInfo.lineInfo" :key="line.index" @change="requestRearrange">
            <div class="form-min-row">
              <p>线路名</p>
              <div><input v-model="line.name" type="text"></div>
            </div>
            <div class="form-min-row">
              <p>线路缩写</p>
              <div><input v-model="line.nameAbbr" type="text"></div>
            </div>
            <div class="form-min-row">
              <p>线路颜色</p>
              <div><input v-model="line.color" type="color"></div>
            </div>
            <div class="form-min-row line-info-form-end">
              <p>线路于本站的序号</p>
              <div><input v-model="line.stationNumber" type="number"></div>
            </div>
          </div>

          <div class="form-min-row">
            <p class="hint">"删除线路"操作将删除最后一个线路</p>
          </div>

          <div class="form-min-row">
            <p>线路操作</p>
            <input class="button" @click="addLine" value="  新增线路  " type="button">
            <input class="button" @click="delLine" value="  删除线路  " type="button">
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
        signConfig: {
          stationNameItalic: false,
          simplifySign: false,
        },
        layoutInfo: {
          backgroundColor: '#FFFFFF',
          textColor: '#000000',
          stationNameColor: '#FFFFFF',
        },
        thisStation: {
          nameMain: "主城湾",
          nameSub: "Spawn Bay",
        },
        logoInfo:{
          enableLogo: false,
          logoStyle: '',
        },
        lineInfo: [
          {
            name: "Waterside Line · 浦蓝线",
            nameAbbr: "WS",
            color: "#55CCFF",
            stationNumber: "01"
          },
        ]
      },
    }
  },
  mounted() {
    this.reloadCache()
    this.$emit('someChanged', this.lightStyle, this.signInfo, this.output)
    this.$emit("contentNeedRearrange", this.lightStyle, this.signInfo, this.output)
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
      sessionStorage.setItem("instanceConfigFTAStation", jsonData)
    },
    reloadCache() {
      if (sessionStorage.getItem("instanceConfigFTAStation") !== null) {
        let jsonData = JSON.parse(sessionStorage.getItem("instanceConfigFTAStation"))
          this.signInfo = jsonData.signInfo
          this.lightStyle = jsonData.lightStyle
          this.output = jsonData.output
          this.$emit('contentNeedRearrange', this.lightStyle, this.signInfo, this.output)
        }
    },
    resetData(){
      this.signInfo = {
        signConfig: {
          stationNameItalic: false,
          simplifySign: false,
        },
        layoutInfo: {
          backgroundColor: '#FFFFFF',
          textColor: '#000000',
          stationNameColor: '#FFFFFF',
        },
        thisStation: {
          nameMain: "主城湾",
          nameSub: "Spawn Bay",
        },
        logoInfo:{
          enableLogo: false,
          logoStyle: '',
        },
        lineInfo: [
          {
            name: "Waterside Line · 浦蓝线",
            nameAbbr: "WS",
            color: "#55CCFF",
            stationNumber: "01"
          },
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
    },
    addLine(){
      let randomNumber = Math.floor(Math.random() * 100)
      let randomColor = "#" + Math.floor(Math.random() * 16777215).toString(16)
      let randomChar = String.fromCharCode(65 + Math.floor(Math.random() * 26))
      this.signInfo.lineInfo.push({
        name: randomChar,
        nameAbbr: randomChar,
        color: randomColor,
        stationNumber: randomNumber
      })
      this.dataToJson()
      this.$emit('contentNeedRearrange', this.lightStyle, this.signInfo, this.output)
    },
    delLine(){
      this.signInfo.lineInfo.pop()
      this.dataToJson()
      this.$emit("beltDeleted", this.lightStyle, this.signInfo, this.output, this.signInfo.lineInfo.length)
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
  height: 22px;
  margin: 20px 0 10px 10px;
  border-bottom: 10px solid var(--editor-topic-highlight);
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

.line-info-form-end{
  border-bottom: 1px solid var(--editor-row-border);
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

.hint {
  font-weight: bold;
  height: 16px;
  border-bottom: 8px solid var(--global-alert);
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