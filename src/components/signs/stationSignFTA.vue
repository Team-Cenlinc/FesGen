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
        thisStation: {
          nameMain: "壑湖",
          nameSub: "Horhuu / Lake He",
        },
        lineInfo: [
          {
            name: "Waterside Line · 浦蓝线",
            color: "#55CCFF",
            stationNumber: "04"
          },
          {
            name: "Discover Line · 探索线",
            color: "#F8B62D",
            stationNumber: "08"
          }
        ]
      }
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
    solutionAdaption(){
    }
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