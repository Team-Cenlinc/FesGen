<template>
  <div id="editor" class="form">
    <div class="row">
      <div>
        <h2><span class="material-symbols-outlined icon-editor">palette</span> FesGen编辑器设置</h2>
        <div class="form-min-row">
          <p>站牌样式</p>
          <select v-model="signStyle" @change="sendSign">
            <option disabled value="">请选择</option>
            <option value="test-sign">测试用</option>
            <option value="kitajuku-dentetsu">北宿电铁</option>
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
          <p>站名汉字字符强调</p>
          <input v-model="signInfo.chnCharacterBold" @change="sendData" type="checkbox">
        </div>
      </div>
      <div>
        <h2><span class="material-symbols-outlined icon-editor">tune</span>「北宿电铁-站牌」全局设置</h2>
          <div class="form-min-row">
            <p>宽度</p>
            <div><input v-model="output.outputWidth" placeholder="600" @change="requestRearrange" type="number" value="600"> px</div>
          </div>
          <div class="form-min-row">
            <p>高度</p>
            <div><input v-model="output.outputHeight" placeholder="200" @change="requestRearrange" type="number" value="200"> px</div>
          </div>
        <div class="form-min-row">
          <p>边框大小</p>
          <div><input v-model="signInfo.frameThickness" placeholder="4" value='4' @change="requestRearrange" type="number"> px</div>
        </div>
        <div class="form-min-row">
          <p>显示行进方向箭头</p>
          <input v-model="signInfo.displayForwardArrow" checked="checked" @change="sendData" type="checkbox">
        </div>
        <div class="form-min-row">
          <p>反转左右信息</p>
          <input class="button" @click="reverseLeftRight" value="  反转左右信息  " type="button">
          <p>改变行进方向</p>
          <input class="button" @click="changeDirection" value="  改变行进方向  " type="button">
        </div>
      </div>
    </div>
    <div class="row">
      <div>
        <h2><span class="material-symbols-outlined icon-editor">info</span> 本站信息</h2>
          <div class="form-min-row">
            <p>站名 中文</p>
            <input v-model.lazy="signInfo.main.staNameChinese" @change="requestRearrange" type="text">
          </div>
          <div class="form-min-row">
            <p>站名 英语</p>
            <input v-model="signInfo.main.staNameEnglish" @change="sendData" type="text">
          </div>
          <div class="form-min-row">
            <p>站名 假名</p>
            <input v-model="signInfo.main.staNameKana" @change="sendData" type="text">
          </div>
        <div class="form-min-row">
          <p>本站编号</p>
          <input v-model="signInfo.middle.middleStaNumber" @change="sendData" type="number">
        </div>
          <div class="form-min-row">
            <p>字体颜色</p>
            <input v-model="signInfo.main.mainTextColor" @change="sendData" type="color">
          </div>
      </div>
      <div>
        <h2><span class="material-symbols-outlined icon-editor">info</span> 主要信息</h2>
        <div class="form-min-row">
          <p>线路颜色</p>
          <input v-model="signInfo.lineColor" @change="sendData" type="color">
        </div>
        <div class="form-min-row">
          <p>背景颜色</p>
          <input v-model="signInfo.backgroundColor" @change="sendData" type="color">
        </div>
        <div class="form-min-row">
          <p>线路名称</p>
          <input v-model="signInfo.middle.lineName" @change="requestRearrange" type="text">
        </div>
        <div class="form-min-row">
          <p>线路缩写</p>
          <input v-model="signInfo.middle.lineAbbr" @change="requestRearrange" type="text">
        </div>
        <div class="form-min-row">
          <p>[测试] 使用第二条色带</p>
          <input v-model="signInfo.secondLine.enable" @change="requestRearrange" type="checkbox">
        </div>
        <div v-if="signInfo.secondLine.enable" class="form-min-row">
          <p>第二条线路颜色</p>
          <input v-model="signInfo.secondLine.color" @change="sendData" type="color">
        </div>
      </div>
    </div>
    <div class="row">
      <div>
        <h2><span class="material-symbols-outlined icon-editor">info</span> 左侧站点信息</h2>
        <div class="form-min-row">
          <p>站名 中文</p>
          <input v-model="signInfo.left.leftStaNameChinese" value='锦冈' @change="requestRearrange" type="text">
        </div>
        <div class="form-min-row">
          <p>站名 英语</p>
          <input v-model="signInfo.left.leftStaNameEnglish" value='Nishikioka' @change="requestRearrange" type="text">
        </div>
        <div class="form-min-row">
          <p>站点编号</p>
          <input v-model="signInfo.left.leftStaNumber" value='04' @change="sendData" type="number">
        </div>
        <div class="form-min-row">
          <p>字体颜色</p>
          <input v-model="signInfo.left.leftTextColor" @change="sendData" type="color">
        </div>
      </div>
      <div>
        <h2><span class="material-symbols-outlined icon-editor">info</span> 右侧站点信息</h2>
        <div class="form-min-row">
          <p>站名 中文</p>
          <input v-model="signInfo.right.rightStaNameChinese" value='北宿' @change="requestRearrange" type="text">
        </div>
        <div class="form-min-row">
          <p>站名 英语</p>
          <input v-model="signInfo.right.rightStaNameEnglish" value='Hokuriku' @change="requestRearrange" type="text">
        </div>
        <div class="form-min-row">
          <p>站点编号</p>
          <input v-model="signInfo.right.rightStaNumber" value='02' @change="sendData" type="number">
        </div>
        <div class="form-min-row">
          <p>字体颜色</p>
          <input v-model="signInfo.right.rightTextColor" @change="sendData" type="color">
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "editor",
  data()  {
    return{
      signStyle: 'kitajuku-dentetsu',
      lightStyle: 'fluore',
      output: {
        outputWidth: 600,
        outputHeight: 200,
      },
      signInfo:{
        main: {
          staNameEnglish: 'Kaihin-Shukukai',
          staNameChinese: '海浜宿海',
          staNameKana: 'かいひんしゅくかい',
          mainTextColor: '#383838',
        },
        left: {
          leftStaNumber: '04',
          leftStaNameEnglish: 'Nishikioka',
          leftStaNameChinese: '錦岡',
          leftTextColor: '#383838',
        },
        middle: {
          lineName: '東海岸本線',
          lineAbbr: 'T',
          middleStaNumber: '03',
        },
        right: {
          rightStaNumber: '02',
          rightStaNameEnglish: 'Kitajuku',
          rightStaNameChinese: '北宿',
          rightTextColor: '#7A7A7A',
        },
        secondLine: {
          enable: false,
          color: '#A0D4E7',
        },
        lineColor: '#7297DD',
        backgroundColor: '#ECECEC',
        frameThickness: 4,
        displayForwardArrow: true,
        chnCharacterBold: false,
        direction: 'left',
      },
    }
  },
  methods :{
    sendData(){
      this.$emit('someChanged', this.lightStyle, this.signInfo, this.output)
    },
    sendSign(){
      this.$emit('signChanged', this.signStyle, this.lightStyle, this.signInfo, this.output)
    },
    requestRearrange(){
      this.$emit("contentNeedRearrange", this.lightStyle, this.signInfo, this.output)
    },
    changeDirection(){
      if (this.signInfo.direction === "left") {
        this.signInfo.direction = "right"
      } else if (this.signInfo.direction === "right") {
        this.signInfo.direction = "left"
      } else {
        this.signInfo.direction = "left"
      }

      this.$emit('contentNeedRearrange', this.lightStyle, this.signInfo, this.output)
    },
    reverseLeftRight(){
      let tempL
      let tempR
      tempL = this.signInfo.left.leftStaNameChinese
      tempR = this.signInfo.right.rightStaNameChinese
      this.signInfo.left.leftStaNameChinese = tempR
      this.signInfo.right.rightStaNameChinese = tempL
      tempL = this.signInfo.left.leftStaNameEnglish
      tempR = this.signInfo.right.rightStaNameEnglish
      this.signInfo.left.leftStaNameEnglish = tempR
      this.signInfo.right.rightStaNameEnglish = tempL
      tempL = this.signInfo.left.leftStaNumber
      tempR = this.signInfo.right.rightStaNumber
      this.signInfo.left.leftStaNumber = tempR
      this.signInfo.right.rightStaNumber = tempL
      tempL = this.signInfo.left.leftTextColor
      tempR = this.signInfo.right.rightTextColor
      this.signInfo.left.leftTextColor = tempR
      this.signInfo.right.rightTextColor = tempL

      this.$emit("contentNeedRearrange", this.lightStyle, this.signInfo, this.output)
    },
  },
}
</script>

<style scoped>
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

.button{
  border-radius: 30px;
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

.material-symbols-outlined{
   font-variation-settings:
       'FILL' 0,
       'wght' 400,
       'GRAD' 0,
       'opsz' 48
}

</style>