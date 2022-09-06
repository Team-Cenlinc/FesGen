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
      this.UpdateSignData()
    },
    UpdateSignStyle(signStyle){
      this.signStyle = signStyle
    },

    UpdateSignData() {

      console.log("guideSignFTA")

      // Empty the current sign

      this.$refs.svg.firstChild.remove()

      // Redraw the sign

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

      // Draw the layers

      if(this.signInfo.layers) {

        let layerCount = this.signInfo.layers.length
        let basePointY = 0

        for (let i = 1; i <= layerCount; i++) {
          let layer = this.signInfo.layers[i - 1]
          let layerHeight = layer.height
          let layerBaseColor = layer.baseColor
          let layerComponents = layer.components

          let layerGroup = document.createElementNS("http://www.w3.org/2000/svg", "g")
          layerGroup.setAttribute("id", "layer-" + i.toString())
          layerGroup.setAttribute("transform", "translate(0, " + basePointY.toString() + ")")

          let layerBackground = document.createElementNS("http://www.w3.org/2000/svg", "rect")
          layerBackground.setAttribute("x", "0")
          layerBackground.setAttribute("y", "0")
          layerBackground.setAttribute("width", this.output.outputWidth.toString())
          layerBackground.setAttribute("height", layerHeight.toString())
          layerBackground.setAttribute("fill", layerBaseColor)
          layerBackground.setAttribute("id", "layerBackground")
          layerGroup.appendChild(layerBackground)

          // Draw the components

          let componentCount = layerComponents.length
          let componentBasePointX = 0

          for (let j = 1; j <= componentCount; j++) {
            let component = layerComponents[j - 1]
            let componentType = component.type
            let componentWidth = component.width
            let componentBackgroundColor = component.backgroundColor
            let componentComponents = component.components

            let componentGroup = document.createElementNS("http://www.w3.org/2000/svg", "g")
            componentGroup.setAttribute("id", "component-" + j.toString())
            componentGroup.setAttribute("transform", "translate(" + componentBasePointX.toString() + ", 0)")

            let componentBackground = document.createElementNS("http://www.w3.org/2000/svg", "rect")
            componentBackground.setAttribute("x", "0")
            componentBackground.setAttribute("y", "0")
            componentBackground.setAttribute("width", componentWidth.toString())
            componentBackground.setAttribute("height", layerHeight.toString())
            componentBackground.setAttribute("fill", componentBackgroundColor)
            componentBackground.setAttribute("id", "componentBackground-" + j.toString())
            componentGroup.appendChild(componentBackground)

            if (componentType !== 'span') {
              let internalComponentCount = componentComponents.length
              let componentCenter = component.center
              let internalComponentBasePointY = 0
              for (let k = 1; k <= internalComponentCount; k++) {
                let internalComponentBasePointX = 0
                let internalComponent = componentComponents[k - 1]
                let internalComponentText = internalComponent.text
                let internalComponentTextColor = internalComponent.textColor
                let internalComponentIconLeft = internalComponent.iconLeft
                let internalComponentIconLeftColor = internalComponent.iconLeftColor
                let internalComponentIconRight = internalComponent.iconRight
                let internalComponentIconRightColor = internalComponent.iconRightColor
                let internalComponentBold = internalComponent.bold
                let internalComponentItalic = internalComponent.italic

                let internalComponentGroup = document.createElementNS("http://www.w3.org/2000/svg", "g")
                internalComponentGroup.setAttribute("id", "internal-component-" + k.toString())
                internalComponentGroup.setAttribute("transform", "translate(0, " + ((k - 1) * 10).toString() + ")")

                if (internalComponentIconLeft !== 'NONE') {
                  let iconLeft = document.createElementNS("http://www.w3.org/2000/svg", "use")
                  iconLeft.setAttribute("href", "#" + internalComponentIconLeft)
                  iconLeft.setAttribute("xlink:href", "#" + internalComponentIconLeft)
                  iconLeft.setAttribute("x", (internalComponentBasePointX + 15).toString())
                  iconLeft.setAttribute("y", (internalComponentBasePointY + 15).toString())
                  iconLeft.setAttribute("fill", internalComponentIconLeftColor)
                  iconLeft.setAttribute("stroke", internalComponentIconLeftColor)
                  internalComponentGroup.appendChild(iconLeft)

                  internalComponentBasePointX += 35 + 15
                } else {
                  internalComponentBasePointX += 15
                }

                if(internalComponentText.includes("|")){

                  let splittedText = internalComponentText.split("|")

                  let internalComponentTextElement = document.createElementNS("http://www.w3.org/2000/svg", "text")
                  if (componentCenter) {
                    internalComponentTextElement.setAttribute("x", (componentWidth / 2 - 15).toString())
                    internalComponentTextElement.setAttribute("y", (internalComponentBasePointY + 27).toString())
                    internalComponentTextElement.setAttribute("text-anchor", "middle")
                  } else {
                    internalComponentTextElement.setAttribute("x", "0")
                    internalComponentTextElement.setAttribute("y", (internalComponentBasePointY + 27).toString())
                    internalComponentTextElement.setAttribute("text-anchor", "start")
                  }
                  if (internalComponentItalic) {
                    internalComponentTextElement.setAttribute("font-style", "italic")
                  } else {
                    internalComponentTextElement.setAttribute("font-style", "normal")
                  }
                  if (internalComponentBold) {
                    internalComponentTextElement.setAttribute("font-weight", "bold")
                  } else {
                    internalComponentTextElement.setAttribute("font-weight", "normal")
                  }
                  internalComponentTextElement.setAttribute("fill", internalComponentTextColor)
                  internalComponentTextElement.setAttribute("id", "internal-component-text-" + k.toString())
                  internalComponentTextElement.setAttribute("font-size", "22")
                  internalComponentTextElement.setAttribute("font-family", ".Source Sans Variable, .Source Sans Pro")
                  internalComponentTextElement.setAttribute("transform", "translate(" + internalComponentBasePointX.toString() + ", " + "0)")
                  internalComponentTextElement.textContent = splittedText[0]
                  internalComponentGroup.appendChild(internalComponentTextElement)

                  let internalComponentTextElement2 = document.createElementNS("http://www.w3.org/2000/svg", "text")
                  if (componentCenter) {
                    internalComponentTextElement2.setAttribute("x", (componentWidth / 2 - 15).toString())
                    internalComponentTextElement2.setAttribute("y", (internalComponentBasePointY + 45).toString())
                    internalComponentTextElement2.setAttribute("text-anchor", "middle")
                  } else {
                    internalComponentTextElement2.setAttribute("x", "0")
                    internalComponentTextElement2.setAttribute("y", (internalComponentBasePointY + 45).toString())
                    internalComponentTextElement2.setAttribute("text-anchor", "start")
                  }
                  if (internalComponentItalic) {
                    internalComponentTextElement2.setAttribute("font-style", "italic")
                  } else {
                    internalComponentTextElement2.setAttribute("font-style", "normal")
                  }
                  if (internalComponentBold) {
                    internalComponentTextElement2.setAttribute("font-weight", "bold")
                  } else {
                    internalComponentTextElement2.setAttribute("font-weight", "normal")
                  }
                  internalComponentTextElement2.setAttribute("fill", internalComponentTextColor)
                  internalComponentTextElement2.setAttribute("id", "internal-component-text-" + k.toString())
                  internalComponentTextElement2.setAttribute("font-size", "15")
                  internalComponentTextElement2.setAttribute("font-family", ".Source Sans Variable, .Source Sans Pro")
                  internalComponentTextElement2.setAttribute("transform", "translate(" + internalComponentBasePointX.toString() + ", " + "0)")
                  internalComponentTextElement2.textContent = splittedText[1]
                  internalComponentGroup.appendChild(internalComponentTextElement2)

                  //Support of alternative symbol
                } else if (internalComponentText.includes("｜")){
                  let splittedText = internalComponentText.split("｜")

                  let internalComponentTextElement = document.createElementNS("http://www.w3.org/2000/svg", "text")
                  if (componentCenter) {
                    internalComponentTextElement.setAttribute("x", (componentWidth / 2 - 15).toString())
                    internalComponentTextElement.setAttribute("y", (internalComponentBasePointY + 27).toString())
                    internalComponentTextElement.setAttribute("text-anchor", "middle")
                  } else {
                    internalComponentTextElement.setAttribute("x", "0")
                    internalComponentTextElement.setAttribute("y", (internalComponentBasePointY + 27).toString())
                    internalComponentTextElement.setAttribute("text-anchor", "start")
                  }
                  if (internalComponentItalic) {
                    internalComponentTextElement.setAttribute("font-style", "italic")
                  } else {
                    internalComponentTextElement.setAttribute("font-style", "normal")
                  }
                  if (internalComponentBold) {
                    internalComponentTextElement.setAttribute("font-weight", "bold")
                  } else {
                    internalComponentTextElement.setAttribute("font-weight", "normal")
                  }
                  internalComponentTextElement.setAttribute("fill", internalComponentTextColor)
                  internalComponentTextElement.setAttribute("id", "internal-component-text-" + k.toString())
                  internalComponentTextElement.setAttribute("font-size", "22")
                  internalComponentTextElement.setAttribute("font-family", ".Source Sans Variable, .Source Sans Pro")
                  internalComponentTextElement.setAttribute("transform", "translate(" + internalComponentBasePointX.toString() + ", " + "0)")
                  internalComponentTextElement.textContent = splittedText[0]
                  internalComponentGroup.appendChild(internalComponentTextElement)

                  let internalComponentTextElement2 = document.createElementNS("http://www.w3.org/2000/svg", "text")
                  if (componentCenter) {
                    internalComponentTextElement2.setAttribute("x", (componentWidth / 2 - 15).toString())
                    internalComponentTextElement2.setAttribute("y", (internalComponentBasePointY + 45).toString())
                    internalComponentTextElement2.setAttribute("text-anchor", "middle")
                  } else {
                    internalComponentTextElement2.setAttribute("x", "0")
                    internalComponentTextElement2.setAttribute("y", (internalComponentBasePointY + 45).toString())
                    internalComponentTextElement2.setAttribute("text-anchor", "start")
                  }
                  if (internalComponentItalic) {
                    internalComponentTextElement2.setAttribute("font-style", "italic")
                  } else {
                    internalComponentTextElement2.setAttribute("font-style", "normal")
                  }
                  if (internalComponentBold) {
                    internalComponentTextElement2.setAttribute("font-weight", "bold")
                  } else {
                    internalComponentTextElement2.setAttribute("font-weight", "normal")
                  }
                  internalComponentTextElement2.setAttribute("fill", internalComponentTextColor)
                  internalComponentTextElement2.setAttribute("id", "internal-component-text-" + k.toString())
                  internalComponentTextElement2.setAttribute("font-size", "15")
                  internalComponentTextElement2.setAttribute("font-family", ".Source Sans Variable, .Source Sans Pro")
                  internalComponentTextElement2.setAttribute("transform", "translate(" + internalComponentBasePointX.toString() + ", " + "0)")
                  internalComponentTextElement2.textContent = splittedText[1]
                  internalComponentGroup.appendChild(internalComponentTextElement2)
                } else{
                  let internalComponentTextElement = document.createElementNS("http://www.w3.org/2000/svg", "text")
                  if (componentCenter) {
                    internalComponentTextElement.setAttribute("x", (componentWidth / 2 - 15).toString())
                    internalComponentTextElement.setAttribute("y", (internalComponentBasePointY + 36).toString())
                    internalComponentTextElement.setAttribute("text-anchor", "middle")
                  } else {
                    internalComponentTextElement.setAttribute("x", "0")
                    internalComponentTextElement.setAttribute("y", (internalComponentBasePointY + 36).toString())
                    internalComponentTextElement.setAttribute("text-anchor", "start")
                  }
                  if (internalComponentItalic) {
                    internalComponentTextElement.setAttribute("font-style", "italic")
                  } else {
                    internalComponentTextElement.setAttribute("font-style", "normal")
                  }
                  if (internalComponentBold) {
                    internalComponentTextElement.setAttribute("font-weight", "bold")
                  } else {
                    internalComponentTextElement.setAttribute("font-weight", "normal")
                  }
                  internalComponentTextElement.setAttribute("fill", internalComponentTextColor)
                  internalComponentTextElement.setAttribute("id", "internal-component-text-" + k.toString())
                  internalComponentTextElement.setAttribute("font-size", "30")
                  internalComponentTextElement.setAttribute("font-family", ".Source Sans Variable, .Source Sans Pro")
                  internalComponentTextElement.setAttribute("transform", "translate(" + internalComponentBasePointX.toString() + ", " + "0)")
                  internalComponentTextElement.textContent = internalComponentText

                  internalComponentGroup.appendChild(internalComponentTextElement)
                }

                if (internalComponentIconRight !== 'NONE') {
                  let iconRight = document.createElementNS("http://www.w3.org/2000/svg", "use")
                  iconRight.setAttribute("href", "#" + internalComponentIconRight)
                  iconRight.setAttribute("xlink:href", "#" + internalComponentIconRight)
                  iconRight.setAttribute("x", (componentWidth - 40).toString())
                  iconRight.setAttribute("y", (internalComponentBasePointY + 15).toString())
                  iconRight.setAttribute("fill", internalComponentIconRightColor)
                  iconRight.setAttribute("stroke", internalComponentIconRightColor)
                  internalComponentGroup.appendChild(iconRight)

                  internalComponentBasePointX += 35 + 15
                } else {
                  internalComponentBasePointX += 15
                }

                internalComponentBasePointY += 36
                componentGroup.appendChild(internalComponentGroup)
              }
            } else {
              let internalComponentCount = componentComponents.length
              let componentCenter = component.center
              for (let k = 1; k <= internalComponentCount; k++) {
                let internalComponent = componentComponents[k - 1]
                let internalComponentIfLogo = internalComponent.showLogo
                let internalComponentIfSpanLine = internalComponent.showSpanLine
                let internalComponentLogoType = internalComponent.logoType
                let internalComponentSpanThemeColor = internalComponent.color

                let internalComponentGroup = document.createElementNS("http://www.w3.org/2000/svg", "g")
                internalComponentGroup.setAttribute("id", "internal-component-" + k.toString())
                internalComponentGroup.setAttribute("transform", "translate(0, " + ((k - 1) * 10).toString() + ")")

                if (internalComponentIfSpanLine) {
                  let internalComponentSpanLine = document.createElementNS("http://www.w3.org/2000/svg", "rect")
                  internalComponentSpanLine.setAttribute("x", "0")
                  internalComponentSpanLine.setAttribute("y", "0")
                  internalComponentSpanLine.setAttribute("width", "2")
                  internalComponentSpanLine.setAttribute("height", layer.height.toString())
                  internalComponentSpanLine.setAttribute("fill", internalComponentSpanThemeColor)
                  internalComponentGroup.appendChild(internalComponentSpanLine)

                  let internalComponentSpanLine2 = document.createElementNS("http://www.w3.org/2000/svg", "rect")
                  internalComponentSpanLine2.setAttribute("x", (componentWidth - 2).toString())
                  internalComponentSpanLine2.setAttribute("y", "0")
                  internalComponentSpanLine2.setAttribute("width", "2")
                  internalComponentSpanLine2.setAttribute("height", layer.height.toString())
                  internalComponentSpanLine2.setAttribute("fill", internalComponentSpanThemeColor)
                  internalComponentGroup.appendChild(internalComponentSpanLine2)
                }

                if (componentCenter) {
                  if (internalComponentIfLogo) {
                    let internalComponentLogo = document.createElementNS("http://www.w3.org/2000/svg", "use")
                    internalComponentLogo.setAttribute("href", "#" + internalComponentLogoType)
                    internalComponentLogo.setAttribute("xlink:href", "#" + internalComponentLogoType)
                    internalComponentLogo.setAttribute("x", (componentWidth / 2).toString())
                    internalComponentLogo.setAttribute("y", (layerHeight / 2 - 25).toString())
                    internalComponentGroup.appendChild(internalComponentLogo)
                  }
                } else {
                  let internalComponentLogo = document.createElementNS("http://www.w3.org/2000/svg", "use")
                  internalComponentLogo.setAttribute("href", "#" + internalComponentLogoType)
                  internalComponentLogo.setAttribute("xlink:href", "#" + internalComponentLogoType)
                  internalComponentLogo.setAttribute("x", (15).toString())
                  internalComponentLogo.setAttribute("y", (15).toString())
                  internalComponentGroup.appendChild(internalComponentLogo)
                }
                componentGroup.appendChild(internalComponentGroup)
              }
            }
            layerGroup.appendChild(componentGroup)
            componentBasePointX = (componentWidth * 1) + (componentBasePointX * 1)
            console.log(componentBasePointX)
          }
          newComp.appendChild(layerGroup)
          basePointY += layerHeight
          console.log(newComp)
        }
      }



      let basePoint = this.$refs.svg.getElementById("reserved-icons")

      this.$refs.svg.insertBefore(newComp, basePoint)

      this.convertToCanvas()

    },

    convertToCanvas() {
      let svgDom = this.newSvgConstructor()
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
      newSvg.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink")
      newSvg.setAttribute("id", "svg-sign-FTA-guide")
      newSvg.setAttribute("class", "sign")
      newSvg.setAttribute("viewBox", "0 0 " + this.output.outputWidth.toString() + " " + this.output.outputHeight.toString())
      newSvg.setAttribute("width", this.output.outputWidth.toString())
      newSvg.setAttribute("height", this.output.outputHeight.toString())
      let svgDom = document.getElementById("svg-inner-FTAG")
      let reservedIcons = document.getElementById("reserved-icons")
      newSvg.appendChild(svgDom.cloneNode(true))
      newSvg.appendChild(reservedIcons.cloneNode(true))

      console.log(newSvg)

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