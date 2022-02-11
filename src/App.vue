<template>
  <div id="app">
    <HeaderFlex :title="title"/>
    <Signs/>
    <Editor/>
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
  data()  {
    return{
      title: "FesGen"
    }
  }
}
</script>

<style scoped>

</style>
