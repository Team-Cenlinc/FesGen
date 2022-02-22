<template>
  <div id="canvas">
    <ShowSign />
    <h3>Data from editor.vue -> App.vue -> sign.vue :</h3>
    <p>{{ signStyles || '你尚未选择'}}</p>
    <hr/>
  </div>
</template>

<script>
import ShowSign from '../assets/signs/kitajuku-dentetsu.svg'
export default {
  name: 'Sign',
  components: {
    ShowSign,
  },
  props: {
    signStyles: String,
  }
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
hr{
  width: 600px;
}

</style>
