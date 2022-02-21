<template>
  <div id="app">
    <HeaderFlex :title="title"/>
    <Signs/>
    <Editor @someChanged='updateData'/>
    {{ signStyle }}
    <FooterFlex :title="title"/>
  </div>
</template>

<script setup>
import HeaderFlex from './components/header'
import FooterFlex from './components/footer'
import Signs from "./components/sign"
import Editor from "@/components/editor";

export default {
  name: 'App',
  components: {HeaderFlex, FooterFlex, Signs, Editor},
  prop: {
    title: '',
    signStyle: '',
  },
  data()  {
    return{
      title: 'FesGen',
      signStyle: ''
    }
  },
  methods: {
    updateData(signS){
      this.signStyle = signS
    }
  }
}
</script>

<style scoped>

</style>
