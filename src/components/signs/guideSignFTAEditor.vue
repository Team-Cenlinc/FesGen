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
            <button @click="contentChange" class="button-alert">刷新数据</button>
            <button @click="resetData" class="button-danger">重置数据</button>
          </div>
        </div>
        <div>
          <h2><span class="material-symbols-outlined icon-editor">tune</span>FTA 导视牌: 全局设置</h2>
          <div class="form-min-row">
            <p>宽度</p>
            <div><input v-model="output.outputWidth" placeholder="600" min="0" @change="contentChange" type="number" value="600"> px</div>
          </div>
          <div class="form-min-row">
            <p>高度</p>
            <div><input v-model="output.outputHeight" placeholder="200" min="0" @change="contentChange" type="number" value="200"> px</div>
          </div>
          <div class="form-min-row">
            <p>色带颜色</p>
            <div><input v-model="signInfo.beltColor" @change="contentChange" type="color"></div>
          </div>
          <div class="form-min-row">
            <p>基础颜色</p>
            <div><input v-model="signInfo.generalBaseColor" @change="contentChange" type="color"></div>
          </div>
        </div>
      </div>
      <div class="row">
        <div>
          <h2><span class="material-symbols-outlined icon-editor">layers</span>信息层设置</h2>
          <div class="form-min-row" v-if="this.focusComponent.focusLayer === -1">
            <p class="hint">您未选择信息层</p>
          </div>
          <div class="form-min-row" v-if="this.focusComponent.focusLayer !== -1">
            <p>信息层名称</p>
            <div><input type="text" v-model="signInfo.layers[focusComponent.focusLayer].name" @change="contentChange"></div>
          </div>
          <div class="form-min-row" v-if="this.focusComponent.focusLayer !== -1">
            <p>信息层背景色</p>
            <div><input type="color" v-model="signInfo.layers[focusComponent.focusLayer].baseColor" @change="contentChange"></div>
          </div>
          <div class="form-min-row" v-if="this.focusComponent.focusLayer !== -1">
            <p>信息层高度</p>
            <div><input type="number" v-model="signInfo.layers[focusComponent.focusLayer].height" min="0" value="100" @change="contentChange"></div>
          </div>
          <div class="form-min-row">
            <button @click="addLayer" class="button">新建信息层</button>
            <button @click="deleteLayer" class="button">删除信息层</button>
          </div>

        </div>
        <div>
          <draggable v-model="signInfo.layers">
            <div class="drag-sorter" v-for="(layers, index) in signInfo.layers" :key="layers.id" @click="selectLayer(index)">{{ layers.name }} <span class="material-symbols-outlined sorter-icon">menu</span></div>
          </draggable>
        </div>
      </div>
      <div class="row">
        <div>
          <h2><span class="material-symbols-outlined icon-editor">info</span>组件信息设置</h2>
          <div class="form-min-row" v-if="this.focusComponent.focusComponent === -1">
            <p class="hint">您未选择组件</p>
          </div>
          <div class="form-min-row" v-if="this.focusComponent.focusComponent !== -1">
            <p>组件名称</p>
            <div><input type="text" v-model="signInfo.layers[focusComponent.focusLayer].components[focusComponent.focusComponent].name" @change="contentChange"></div>
          </div>
          <div class="form-min-row" v-if="this.focusComponent.focusComponent !== -1">
            <p>组件背景色</p>
            <div><input type="color" v-model="signInfo.layers[focusComponent.focusLayer].components[focusComponent.focusComponent].backgroundColor" @change="contentChange"></div>
          </div>
          <div class="form-min-row" v-if="this.focusComponent.focusComponent !== -1">
            <p>组件宽度</p>
            <div><input type="number" v-model="signInfo.layers[focusComponent.focusLayer].components[focusComponent.focusComponent].width" @change="contentChange" min="0" value="100"> px</div>
          </div>
          <div class="form-min-row" v-if="this.focusComponent.focusComponent !== -1">
            <p>组件类型</p>
            <select v-model="signInfo.layers[focusComponent.focusLayer].components[focusComponent.focusComponent].type" @change="changeType(signInfo.layers[focusComponent.focusLayer].components[focusComponent.focusComponent].type, signInfo.layers[focusComponent.focusLayer].components[focusComponent.focusComponent].id, signInfo.layers[focusComponent.focusLayer].components[focusComponent.focusComponent].name)">
              <option disabled value="">请选择</option>
              <option value="text">文本</option>
              <option value="exit">出口</option>
              <option value="info">信息</option>
              <option value="warn">警示</option>
              <option value="span">间隔</option>
            </select>
          </div>
          <div class="form-min-row" v-if="this.focusComponent.focusComponent !== -1">
            <p>文本居中显示</p>
            <div><input type="checkbox" v-model="signInfo.layers[focusComponent.focusLayer].components[focusComponent.focusComponent].center" @change="contentChange"></div>
          </div>
          <div v-if="this.focusComponent.focusComponent !== -1" class="form-min-row content-info-form-end">
            <button @click="createComponentInLayer" class="button">新建层内组件</button>
            <button @click="deleteComponentInLayer" class="button">删除层内组件</button>
          </div>
          <div v-if="this.focusComponent.focusComponent !== -1">
            <div v-for="(content, index) in signInfo.layers[focusComponent.focusLayer].components[focusComponent.focusComponent].components" :key="content.id">
              <div class="form-min-row">
                <h2>第 {{ index + 1 }} 层</h2>
              </div>
              <div class="form-min-row" v-if="signInfo.layers[focusComponent.focusLayer].components[focusComponent.focusComponent].type !== 'span'">
                  <p>本层文本内容</p>
                  <div><input type="text" v-model="content.text" @change="contentChange"></div>
              </div>
              <div class="form-min-row" v-if="signInfo.layers[focusComponent.focusLayer].components[focusComponent.focusComponent].type !== 'span'">
                <p>本层文本颜色</p>
                <div><input type="color" v-model="content.textColor" @change="contentChange"></div>
              </div>
              <div class="form-min-row" v-if="signInfo.layers[focusComponent.focusLayer].components[focusComponent.focusComponent].type !== 'span'">
                <p>本层左侧图标类型</p>
                <select v-model="content.iconLeft" @change="contentChange">
                  <option disabled value="">请选择</option>
                  <option value="NONE">无</option>
                  <option value="INFORMATION">信息咨询台</option>
                  <option value="ACCESSIBLE_ELEVATOR">垂直电梯</option>
                  <option value="ACCESSIBLE_STAIRS">有轮椅升降机的楼梯</option>
                  <option value="ACCESSIBLE">残障友好标志</option>
                  <option value="STAIRS">楼梯</option>
                  <option value="NOT_AVAILABLE">不可用</option>
                  <option value="EXIT_WITH_FRAME">有框出口标识</option>
                  <option value="EXIT_WITHOUT_FRAME">无框出口标识</option>
                  <option value="COLOR_BLOCK">色块</option>
                  <option value="ARROW_DOWN">向下的箭头</option>
                  <option value="ARROW_UP">向上的箭头</option>
                  <option value="ARROW_LEFT">向左的箭头</option>
                  <option value="ARROW_RIGHT">向右的箭头</option>
                  <option value="ARROW_UP_LEFT">向左上的箭头</option>
                  <option value="ARROW_UP_RIGHT">向右上的箭头</option>
                  <option value="ARROW_DOWN_LEFT">向左下的箭头</option>
                  <option value="ARROW_DOWN_RIGHT">向右下的箭头</option>
                </select>
              </div>
              <div class="form-min-row" v-if="signInfo.layers[focusComponent.focusLayer].components[focusComponent.focusComponent].type !== 'span'">
                <p>本层左侧图标颜色</p>
                <div><input type="color" v-model="content.iconLeftColor" @change="contentChange"></div>
              </div>
              <div class="form-min-row" v-if="signInfo.layers[focusComponent.focusLayer].components[focusComponent.focusComponent].type !== 'span'">
                <p>本层右侧图标类型</p>
                <select v-model="content.iconRight" @change="contentChange">
                  <option disabled value="">请选择</option>
                  <option value="NONE">无</option>
                  <option value="INFORMATION">信息咨询台</option>
                  <option value="ACCESSIBLE_ELEVATOR">垂直电梯</option>
                  <option value="ACCESSIBLE_STAIRS">有轮椅升降机的楼梯</option>
                  <option value="ACCESSIBLE">残障友好标志</option>
                  <option value="STAIRS">楼梯</option>
                  <option value="COLOR_BLOCK">色块</option>
                  <option value="NOT_AVAILABLE">不可用</option>
                  <option value="EXIT_WITH_FRAME">有框出口标识</option>
                  <option value="EXIT_WITHOUT_FRAME">无框出口标识</option>
                  <option value="ARROW_DOWN">向下的箭头</option>
                  <option value="ARROW_UP">向上的箭头</option>
                  <option value="ARROW_LEFT">向左的箭头</option>
                  <option value="ARROW_RIGHT">向右的箭头</option>
                  <option value="ARROW_UP_LEFT">向左上的箭头</option>
                  <option value="ARROW_UP_RIGHT">向右上的箭头</option>
                  <option value="ARROW_DOWN_LEFT">向左下的箭头</option>
                  <option value="ARROW_DOWN_RIGHT">向右下的箭头</option>
                </select>
              </div>
              <div class="form-min-row" v-if="signInfo.layers[focusComponent.focusLayer].components[focusComponent.focusComponent].type !== 'span'">
                <p>本层右侧图标颜色</p>
                <div><input type="color" v-model="content.iconRightColor" @change="contentChange"></div>
              </div>

              <div class="form-min-row" v-if="signInfo.layers[focusComponent.focusLayer].components[focusComponent.focusComponent].type === 'span'">
                <p>空区底色</p>
                <div><input type="color" v-model="content.color" @change="contentChange"></div>
              </div>

              <div class="form-min-row" v-if="signInfo.layers[focusComponent.focusLayer].components[focusComponent.focusComponent].type === 'span'">
                <p>显示分隔线</p>
                <div><input type="checkbox" v-model="content.showSpanLine" @change="contentChange"></div>
              </div>

              <div class="form-min-row" v-if="signInfo.layers[focusComponent.focusLayer].components[focusComponent.focusComponent].type === 'span'">
                <p>显示LOGO</p>
                <div><input type="checkbox" v-model="content.showLogo" @change="contentChange"></div>
              </div>

              <div v-if="content.showLogo && signInfo.layers[focusComponent.focusLayer].components[focusComponent.focusComponent].type === 'span'" class="form-min-row">
                <p>Logo选项</p>
                <select v-model="content.logoType" @change="contentChange">
                  <option disabled value="">请选择</option>
                  <option value="FTA-Logo-SUR">生存铁路</option>
                  <option value="FTA-Logo-PUAT">蒲塘桥都市区域交通</option>
                  <option value="FTA-Logo-SUR-Reversed">生存铁路-反色</option>
                  <option value="FTA-Logo-PUAT-Reversed">蒲塘桥都市区域交通-反色</option>
                </select>
              </div>

              <div class="form-min-row">
                <p>粗体文字</p>
                <div><input type="checkbox" v-model="content.bold" @change="contentChange"></div>
              </div>
              <div class="form-min-row content-info-form-end">
                <p>斜体文字</p>
                <div><input type="checkbox" v-model="content.italic" @change="contentChange"></div>
              </div>

            </div>
          </div>

          <div class="form-min-row" v-if="this.focusComponent.focusComponent !== -1 && signInfo.layers[focusComponent.focusLayer].components[focusComponent.focusComponent].type !== 'span'">
              <button @click="createContentInComponent" class="button">新建组件内层</button>
              <button @click="deleteContentInComponent" class="button">删除组件内层</button>
          </div>
        </div>
        <div>
          <draggable v-if="this.focusComponent.focusLayer !== -1" v-model="signInfo.layers[focusComponent.focusLayer].components">
            <div class="drag-sorter" v-for="(component, index) in signInfo.layers[focusComponent.focusLayer].components" :key="component.id" @click="selectComponent(index)">{{ component.name }} <span class="material-symbols-outlined sorter-icon">menu</span></div>
          </draggable>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import draggable from 'vuedraggable'

export default {
  name: "guideSignFTAEditor",
  components: {
    draggable,
  },
  data() {
    return {
      focusComponent: {
        focusLayer: -1,
        focusComponent: -1,
      },
      uniqueIdTable: {
        layerIds: [0],
        componentIds: [0],
      },
      signStyle: 'FTA-guide',
      lightStyle: 'fluore',
      output: {
        outputWidth: 600,
        outputHeight: 200,
      },
      signInfo: {
        beltColor: '#000000',
        generalBaseColor: '#FFFFFF',
        layers: [
          {
            name: 'Layer1',
            id: 0,
            height: 100,
            baseColor: '#FFFFFF',
            components: [
              {
                id: 0,
                name: 'init',
                type: 'text',
                width: 100,
                center: false,
                backgroundColor: '#FFFFFF',
                components: [
                  {
                    id: 0,
                    text: 'Accessible Elevator',
                    textColor: '#000000',
                    iconLeft: 'ARROW_LEFT',
                    iconLeftColor: '#000000',
                    iconRight: 'ACCESSIBLE_ELEVATOR',
                    iconRightColor: '#000000',
                    large: false,
                    bold: false,
                    italic: false,
                  }
                ]
              }
            ]
          },
        ]
      }
    }
  },
  mounted() {
    this.reloadCache()
    this.$emit('contentChanged', this.signInfo, this.lightStyle, this.output)
    this.dataToJson()
  },
  methods: {
    sendSign() {
      this.dataToJson()
      this.$emit('signChanged', this.signStyle, this.lightStyle, this.signInfo, this.output)
    },
    contentChange() {
      this.dataToJson()
      this.$emit('contentChanged', this.signInfo, this.lightStyle, this.output)
    },
    dataToJson() {

      let jsonData = JSON.stringify(this.$data);
      sessionStorage.setItem("instanceConfigFTAGuide", jsonData)
    },
    reloadCache() {
      if (sessionStorage.getItem("instanceConfigFTAGuide") !== null) {
        let jsonData = JSON.parse(sessionStorage.getItem("instanceConfigFTAGuide"))
        this.signInfo = jsonData.signInfo
        this.lightStyle = jsonData.lightStyle
        this.output = jsonData.output
        this.$emit('contentChanged', this.lightStyle, this.signInfo, this.output)
      }
    },
    resetData() {
      this.signInfo = {
        beltColor: '#000000',
        generalBaseColor: '#FFFFFF',
        layers: [
          {
            name: 'Layer1',
            id: 0,
            height: 100,
            baseColor: '#FFFFFF',
            components: [
              {
                id: 0,
                name: 'init',
                type: 'text',
                width: 100,
                center: false,
                backgroundColor: '#FFFFFF',
                components: [
                  {
                    id: 0,
                    text: 'Accessible Elevator',
                    textColor: '#000000',
                    iconLeft: 'ARROW_LEFT',
                    iconLeftColor: '#000000',
                    iconRight: 'ACCESSIBLE_ELEVATOR',
                    iconRightColor: '#000000',
                    large: false,
                    bold: false,
                    italic: false,
                  }
                ]
              }
            ]
          },
        ]
      }
      this.lightStyle = 'fluore'
      this.output = {
        outputWidth: 600,
        outputHeight: 200,
      }
      this.uniqueIdTable = {
        layerIds: [0],
        componentIds: [0],
      }
      this.focusComponent = {
        focusLayer: -1,
        focusComponent: -1,
      }
      this.dataToJson()
      this.$emit('contentChanged', this.signInfo, this.lightStyle, this.output)
    },
    addLayer() {
      let layerId = this.uniqueIdTable.layerIds[this.uniqueIdTable.layerIds.length - 1] + 1
      this.uniqueIdTable.layerIds.push(layerId)

      this.signInfo.layers.push({
        name: 'Layer' + (this.signInfo.layers.length + 1),
        id: layerId,
        height: 100,
        baseColor: '#FFFFFF',
        components: [
          {
            id: 0,
            name: 'init',
            type: 'text',
            width: 100,
            center: false,
            backgroundColor: '#FFFFFF',
            components: [
              {
                id: 0,
                type: 'text',
                text: 'Accessible Elevator',
                textColor: '#000000',
                iconLeft: 'ARROW_LEFT',
                iconLeftColor: '#000000',
                iconRight: 'ACCESSIBLE_ELEVATOR',
                iconRightColor: '#000000',
                large: false,
                bold: false,
                italic: false,
              }
            ]
          }
        ]
      })
      this.uniqueIdTable.layerIds.push(this.uniqueIdTable.layerIds.length)
      this.focusComponent.focusLayer = this.signInfo.layers.length - 1
      this.dataToJson()
      this.$emit('contentChanged', this.signInfo, this.lightStyle, this.output)
    },
    selectLayer(index) {
      this.focusComponent.focusLayer = index
    },
    deleteLayer() {
      this.focusComponent.focusLayer = -1
      this.signInfo.layers.splice(this.focusComponent.focusLayer, 1)
      this.dataToJson()
      this.$emit('contentChanged', this.signInfo, this.lightStyle, this.output)
    },
    selectComponent(index) {
      this.focusComponent.focusComponent = index
    },
    changeType(type, formerId, formerName) {
      let componentTemplate
      console.log(type, formerId)
      if (type === 'text') {
        componentTemplate = {
          id: formerId,
          name: formerName,
          type: 'text',
          width: 100,
          center: false,
          backgroundColor: '#FFFFFF',
          components: [
            {
              id: 0,
              text: 'Accessible Elevator',
              textColor: '#000000',
              iconLeft: 'ARROW_LEFT',
              iconLeftColor: '#000000',
              iconRight: 'ACCESSIBLE_ELEVATOR',
              iconRightColor: '#000000',
              large: false,
              bold: false,
              italic: false,
            }
          ]
        }
      } else if (type === 'warn') {
        componentTemplate = {
          id: formerId,
          name: formerName,
          type: 'warn',
          width: 100,
          center: false,
          backgroundColor: '#ffca2e',
          components: [
            {
              id: 0,
              text: 'Watch ahead!',
              textColor: '#000000',
              iconLeft: 'NONE',
              iconLeftColor: '#000000',
              iconRight: 'NONE',
              iconRightColor: '#000000',
              large: false,
              bold: false,
              italic: false,
            }
          ]
        }
      } else if (type === 'info') {
        componentTemplate = {
          id: formerId,
          name: formerName,
          type: 'info',
          width: 100,
          center: false,
          backgroundColor: '#2b75ff',
          components: [
            {
              id: 0,
              text: '',
              textColor: '#000000',
              iconLeft: 'Information',
              iconLeftColor: '#000000',
              iconRight: 'NONE',
              iconRightColor: '#000000',
              bold: false,
              italic: false,
            },
            {
              id: 1,
              text: 'Information Desk',
              iconLeft: 'NONE',
              iconLeftColor: '#000000',
              iconRight: 'NONE',
              iconRightColor: '#000000',
              large: false,
              bold: false,
              italic: false,
            }
          ]
        }
      } else if (type === 'exit') {
        componentTemplate = {
          id: formerId,
          name: formerName,
          type: 'exit',
          width: 100,
          center: false,
          backgroundColor: '#d00000',
          components: [
            {
              id: 0,
              text: '',
              textColor: '#000000',
              iconLeft: 'EXIT_WITH_FRAME',
              iconLeftColor: '#FFFFFF',
              iconRight: 'NONE',
              iconRightColor: '#000000',
              large: false,
              bold: false,
              italic: false,
            },
            {
              id: 1,
              text: 'Exit',
              textColor: '#FFFFFF',
              iconLeft: 'NONE',
              iconLeftColor: '#000000',
              iconRight: 'NONE',
              iconRightColor: '#000000',
              large: false,
              bold: true,
              italic: true,
            }
          ]
        }
      } else if (type === 'span') {
        componentTemplate = {
          id: formerId,
          name: formerName,
          type: 'span',
          width: 100,
          center: true,
          backgroundColor: '#FFFFFF',
          components: [
            {
              id: 0,
              showLogo: false,
              showSpanLine: true,
              color: '#FFFFFF',
              logoType: 'NONE',
              bold: false,
              italic: false,
            }
          ]
        }
      }
      this.signInfo.layers[this.focusComponent.focusLayer].components[this.focusComponent.focusComponent] = componentTemplate
      this.dataToJson()
      this.$emit('contentChanged', this.signInfo, this.lightStyle, this.output)
    },
    createComponentInLayer() {
      let newId = 0
      while (this.signInfo.layers[this.focusComponent.focusLayer].components.find(component => component.id === newId)) {
        newId++
      }

      let componentTemplate = {
        id: newId,
        name: 'init',
        type: 'text',
        width: 260,
        center: false,
        backgroundColor: '#FFFFFF',
        components: [
          {
            id: 0,
            text: 'Accessible Elevator',
            iconLeft: 'ARROW_LEFT',
            iconLeftColor: '#000000',
            iconRight: 'ACCESSIBLE_ELEVATOR',
            iconRightColor: '#000000',
            large: false,
            bold: false,
            italic: false,
          }
        ]
      }
      this.uniqueIdTable.componentIds.push(this.uniqueIdTable.componentIds.length)
      this.signInfo.layers[this.focusComponent.focusLayer].components.push(componentTemplate)
      this.focusComponent.focusComponent = this.signInfo.layers[this.focusComponent.focusLayer].components.length - 1
      this.dataToJson()
      this.$emit('contentChanged', this.signInfo, this.lightStyle, this.output)
    },
    deleteComponentInLayer() {
      this.signInfo.layers[this.focusComponent.focusLayer].components.splice(this.focusComponent.focusComponent, 1)
      this.focusComponent.focusComponent = -1
      this.dataToJson()
      this.$emit('contentChanged', this.signInfo, this.lightStyle, this.output)
    },
    createContentInComponent() {
      let newId = 0
      let componentTemplate
      while (this.signInfo.layers[this.focusComponent.focusLayer].components[this.focusComponent.focusComponent].components.find(component => component.id === newId)) {
        newId++
      }

      let currentType = this.signInfo.layers[this.focusComponent.focusLayer].components[this.focusComponent.focusComponent].type

      if (currentType !== 'span') {
        componentTemplate = {
          id: newId,
          text: '',
          textColor: '#000000',
          iconLeft: 'NONE',
          iconLeftColor: '#000000',
          iconRight: 'NONE',
          iconRightColor: '#000000',
          large: false,
          bold: false,
          italic: false,
        }
      } else {
        componentTemplate = {
          id: newId,
          showLogo: false,
          showSpanLine: true,
          color: '#FFFFFF',
          logoType: 'NONE',
          bold: false,
          italic: false,
        }
      }
      this.signInfo.layers[this.focusComponent.focusLayer].components[this.focusComponent.focusComponent].components.push(componentTemplate)
      this.dataToJson()
      this.$emit('contentChanged', this.signInfo, this.lightStyle, this.output)
    },
    deleteContentInComponent() {
      this.signInfo.layers[this.focusComponent.focusLayer].components[this.focusComponent.focusComponent].components.pop()
      this.dataToJson()
      this.$emit('contentChanged', this.signInfo, this.lightStyle, this.output)
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

.drag-sorter{
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  margin: 30px 0;
  padding: 10px;
  border-radius: 5px;
  background-color: var(--editor-selector-bg-color);
}

.sorter-icon{
  width: 30px;
  height: 30px;
  border-radius: 50%;
  color: var(--editor-selector-color);
  margin: 5px;
  cursor: pointer;
}

.content-info-form-end{
  border-bottom: 1px solid var(--editor-row-border);
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