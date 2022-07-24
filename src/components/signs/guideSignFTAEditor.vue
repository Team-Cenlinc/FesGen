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
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "guideSignFTAEditor",
  data() {
    return {
      focusComponent: "",
      signStyle: 'FTA-guide',
      lightStyle: 'fluore',
      output: {
        outputWidth: 600,
        outputHeight: 200,
      },
      signInfo: {
        layers: [
          [
            {
              type: 'span',
              width: 100,
              height: 100,
              components: [
                {
                  type: 'text',
                  text: 'Accessible Elevator',
                  iconLeft: 'ARROW_LEFT',
                  iconRight: 'ACCESSIBLE_ELEVATOR',
                  bold: false,
                  italic: false,
                }
              ]
            }
          ]
        ]
      }
    }
  },
  mounted() {
  },
  methods: {
    sendSign() {
      this.$emit('signChanged', this.signStyle, this.lightStyle, this.signInfo, this.output)
    },
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