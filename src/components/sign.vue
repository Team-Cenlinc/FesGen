<template>
  <div id="canvas">
    <ShowSign />
  </div>
</template>

<script>
import ShowSign from '../assets/signs/kitajuku-dentetsu.svg'
export default {
  name: 'Sign',
  components: {
    ShowSign,
  },
}
</script>

<style scoped>
#canvas {
  margin: 30px auto 1px;
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

</style>
