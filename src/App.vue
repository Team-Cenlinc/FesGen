<template>
  <div id="app">
    <HeaderFlex :title="titles"/>
    <Signs :signStyles="signStyle"/>
      <h3>Data from editor.vue -> App.vue:</h3>
      <p>{{ signStyle || '你尚未选择'}}
    </p>
    <Editor @someChanged="updateData"/>
    <FooterFlex :title="titles"/>
  </div>
</template>

<script>
import HeaderFlex from './components/header'
import FooterFlex from './components/footer'
import Signs from "./components/sign"
import Editor from "@/components/editor";

export default {
  name: 'App',
  components: {HeaderFlex, FooterFlex, Signs, Editor},
  data()  {
    return{
      titles: 'FesGen',
    }
  },
  props: {
      signStyle: String
  },
  methods: {
    updateData(signS){
     this.signStyle = signS
      console.log(this.signStyle)
    }
  }
}
</script>

<style scoped>
p, h3 {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
