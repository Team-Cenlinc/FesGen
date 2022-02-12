<template>
  <div id="editor" class="form">
    <div class="row">
    <div>
      <h2>整体调整</h2>
      <div class="form-min-row">站牌样式
        <select>
          <option disabled value="">请选择</option>
          <option value="test-sign">测试用</option>
          <option value="kitajuku-dentetsu">北宿电铁</option>
        </select>
      </div>
      <div class="form-min-row">灯光效果
        <select>
          <option value="none">无</option>
          <option value="fluore">荧光灯</option>
          <option value="led">LED</option>
        </select>
      </div>
    </div>
    <div>
      <h2>站牌大小</h2>
        <div class="form-min-row">宽度
          <input type="number" value="2160">px
        </div>
        <div class="form-min-row">高度
          <input type="number" value="720">px
        </div>
    </div>
    </div>
    <div class="row">
    <div>
      <h2>站名</h2>
        <div class="form-min-row">站名 中文
          <input data-bind="staNameChinese" type="text">
        </div>
        <div class="form-min-row">站名 英语
          <input data-bind="staNameEnglish" type="text">
        </div>
        <div class="form-min-row">站名 假名
          <input data-bind="staNameKana" type="text">
        </div>
        <div class="form-min-row">站名 上浦语
          <input data-bind="staNameSyapolenus" type="text">
        </div>
    </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "editor"
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
}
</style>