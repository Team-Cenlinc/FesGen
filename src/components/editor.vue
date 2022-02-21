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
        {{ signStyle }}
      </div>
      <div class="form-min-row">
        <p>灯光效果</p>
        <select @change="sendData">
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
          <div><input type="number" value="2160"> px</div>

        </div>
        <div class="form-min-row">
          <p>高度</p>
          <div><input type="number" value="720"> px</div>

        </div>
    </div>
    </div>
    <div class="row">
    <div>
      <h2>站名</h2>
        <div class="form-min-row">
          <p>站名 中文</p>
          <input data-bind="staNameChinese" type="text">
        </div>
        <div class="form-min-row">
          <p>站名 英语</p>
          <input data-bind="staNameEnglish" type="text">
        </div>
        <div class="form-min-row">
          <p>站名 假名</p>
          <input data-bind="staNameKana" type="text">
        </div>
        <div class="form-min-row">
          <p>站名 上浦语</p>
          <input data-bind="staNameSyapolenus" type="text">
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
      signStyle: ''
    }
  },
  methods :{
    sendData(){
      this.$emit('someChanged', this.signStyle)
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