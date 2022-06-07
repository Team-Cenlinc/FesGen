<template>
  <div id="editor" class="form">
    <div class="row">
      <div>
        <h2>整体调整</h2>
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
          <p>边框大小</p>
          <input v-model="signInfo.frameThickness" value='2' @change="sendData" type="number">
        </div>
        <div class="form-min-row">
          <p>显示行进方向箭头</p>
          <input v-model="signInfo.displayForwardArrow" checked="checked" value=true @change="sendData" type="checkbox">
        </div>
        <div class="form-min-row">
          <p>反转左右信息</p>
          <input value="反转" @change="reverseLeftRight" type="button">
        </div>
      </div>
      <div>
        <h2>站牌大小</h2>
          <div class="form-min-row">
            <p>宽度</p>
            <div><input v-model="output.outputWidth" @change="sendData" type="number" value="2160"> px</div>

          </div>
          <div class="form-min-row">
            <p>高度</p>
            <div><input v-model="output.outputHeight" @change="sendData" type="number" value="720"> px</div>

          </div>
      </div>
    </div>
    <div class="row">
      <div>
        <h2>本站名</h2>
          <div class="form-min-row">
            <p>站名 中文</p>
            <input v-model.lazy="signInfo.main.staNameChinese" @change="sendData" type="text">
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
            <p>字体颜色</p>
            <input v-model="signInfo.main.textColor" @change="sendData" type="color">
          </div>
      </div>
      <div>
        <h2>主要信息</h2>
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
          <input v-model="signInfo.middle.lineName" @change="sendData" type="text">
        </div>
        <div class="form-min-row">
          <p>线路缩写</p>
          <input v-model="signInfo.middle.lineAbbr" @change="sendData" type="text">
        </div>
        <div class="form-min-row">
          <p>本站编号</p>
          <input v-model="signInfo.middle.middleStaNumber" type="Number">
        </div>
      </div>
    </div>
    <div class="row">
      <div>
        <h2>左侧站点信息</h2>
        <div class="form-min-row">
          <p>站名 中文</p>
          <input v-model="signInfo.left.leftStaNameChinese" value='锦冈' @change="sendData" type="text">
        </div>
        <div class="form-min-row">
          <p>站名 英语</p>
          <input v-model="signInfo.left.leftStaNameEnglish" value='Nishikioka' @change="sendData" type="text">
        </div>
        <div class="form-min-row">
          <p>站点编号</p>
          <input v-model="signInfo.left.leftStaNumber" value='04' @change="sendData" type="number">
        </div>
        <div class="form-min-row">
          <p>字体颜色</p>
          <input v-model="signInfo.left.textColor" @change="sendData" type="color">
        </div>
      </div>
      <div>
        <h2>右侧站点信息</h2>
        <div class="form-min-row">
          <p>站名 中文</p>
          <input v-model="signInfo.right.rightStaNameChinese" value='北宿' @change="sendData" type="text">
        </div>
        <div class="form-min-row">
          <p>站名 英语</p>
          <input v-model="signInfo.right.rightStaNameEnglish" value='Hokuriku' @change="sendData" type="text">
        </div>
        <div class="form-min-row">
          <p>站点编号</p>
          <input v-model="signInfo.right.rightStaNumber" value='02' @change="sendData" type="number">
        </div>
        <div class="form-min-row">
          <p>字体颜色</p>
          <input v-model="signInfo.right.textColor" @change="sendData" type="color">
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
        outputWidth: 620,
        outputHeight: 220,
      },
      signInfo:{
        main: {
          staNameEnglish: 'Kaihin-Shukukai',
          staNameChinese: '海浜宿海',
          staNameKana: 'かいひんしゅくかい',
          textColor: '#383838',
        },
        left: {
          leftStaNumber: '04',
          leftStaNameEnglish: 'Nishikioka',
          leftStaNameChinese: '錦岡',
          textColor: '#383838',
        },
        middle: {
          lineName: '東海岸本線',
          lineAbbr: 'T',
          middleStaNumber: '03',
        },
        right: {
          rightStaNumber: '02',
          rightStaNameEnglish: 'Hokuriku',
          rightStaNameChinese: '北宿',
          textColor: '#7a7a7a',
        },
        lineColor: '#7297DD',
        backgroundColor: '#ECECEC',
        frameThickness: '2',
        displayForwardArrow: true,
        // direction: 'left',
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
    reverseLeftRight(){
      let tempL = null
      let tempR = null
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
      tempL = this.signInfo.left.textColor
      tempR = this.signInfo.right.textColor
      this.signInfo.left.textColor = tempR
      this.signInfo.right.textColor = tempL

      this.$emit("someChanged", this.signInfo, this.output)
    }
  }

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

.form-min-row {
  margin: 0;
  padding: 10px 20px 10px 10px;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
}
</style>