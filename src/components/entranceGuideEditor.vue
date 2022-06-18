<template>
  <div id="editor" class="form">
    <div id="editor" class="form">
      <div class="row">
        <div>
          <h2>FesGen编辑器设置</h2>
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
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "entranceGuideEditor",
  data() {
    return{
      signStyle: 'test-sign',
      lightStyle: 'fluore',
      output: {
        outputWidth: 0,
        outputHeight: 0,
      },
      signInfo: {

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
    }
  }
}
</script>

<style scoped>
.form {
  max-width: 1000px;
  margin: 0 auto;
  padding: 10px 10px 300px 10px;
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
  border-style: none;
  background: #ffffff;
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