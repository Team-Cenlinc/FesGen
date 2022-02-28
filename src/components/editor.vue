<template>
  <div id="editor" class="form">
    <div class="row">
    <div>
      <h2>整体调整</h2>
      <div class="form-min-row">
        <p>站牌样式</p>
        <select v-model="signStyle" @change="sendData">
          <option disabled value="">请选择</option>
          <option value="test-sign">测试用</option>
          <option value="kitajuku-dentetsu">北宿电铁</option>
        </select>
      </div>
      <div class="form-min-row">
        <p>灯光效果</p>
        <select v-model="output.lightStyle" @change="sendData">
          <option value="none">无</option>
          <option value="fluore">荧光灯</option>
          <option value="led">LED</option>
        </select>
      </div>
    </div>
    <div>
      <h2>站牌大小</h2>
        <div class="form-min-row">
          <p>宽度</p>
          <div><input v-model="output.width" @change="sendData" type="number" value="2160"> px</div>

        </div>
        <div class="form-min-row">
          <p>高度</p>
          <div><input v-model="output.height" @change="sendData" type="number" value="720"> px</div>

        </div>
    </div>
    </div>
    <div class="row">
      <div>
        <h2>本站名</h2>
          <div class="form-min-row">
            <p>站名 中文</p>
            <input v-model="staNameChinese" type="text">
          </div>
          <div class="form-min-row">
            <p>站名 英语</p>
            <input v-model="staNameEnglish" type="text">
          </div>
          <div class="form-min-row">
            <p>站名 假名</p>
            <input v-model="staNameKana" type="text">
          </div>
      </div>
      <div>
        <h2>中部主要信息</h2>
        <div class="form-min-row">
          <p>线路颜色</p>
          <input v-model="lineColor" type="number">
        </div>
        <div class="form-min-row">
          <p>线路名称</p>
          <input v-model="lineName" type="text">
        </div>
        <div class="form-min-row">
          <p>线路缩写</p>
          <input v-model="lineAbbr" type="text">
        </div>
        <div class="form-min-row">
          <p>本站编号</p>
          <input v-model="middleStaNumber" type="Number">
        </div>
      </div>
    </div>
    <div class="row">
      <div>
        <h2>左侧站点信息</h2>
        <div class="form-min-row">
          <p>站名 中文</p>
          <input v-model="sign.left.leftStaNameChinese" @change="sendData" type="text">
        </div>
        <div class="form-min-row">
          <p>站名 英语</p>
          <input v-model="sign.left.leftStaNameEnglish" @change="sendData" type="text">
        </div>
        <div class="form-min-row">
          <p>站点编号</p>
          <input v-model="sign.left.leftStaNumber" @change="sendData" type="number">
        </div>
      </div>
      <div>
        <h2>右侧侧站点信息</h2>
        <div class="form-min-row">
          <p>站名 中文</p>
          <input v-model="sign.right.rightStaNameChinese" @change="sendData" type="text">
        </div>
        <div class="form-min-row">
          <p>站名 英语</p>
          <input v-model="sign.right.rightStaNameEnglish" @change="sendData" type="text">
        </div>
        <div class="form-min-row">
          <p>站点编号</p>
          <input v-model="sign.right.rightStaNumber" @change="sendData" type="number">
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
      signStyle: '',
      output: {
        outputWidth: '',
        outputHeight: '',
        lightStyle: '',
      },
      sign:{
        main: {
          staNameEnglish: '',
          staNameChinese: '',
          staNameKana: '',
        },
        left: {
          leftStaNumber: '',
          leftStaNameEnglish: '',
          leftStaNameChinese: '',
        },
        middle: {
          lineName: '',
          lineAbbr: '',
          middleStaNumber: '',
        },
        right: {
          rightStaNumber: '',
          rightStaNameEnglish: '',
          rightStaNameChinese: '',

        },
        lineColor: '',
        backgroundColor: '',
      },
    }
  },
  methods :{
    sendData(){
      this.$emit('someChanged', this.signStyle, this.sign, this.output)
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

.row div {
  margin: 0;
  padding: 10px 10px 10px 10px;
}

.row h2 {
  border-bottom: 8px solid #a0d4e8;
  width: fit-content;
  height: 27px;
  margin: 0 10px 20px;
}

.form-min-row {
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
}
</style>