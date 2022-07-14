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
        layoutInfo: {
          backgroundColor: '#FFFFFF',
          textColor: '#000000',
        },
        thisStation: {
          nameMain: "壑湖",
          nameSub: "Horhuu / Lake He",
        },
        lineInfo: [
          {
            name: "Waterside Line · 浦蓝线",
            nameAbbr: "WS",
            color: "#55CCFF",
            stationNumber: "04"
          },
          {
            name: "Discover Line · 探索线",
            nameAbbr: "DS",
            color: "#F8B62D",
            stationNumber: "08"
          }
        ]
      },
    }
  },
  updated() {
    // this.UpdateSignData()
  },
  mounted() {
    // this.UpdateSignData()
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
      dom.childNodes[0].innerHTML = this.signInfo.thisStation.nameMain

      dom = this.$refs.svg.getElementById('station-name-sub')
      dom.childNodes[0].innerHTML = this.signInfo.thisStation.nameSub

      // signInfo.lineInfo

      this.colorBeltCheck()

      dom = this.$refs.svg.getElementById('station-number')

      let lineCount = this.signInfo.lineInfo.length - 1
      let numberStr = ''
      let strComplex = []

      for (let i = 0; i <= lineCount; i++){
        console.log(i)
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


      this.convertToCanvas()
    },
    colorBeltCheck(){
      let lineCount = this.signInfo.lineInfo.length
      for (let i = 1; i === lineCount; i++) {
        let haveBelt = !!this.$refs.svg.getElementById('color-belt-' + i)
        if (!haveBelt) {
          let belt = document.createElement('rect')
          belt.setAttribute("id", "color-belt-" + i)
          let abbrFrame = document.createElement('rect')
          abbrFrame.setAttribute("id", "color-belt-abbr-frame-" + i)
          abbrFrame.setAttribute("fill", this.signInfo.lineInfo[i - 1].color)
          abbrFrame.setAttribute("width", "36")
          abbrFrame.setAttribute("height", "19")
          abbrFrame.setAttribute("rx", "9.5")
          abbrFrame.setAttribute("ry", "9.5")

          let abbr = document.createElement('text')
          abbr.setAttribute("id", "color-belt-abbr-" + i)
          abbr.setAttribute("fill", this.signInfo.layoutInfo.textColor)
          abbr.setAttribute("font-size", "12")
          abbr.setAttribute("font-family", ".PingFangSC-Regular, .PingFang SC")
          abbr.setAttribute("font-weight", "700")
          let abbrTspan = document.createElement('tspan')
          abbrTspan.setAttribute("x", "0")
          abbrTspan.setAttribute("y", "0")
          abbrTspan.innerHTML = this.signInfo.lineInfo[i - 1].nameAbbr

          abbr.appendChild(abbrTspan)

          let name = document.createElement('text')
          name.setAttribute("id", "color-belt-name-" + i)
          name.setAttribute("fill", this.signInfo.layoutInfo.backgroundColor)
          name.setAttribute("font-size", "14")
          name.setAttribute("font-family", ".PingFangSC-Regular, .PingFang SC")
          name.setAttribute("font-weight", "700")
          let nameTspan = document.createElement('tspan')
          nameTspan.setAttribute("x", "0")
          nameTspan.setAttribute("y", "0")
          nameTspan.innerHTML = this.signInfo.lineInfo[i - 1].name

          name.appendChild(nameTspan)

          let basePoint = this.$refs.svg.getElementById('station-name')
          this.$refs.svg.insertBefore(name, basePoint)
          this.$refs.svg.insertBefore(abbr, basePoint)
          this.$refs.svg.insertBefore(abbrFrame, basePoint)
          this.$refs.svg.insertBefore(belt, basePoint)
        }
      }
    },
    removeBelt(lightStyle, signInfo, signScale){
      this.lightStyle = lightStyle
      this.signInfo = signInfo
      this.output = signScale

      let index = this.signInfo.lineInfo.length + 1
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