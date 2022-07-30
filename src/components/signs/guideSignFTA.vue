<template>
  <div>
    <div id="canvas-FTA-guide">
      <canvas id="sign-canvas-FTA-station" />
      <div id="sign-component">
        <keep-alive>
          <component :is="this.signStyle" ref="svg" class="sign" id="svg-sign-FTA-guide"></component>
        </keep-alive>
      </div>
      <div class="data">
        <p v-show="false">{{ this.signInfo || 'NO'}}</p>
      </div>
    </div>
  </div>
</template>

<script>
import FTAGuide from '../../assets/signs/FTA-guide.svg'

window.componentsConfig = {
  'FTA-guide': '../../assets/signs/FTA-guide.svg',
}

export default {
  name: "guideSignFTA",
  components: {
    FTAGuide,
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
  updated() {
    this.UpdateSignData()
  },
  mounted() {
    this.UpdateSignData()
    this.convertToCanvas()
  },
  methods: {
    UpdateData(signInfo, lightStyle, signScale){
      this.lightStyle = lightStyle
      this.signInfo = signInfo
      this.output = signScale
    },
    UpdateSignStyle(signStyle){
      this.signStyle = signStyle
    },

    UpdateSignData() {

      // Empty the current sign

      this.$refs.svg.firstChild.remove()

      // Redraw the sign

      console.log(this.signInfo.generalBaseColor)

      let newComp = document.createElementNS("http://www.w3.org/2000/svg", "g")
      newComp.setAttribute("id", "svg-inner-FTAG")

      let background = document.createElementNS("http://www.w3.org/2000/svg", "rect")
      background.setAttribute("x", "0")
      background.setAttribute("y", "0")
      background.setAttribute("width", this.output.outputWidth.toString())
      background.setAttribute("height", this.output.outputHeight.toString())
      background.setAttribute("fill", this.signInfo.generalBaseColor)
      background.setAttribute("id", "background")
      newComp.appendChild(background)

      let colorBelt = document.createElementNS("http://www.w3.org/2000/svg", "rect")
      colorBelt.setAttribute("x", "0")
      colorBelt.setAttribute("y", (this.output.outputHeight - 20).toString())
      colorBelt.setAttribute("width", this.output.outputWidth.toString())
      colorBelt.setAttribute("height", "20")
      colorBelt.setAttribute("fill", this.signInfo.beltColor)
      colorBelt.setAttribute("id", "colorBelt")
      newComp.appendChild(colorBelt)


      let basePoint = this.$refs.svg.getElementById("reserved-icons")

      this.$refs.svg.insertBefore(newComp, basePoint)

      this.convertToCanvas()

    },

    convertToCanvas() {
      let svgDom = document.getElementById("svg-sign-FTA-guide")
      let width = this.output.outputWidth
      let height = this.output.outputHeight
      let clonedSvgElements = svgDom.cloneNode(true)
      let outerHTML = clonedSvgElements.outerHTML,
          blob = new Blob([outerHTML],{type:'image/svg+xml;charset=utf-8'});
      let URL = window.URL || window.webkitURL || window;
      let blobURL = URL.createObjectURL(blob);

      let image = new Image();
      image.onload = () => {
        let canvas = document.getElementById('sign-canvas-FTA-station');
        canvas.width = width;
        canvas.height = height;
        let context = canvas.getContext('2d');

        context.drawImage(image, 0, 0, width, height);

      };
      image.src = blobURL;
    },

    newSvgConstructor() {
      let newSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
      newSvg.setAttribute("version", "1.1")
      newSvg.setAttribute("xmlns", "http://www.w3.org/2000/svg")
      newSvg.setAttribute("id", "svg-sign-FTA-guide")
      newSvg.setAttribute("class", "sign")
      newSvg.setAttribute("viewBox", "0 0 " + this.output.outputWidth.toString() + " " + this.output.outputHeight.toString())
      newSvg.setAttribute("width", this.output.outputWidth.toString())
      newSvg.setAttribute("height", this.output.outputHeight.toString())
      let svgDom = document.getElementById("svg-inner-FTAG")
      newSvg.appendChild(svgDom.cloneNode(true))

      return newSvg
    }

  }
}
</script>

<style scoped>
#canvas-FTA-guide {
  margin: 50px auto 1px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: -50px;
  border-width: 10px;
  z-index: 1;
}

#sign-component{
  z-index: -1;
  margin: -70px;
  transform: scale(5%, 5%);
}

.data {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.data h4 {
  margin-right: 20px;
  color: #333333;
}

.sign{
  visibility: hidden;
}
</style>