<template>
  <div>
    <div id="canvas-FTA-station">
      <canvas id="sign-canvas-FTA-station" />
      <div id="sign-component">
        <keep-alive>
          <component :is="this.signStyle" ref="svg" class="sign" id="svg-sign-FTA-station"></component>
        </keep-alive>
      </div>
      <div class="data">
        <p v-show="false">{{ this.signInfo || 'NO'}}</p>
      </div>
    </div>
  </div>
</template>

<script>
import FTAStation from '../../assets/signs/FTA-Station.svg'

window.componentsConfig = {
  'FTA-station': '../../assets/signs/FTA-Station.svg',
}

export default {
  name: "StationSignFTA",
  components: {
    FTAStation
  },
  data(){
    return {
      signStyle: 'FTA-station',
      lightStyle: 'fluore',
      output: {
        outputWidth: 600,
        outputHeight: 200,
      },
      signInfo: {
        signConfig: {
          stationNameItalic: false,
          simplifySign: false,
        },
        layoutInfo: {
          backgroundColor: '#FFFFFF',
          textColor: '#000000',
        },
        thisStation: {
          nameMain: "主城湾",
          nameSub: "Spawn Bay",
        },
        lineInfo: [
          {
            name: "Waterside Line · 浦蓝线",
            nameAbbr: "WS",
            color: "#55CCFF",
            stationNumber: "01"
          },
        ]
      },
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
    UpdateData(signInfo, lightStyle, signScale) {
      this.lightStyle = lightStyle
      this.signInfo = signInfo
      this.output = signScale
    },
    UpdateSignStyle(signStyle) {
      this.signStyle = signStyle
    },
    UpdateSignData() {

      // signInfo.thisStation

      let dom = this.$refs.svg.getElementById('station-name')
      dom.setAttribute("fill", this.signInfo.layoutInfo.textColor)
      dom.setAttribute("font-style", this.signInfo.signConfig.stationNameItalic ? "italic" : "normal")
      console.log(this.$data)
      console.log(this.signInfo.signConfig.stationNameItalic ? "italic" : "normal")
      dom.childNodes[0].innerHTML = this.signInfo.thisStation.nameMain

      dom = this.$refs.svg.getElementById('station-name-sub')
      dom.setAttribute("fill", this.signInfo.layoutInfo.textColor)
      dom.setAttribute("font-style", this.signInfo.signConfig.stationNameItalic ? "italic" : "normal")
      dom.childNodes[0].innerHTML = this.signInfo.thisStation.nameSub

      // signInfo.lineInfo

      this.colorBeltCheck()

      dom = this.$refs.svg.getElementById('station-number')
      dom.setAttribute("fill", this.signInfo.layoutInfo.textColor)
      dom.setAttribute("visibility", this.signInfo.signConfig.simplifySign ? "hidden" : "visible")

      let lineCount = this.signInfo.lineInfo.length - 1
      let numberStr = ''
      let strComplex = []

      for (let i = 0; i <= lineCount; i++){
        numberStr = this.signInfo.lineInfo[i].nameAbbr + '-' + this.signInfo.lineInfo[i].stationNumber
        strComplex.push(numberStr)
      }

      dom.childNodes[0].innerHTML = strComplex.join(' | ')



      this.convertToCanvas()
    },
    RequireRearrange(lightStyle, signInfo, signScale) {

      this.lightStyle = lightStyle
      this.signInfo = signInfo
      this.output = signScale

      let dom

      this.UpdateSignData()

      // output

      dom = this.$refs.svg.getElementById('background')
      dom.setAttribute('width', this.output.outputWidth)
      dom.setAttribute('height', this.output.outputHeight)
      dom.setAttribute('fill', this.signInfo.layoutInfo.backgroundColor)

      let lineCount = this.signInfo.lineInfo.length
      let lastPositionX = 0
      let lineWidthComplex = []

      for (let i = 1; i <= lineCount; i++) {
        let lineElementWidth

        dom = this.$refs.svg.getElementById('color-belt-abbr-' + i)
        let abbrWidth = this.$refs.svg.getElementById('color-belt-abbr-' + i).getBBox().width
        let abbrPosition = lastPositionX + 20 + 9
        dom.setAttribute('transform', ('translate(' + abbrPosition.toString() + ', ' + (this.output.outputHeight - 16).toString() + ')'))
        dom.setAttribute("fill", this.signInfo.layoutInfo.textColor)
        dom.setAttribute("visibility", this.signInfo.signConfig.simplifySign ? "hidden" : "visible")
        dom.childNodes[0].innerHTML = this.signInfo.lineInfo[i - 1].nameAbbr

        dom = this.$refs.svg.getElementById('color-belt-abbr-frame-' + i)
        dom.setAttribute('width', abbrWidth + 18)
        dom.setAttribute('x', lastPositionX + 20)
        dom.setAttribute('y', this.output.outputHeight - 30)
        dom.setAttribute("fill", this.signInfo.layoutInfo.backgroundColor)
        dom.setAttribute("visibility", this.signInfo.signConfig.simplifySign ? "hidden" : "visible")


        dom = this.$refs.svg.getElementById('color-belt-name-' + i)
        let nameWidth = this.$refs.svg.getElementById('color-belt-name-' + i).getBBox().width
        console.log(nameWidth, i)
        let namePosition = abbrWidth + 18 + 20 + 20 + lastPositionX
        dom.setAttribute('transform', ('translate(' + namePosition.toString() + ', ' + (this.output.outputHeight - 16).toString() + ')'))

        dom.childNodes[0].innerHTML = this.signInfo.lineInfo[i - 1].name
        dom.setAttribute("visibility", this.signInfo.signConfig.simplifySign ? "hidden" : "visible")
        lineElementWidth = nameWidth + 20 + 20 + abbrWidth + 18 + 20

        dom = this.$refs.svg.getElementById('color-belt-' + i)
        dom.setAttribute('fill', this.signInfo.lineInfo[i - 1].color)
        dom.setAttribute('x', lastPositionX)
        dom.setAttribute('y', this.output.outputHeight - 40)
        dom.setAttribute('width', lineElementWidth)

        lastPositionX += lineElementWidth

        if (this.signInfo.signConfig.simplifySign) {
          let singleLineWidth = this.output.outputWidth / lineCount
          dom.setAttribute('x', singleLineWidth * (i - 1))
          dom.setAttribute('width', singleLineWidth)
        } else {
          lineWidthComplex.push(lineElementWidth)
          if (lineWidthComplex.length === 1){
            dom.setAttribute('width', this.output.outputWidth)
          } else {
            let totalWidth = 0
            for (let j = 0; j < lineWidthComplex.length - 1; j++) {
              totalWidth += lineWidthComplex.at(j)
            }
            let widthAfterFirst = this.output.outputWidth - totalWidth
            dom.setAttribute('width', widthAfterFirst)
          }
        }
      }

      this.convertToCanvas()
    },
    colorBeltCheck(){
      let lineCount = this.signInfo.lineInfo.length
      for (let i = 1; i <= lineCount; i++) {
        let haveBelt = !!this.$refs.svg.getElementById('color-belt-' + i)
        if (!haveBelt) {
          let belt = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
          belt.setAttribute("id", "color-belt-" + i)
          belt.setAttribute("x", "0")
          belt.setAttribute("y", "160")
          belt.setAttribute("height", "40")
          belt.setAttribute("fill", this.signInfo.lineInfo[i - 1].color)
          let abbrFrame = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
          abbrFrame.setAttribute("id", "color-belt-abbr-frame-" + i)
          abbrFrame.setAttribute("fill", this.signInfo.layoutInfo.backgroundColor)
          abbrFrame.setAttribute("width", "36")
          abbrFrame.setAttribute("height", "19")
          abbrFrame.setAttribute("rx", "9.5")
          abbrFrame.setAttribute("ry", "9.5")

          let abbr = document.createElementNS('http://www.w3.org/2000/svg', 'text')
          abbr.setAttribute("id", "color-belt-abbr-" + i)
          abbr.setAttribute("fill", this.signInfo.layoutInfo.textColor)
          abbr.setAttribute("font-size", "12")
          abbr.setAttribute("font-family", ".PingFangSC-Regular, .PingFang SC")
          abbr.setAttribute("font-weight", "700")
          let abbrTspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan')
          abbrTspan.setAttribute("x", "0")
          abbrTspan.setAttribute("y", "0")
          abbrTspan.innerHTML = this.signInfo.lineInfo[i - 1].nameAbbr

          abbr.appendChild(abbrTspan)

          let name = document.createElementNS('http://www.w3.org/2000/svg', 'text')
          name.setAttribute("id", "color-belt-name-" + i)
          name.setAttribute("fill", this.signInfo.layoutInfo.backgroundColor)
          name.setAttribute("font-size", "14")
          name.setAttribute("font-family", ".PingFangSC-Regular, .PingFang SC")
          name.setAttribute("font-weight", "600")
          let nameTspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan')
          nameTspan.setAttribute("x", "0")
          nameTspan.setAttribute("y", "0")
          nameTspan.innerHTML = this.signInfo.lineInfo[i - 1].name

          name.appendChild(nameTspan)

          let basePoint = this.$refs.svg.getElementById('station-name')

          this.$refs.svg.insertBefore(belt, basePoint)
          this.$refs.svg.insertBefore(abbrFrame, basePoint)
          this.$refs.svg.insertBefore(abbr, basePoint)
          this.$refs.svg.insertBefore(name, basePoint)
        }
      }
    },
    removeBelt(lightStyle, signInfo, signScale, index){
      this.lightStyle = lightStyle
      this.signInfo = signInfo
      this.output = signScale

      index += 1
      let haveBelt = !!this.$refs.svg.getElementById('color-belt-' + index)
      if (haveBelt){
        let belt = this.$refs.svg.getElementById('color-belt-' + index)
        belt.remove()

        let abbrFrame = this.$refs.svg.getElementById('color-belt-abbr-frame-' + index)
        abbrFrame.remove()

        let abbr = this.$refs.svg.getElementById('color-belt-abbr-' + index)
        abbr.remove()

        let name = this.$refs.svg.getElementById('color-belt-name-' + index)
        name.remove()
      }
      this.RequireRearrange(lightStyle, signInfo, signScale)
    },
    convertToCanvas() {
      let svgDom = document.getElementById("svg-sign-FTA-station")
      let {width, height} = svgDom.getBBox()
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
  }
}
</script>

<style scoped>

#canvas-FTA-station {
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