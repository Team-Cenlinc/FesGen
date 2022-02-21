<template>
  <div id="app">
    <HeaderFlex :title="titles"/>
    <Signs :signStyle="signStyle"/>
    {{ signStyle }}
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
      signStyle: '',
    }
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

</style>
