<template>
  <div id="canvas">
    <canvas id="sign-canvas" />
    <div id="sign-component">
      <keep-alive>
        <component :is="this.signStyle" ref="svg" class="sign" id="svg-sign"></component>
      </keep-alive>
    </div>
    <div class="data">
      <p v-show="false">{{ this.signInfo || 'NO'}}</p>
    </div>
  </div>
</template>

<script>
import KitajukuDentetsu from '../../assets/signs/kitajuku-dentetsu.svg'

window.componentsConfig = {    //左边是key值，右边是组件的引入路径
  'kitajuku-dentetsu': '../../assets/signs/kitajuku-dentetsu.svg',
}
export default {
  name: 'Sign',
  components: {
    KitajukuDentetsu
  },
  data(){
    return{
      signStyle: 'kitajuku-dentetsu',
      lightStyle: 'fluore',
      output: {
        outputWidth: 600,
        outputHeight: 200,
      },
      signInfo:{
        main: {
          staNameEnglish: 'Kaihin-Shukukai',
          staNameChinese: '海浜宿海',
          staNameKana: 'かいひんしゅくかい',
          mainTextColor: '#383838',
        },
        left: {
          leftStaNumber: '04',
          leftStaNameEnglish: 'Nishikioka',
          leftStaNameChinese: '錦岡',
          leftTextColor: '#383838',
        },
        middle: {
          lineName: '東海岸本線',
          lineAbbr: 'T',
          middleStaNumber: '03',
        },
        right: {
          rightStaNumber: '02',
          rightStaNameEnglish: 'Kitajuku',
          rightStaNameChinese: '北宿',
          rightTextColor: '#7A7A7A',
        },
        secondLine: {
          enable: false,
          color: '#A0D4E7',
        },
        lineColor: '#7297DD',
        backgroundColor: '#ECECEC',
        frameThickness: 4,
        displayForwardArrow: true,
        chnCharacterBold: false,
        direction: 'left',
      }
    }
  },
  updated() {
    this.UpdateSignData()
  },
  mounted() {
    this.UpdateSignData()
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
    UpdateSignData(){

      //signInfo.main

      let dom = this.$refs.svg.getElementById("Main")
      dom.attributes.fill.value = this.signInfo.main.mainTextColor

      dom = this.$refs.svg.getElementById("staNameChinese")
      dom.childNodes[0].innerHTML = this.signInfo.main.staNameChinese

      dom = this.$refs.svg.getElementById("staNameKana")
      dom.childNodes[0].innerHTML = this.signInfo.main.staNameKana

      dom = this.$refs.svg.getElementById("staNameEnglish")
      dom.childNodes[0].innerHTML = this.signInfo.main.staNameEnglish

      dom = this.$refs.svg.getElementById("middleIconOuter")
      dom.attributes.stroke.value = this.signInfo.main.mainTextColor

      dom = this.$refs.svg.getElementById("middleIconInner")
      dom.attributes.stroke.value = this.signInfo.main.mainTextColor
      dom.attributes.fill.value = this.signInfo.main.mainTextColor

      //signInfo.right

      dom = this.$refs.svg.getElementById("rightStaNameChinese")
      dom.childNodes[0].innerHTML = this.signInfo.right.rightStaNameChinese
      dom.attributes.fill.value = this.signInfo.right.rightTextColor

      dom = this.$refs.svg.getElementById("rightStaNameEnglish")
      dom.childNodes[0].innerHTML = this.signInfo.right.rightStaNameEnglish
      dom.attributes.fill.value = this.signInfo.right.rightTextColor

      dom = this.$refs.svg.getElementById("rightStaNumber")
      dom.childNodes[0].innerHTML = this.signInfo.right.rightStaNumber
      dom.attributes.fill.value = this.signInfo.right.rightTextColor

      dom = this.$refs.svg.getElementById("rightIconOuter")
      dom.attributes.stroke.value = this.signInfo.right.rightTextColor

      dom = this.$refs.svg.getElementById("rightIconInner")
      dom.attributes.stroke.value = this.signInfo.right.rightTextColor
      dom.attributes.fill.value = this.signInfo.right.rightTextColor

      //signInfo.left

      dom = this.$refs.svg.getElementById("leftStaNameChinese")
      dom.childNodes[0].innerHTML = this.signInfo.left.leftStaNameChinese
      dom.attributes.fill.value = this.signInfo.left.leftTextColor

      dom = this.$refs.svg.getElementById("leftStaNameEnglish")
      dom.childNodes[0].innerHTML = this.signInfo.left.leftStaNameEnglish
      dom.attributes.fill.value = this.signInfo.left.leftTextColor

      dom = this.$refs.svg.getElementById("leftStaNumber")
      dom.childNodes[0].innerHTML = this.signInfo.left.leftStaNumber
      dom.attributes.fill.value = this.signInfo.left.leftTextColor

      dom = this.$refs.svg.getElementById("leftIconOuter")
      dom.attributes.stroke.value = this.signInfo.left.leftTextColor

      dom = this.$refs.svg.getElementById("leftIconInner")
      dom.attributes.stroke.value = this.signInfo.left.leftTextColor
      dom.attributes.fill.value = this.signInfo.left.leftTextColor

      // signInfo.middle

      dom = this.$refs.svg.getElementById("lineAbbr")
      dom.childNodes[0].innerHTML = this.signInfo.middle.lineAbbr

      // Line Abbr. Color is same as background.

      dom.attributes.fill.value = this.signInfo.backgroundColor

      // Other sections are same as the "main" part.

      dom = this.$refs.svg.getElementById("abbrIcon")
      dom.attributes.fill.value = this.signInfo.main.mainTextColor
      dom.attributes.stroke.value = this.signInfo.main.mainTextColor

      dom = this.$refs.svg.getElementById("lineName")
      dom.childNodes[0].innerHTML = this.signInfo.middle.lineName
      dom.attributes.fill.value = this.signInfo.main.mainTextColor

      dom = this.$refs.svg.getElementById("middleStaNumber")
      dom.childNodes[0].innerHTML = this.signInfo.middle.middleStaNumber
      dom.attributes.fill.value = this.signInfo.main.mainTextColor

      dom = this.$refs.svg.getElementById("lineColorBelt1")
      dom.attributes.stroke.value = this.signInfo.lineColor

      dom = this.$refs.svg.getElementById("lineColorBelt2")
      dom.attributes.stroke.value = this.signInfo.secondLine.color

      dom = this.$refs.svg.getElementById("background")
      dom.attributes[3].value = this.signInfo.frameThickness
      dom.attributes.fill.value = this.signInfo.backgroundColor

      dom = this.$refs.svg.getElementById("leftEpli")
      dom.attributes.fill.value = this.signInfo.backgroundColor

      dom = this.$refs.svg.getElementById("rightEpli")
      dom.attributes.fill.value = this.signInfo.backgroundColor

      dom = this.$refs.svg.getElementById("middleEpli")
      dom.attributes.fill.value = this.signInfo.backgroundColor

      dom = this.$refs.svg.getElementById("towardArrow")
      if (this.signInfo.displayForwardArrow){
        dom.attributes.visibility.value = "visible"
      } else {
        dom.attributes.visibility.value = "hidden"
      }

      dom = this.$refs.svg.getElementById("Toward")
      dom.attributes.fill.value = this.signInfo.main.mainTextColor

      if (this.signInfo.chnCharacterBold) {
        dom = this.$refs.svg.getElementById("staNameChinese")
        dom.attributes[5].value = "bold"
        dom = this.$refs.svg.getElementById("rightStaNameChinese")
        dom.attributes[6].value = "bold"
        dom = this.$refs.svg.getElementById("leftStaNameChinese")
        dom.attributes[4].value = "bold"
      } else {
        dom = this.$refs.svg.getElementById("staNameChinese")
        dom.attributes[5].value = "normal"
        dom = this.$refs.svg.getElementById("rightStaNameChinese")
        dom.attributes[6].value = "normal"
        dom = this.$refs.svg.getElementById("leftStaNameChinese")
        dom.attributes[4].value = "normal"
      }
      this.convertToCanvas()
    },
    RequireRearrange(lightStyle, signInfo, signScale) {

      this.lightStyle = lightStyle
      this.signInfo = signInfo
      this.output = signScale

      this.UpdateSignData()

      // Calculation Zone

      /** Rearrange Accept list (For Dev)
       * mainStaCHN(/Kanji) (Ref. Pt. Depend)
       * midLineAbbrIcon (Ref. Pt. Depend)
       * midLineName (Ref. Pt. Depend)
       *
       * leftStaIcon (Ref. Pt. Depend)
       *
       * rightStaNameCHN (Ref. Pt. Depend)
       * rightStaNameEng (Ref. Pt. Depend)
       */

      // Reference Size
      let weightBorderX
      let weightBorderY
      let contentLength
      let contentCompareLength
      let xValueFin
      let yValueFin
      let xRefPoint
      let yRefPoint
      let dom

      /** X value + 100%; Y value + 50%
       * signInfo.output · 第一次偏差值求值
       * weightBorderX = this.output.outputWidth + 20
       * weightBorderY = this.output.outputHeight + 20
       *
       * @@@ Note @@@
       *
       * Left:
       * Middle:
       *  x / 2 (+), y / 4 (-)
       */

      // 第二次偏差值求值

      weightBorderX = this.output.outputWidth - 600
      weightBorderY = this.output.outputHeight - 200

      // signInfo.output - Line

      xRefPoint = this.signInfo.frameThickness / 2
      xValueFin = this.output.outputWidth - (this.signInfo.frameThickness / 2)
      yValueFin = weightBorderY / 2

      if (this.signInfo.secondLine.enable) {
        dom = this.$refs.svg.getElementById("lineColorBelt2")
        dom.attributes.visibility.value = "enable"
        dom.attributes[1].value = xRefPoint
        dom.attributes[3].value = xValueFin
        dom.attributes[2].value = yValueFin + 183.25
        dom.attributes[4].value = yValueFin + 183.25
        dom.attributes[8].value = 7.5
        dom = this.$refs.svg.getElementById("lineColorBelt1")
        dom.attributes[1].value = xRefPoint
        dom.attributes[3].value = xValueFin
        dom.attributes[2].value = yValueFin + 176.75
        dom.attributes[4].value = yValueFin + 176.75
        dom.attributes[8].value = 7.5
      } else {
        dom = this.$refs.svg.getElementById("lineColorBelt2")
        dom.attributes.visibility.value = "hidden"
        dom.attributes[1].value = xRefPoint
        dom.attributes[3].value = xValueFin
        dom.attributes[2].value = yValueFin + 180
        dom.attributes[4].value = yValueFin + 180
        dom.attributes[8].value = 15
        dom = this.$refs.svg.getElementById("lineColorBelt1")
        dom.attributes[1].value = xRefPoint
        dom.attributes[3].value = xValueFin
        dom.attributes[2].value = yValueFin + 180
        dom.attributes[4].value = yValueFin + 180
        dom.attributes[8].value = 15
      }

      dom = this.$refs.svg.getElementById("background")
      dom.attributes.width.value = this.output.outputWidth
      dom.attributes.height.value = this.output.outputHeight

      // signInfo.main

      dom = this.$refs.svg.getElementById("staNameChinese")
      contentLength = dom.getBBox().width

      xRefPoint = 240
      yRefPoint = 60
      xValueFin = xRefPoint - (contentLength) + (weightBorderX / 2)
      yValueFin = yRefPoint + (weightBorderY / 4)
      dom.attributes.x.value = xValueFin
      dom.attributes.y.value = yValueFin

      dom = this.$refs.svg.getElementById("staNameEnglish")
      xRefPoint = 255
      yRefPoint = 65
      xValueFin = xRefPoint + (weightBorderX / 2)
      yValueFin = yRefPoint + (weightBorderY / 4)
      dom.attributes.x.value = xValueFin
      dom.attributes.y.value = yValueFin

      dom = this.$refs.svg.getElementById("staNameKana")
      xRefPoint = 255
      yRefPoint = 30
      xValueFin = xRefPoint + (weightBorderX / 2)
      yValueFin = yRefPoint + (weightBorderY / 4)
      dom.attributes.x.value = xValueFin
      dom.attributes.y.value = yValueFin

      // signInfo.middle - Abbr Icon bind with signInfo.main in position

      // Middle Icon - Pos

      xRefPoint = 45
      yRefPoint = 35
      xValueFin = xRefPoint + (weightBorderX / 2)
      yValueFin = yRefPoint + (weightBorderY / 2)
      dom = this.$refs.svg.getElementById("middleIcon")
      dom.attributes.transform.value = "translate(" + xValueFin.toString() + ", " + yValueFin.toString() +")"

      xRefPoint = 0
      yRefPoint = 0
      xValueFin = xRefPoint + (weightBorderX / 2)
      yValueFin = yRefPoint + (weightBorderY / 2)
      dom = this.$refs.svg.getElementById("middleEpli")
      dom.attributes.transform.value = "translate(" + xValueFin.toString() + ", " + yValueFin.toString() +")"

      xRefPoint = 21
      dom = this.$refs.svg.getElementById("leftStaNumber")
      contentLength = dom.getBBox().width
      xValueFin = 21 - (contentLength / 2) + 8
      dom.attributes[2].value = xValueFin


      // lineIcon (Abbr), Original length 130px
      let domHelp = this.$refs.svg.getElementById("lineAbbr")

      xRefPoint = 0
      yRefPoint = 0
      yValueFin = yRefPoint + (weightBorderY / 2)
      contentLength = domHelp.getBBox().width

      domHelp = this.$refs.svg.getElementById("lineName")
      contentCompareLength = domHelp.getBBox().width

      dom = this.$refs.svg.getElementById("abbrIcon")
      dom.attributes[7].value = contentLength + 10

      xValueFin = contentLength - 10
      dom = this.$refs.svg.getElementById("lineName")
      dom.attributes[2].value = xValueFin + 90

      xValueFin = xValueFin = (contentLength + contentCompareLength + 5 - weightBorderX) / 2
      dom = this.$refs.svg.getElementById("lineInfo")
      if (contentLength + contentCompareLength === 0){
        xValueFin = 8 + weightBorderX / 2
      }
      dom.attributes.transform.value = "translate(" + (xRefPoint - xValueFin).toString() + ", " + yValueFin.toString() +")"

      // signInfo.left - Change Icon

      xRefPoint = 29
      yRefPoint = 120
      yValueFin = yRefPoint + (weightBorderY / 2)
      dom = this.$refs.svg.getElementById("Left")
      dom.attributes.transform.value = "translate(" + xRefPoint.toString() + ", " + yValueFin.toString() +")"

      dom = this.$refs.svg.getElementById("leftStaNameChinese")
      xRefPoint = 60
      yRefPoint = 5
      contentLength = dom.getBBox().width
      xValueFin = contentLength + 10
      if (contentLength === 0){
        xValueFin = 0
      }
      dom = this.$refs.svg.getElementById("leftIcon")
      dom.attributes.transform.value = "translate(" + xValueFin.toString() + ", " + yRefPoint.toString() +")"

      // Mid Point
      xRefPoint = 13
      dom = this.$refs.svg.getElementById("leftStaNumber")
      contentLength = dom.getBBox().width
      xValueFin = 13 - (contentLength / 2) + 6
      dom.attributes[2].value = xValueFin

      // signInfo.right - Change Text Start Point

      // Global group

      xRefPoint = 472
      yRefPoint = 120
      xValueFin = xRefPoint + weightBorderX
      yValueFin = yRefPoint + (weightBorderY / 2)
      dom = this.$refs.svg.getElementById("Right")
      dom.attributes.transform.value = "translate(" + xValueFin.toString() + ", " + yValueFin.toString() +")"

      // Modify start point of text.

      xRefPoint = 84
      dom = this.$refs.svg.getElementById("rightStaNameChinese")
      contentLength = dom.getBBox().width
      xValueFin = xRefPoint - contentLength
      dom.attributes[2].value = xValueFin

      dom = this.$refs.svg.getElementById("rightIcon")
      xValueFin = 40 - contentLength
      dom.attributes.transform.value = "translate(" + xValueFin.toString() + ", 5)"


      dom = this.$refs.svg.getElementById("rightStaNameEnglish")
      contentLength = dom.getBBox().width
      xValueFin = xRefPoint - contentLength
      dom.attributes[2].value = xValueFin

      xRefPoint = 13
      dom = this.$refs.svg.getElementById("rightStaNumber")
      contentLength = dom.getBBox().width
      xValueFin = 13 - (contentLength / 2) + 6
      dom.attributes[2].value = xValueFin


      // signInfo.direction

      xRefPoint = 595
      yRefPoint = 200
      xValueFin = xRefPoint + weightBorderX
      yValueFin = yRefPoint - (weightBorderY / 2)
      dom = this.$refs.svg.getElementById("towardArrow")
      if (this.signInfo.direction === "right") {
        dom.attributes.transform.value = "translate(" + xValueFin.toString() + ", " + yValueFin.toString() +") rotate(180)"
      } else if (this.signInfo.direction === "left") {
        yValueFin = weightBorderY / 2
        dom.attributes.transform.value = "translate(0" + yValueFin.toString() +") rotate(0)"
      }

    },
    convertToCanvas() {
      let svgDom = document.getElementById("svg-sign")
      let {width, height} = svgDom.getBBox()
      let clonedSvgElements = svgDom.cloneNode(true)
      let outerHTML = clonedSvgElements.outerHTML,
          blob = new Blob([outerHTML],{type:'image/svg+xml;charset=utf-8'});
      let URL = window.URL || window.webkitURL || window;
      let blobURL = URL.createObjectURL(blob);

      let image = new Image();
      image.onload = () => {
        let canvas = document.getElementById('sign-canvas');
        canvas.width = width;
        canvas.height = height;
        let context = canvas.getContext('2d');

        context.drawImage(image, 0, 0, width, height);
      };
      image.src = blobURL;
    },
  },
}
</script>

<style scoped>
#canvas {
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

button {
  font-size: 24px;
  background-color: #a0d4e7;
  color: #4e4e4e;
  margin: 10px;
  padding: 5px 20px;
  border: #000000 10px;
  transition: 225ms ease-out;
}

button:hover {
  background-color: rgba(79, 79, 79, .65);
  color: #f3f3f3;
}

.sign{
  visibility: hidden;
}

</style>
