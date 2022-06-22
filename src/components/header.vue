<template>
  <header>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
    <div class="header-flex">
      <h1><small><a href="/" class="header-nav-home">{{ title }}</a></small></h1>
      <span>
        <input type="button" @click="changeModeAnimation" v-if="darkMode" class="material-symbols-outlined header-nav" value="dark_mode">
        <input type="button" @click="changeModeAnimation" v-if="!darkMode" class="material-symbols-outlined header-nav" value="light_mode">
        <a href="/about.html" class="header-nav">About</a>
        <a href="/help.html" class="header-nav">Help</a>
        <a href="https://github.com/Team-Cenlinc/FesGen/tree/main" class="header-nav">GitHub</a>
        <a href="https://www.fetarute.org/wiki/index.php/FesGen" class="header-nav">Wiki</a>
        <a href="/" target="_blank" class="header-nav">Home Page</a>
      </span>
    </div>
  </header>
</template>

<script>
import anime from 'animejs/lib/anime.es.js';

export default {
  name: "flex-header",
  props: [
      'title'
  ],
  data() {
    return{
      darkMode: false,
    }
  },
  mounted() {
    const darkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
    if (darkMode && darkMode.matches) {
      document.body.classList.add('dark');
      this.darkMode = true
    }
    darkMode && darkMode.addEventListener('change', e => {
      if (e.matches) {
        document.body.classList.add('dark');
        this.darkMode = true
      } else {
        document.body.classList.remove('dark');
        this.darkMode = false
      }
    });
  },
  methods:{
    changeModeAnimation () {
      anime({
        targets: 'input.header-nav',
        translateY: -100,
        direction: 'alternate',
        duration: 100
          })
      this.darkMode = !this.darkMode
      this.changeColorTheme()
    },
    changeColorTheme() {
      if (this.darkMode){
        document.body.classList.add('dark');
      } else {
        document.body.classList.remove('dark');
      }
    }
  }
}
</script>

<style>
header {
  background-color: var(--header-background-color);
  color: var(--header-color);
  padding: 10px 20px;
  margin:  0;
  box-shadow: 0 0 5px var(--header-shade-color);
  flex: 0 0 auto;
  z-index: 1;
}

header .header-flex {
  width: 100%;
  height: 100%;
  display: -webkit-flex; /* Safari */
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
}

header a.header-nav-home {
  display: flex;
  padding: 0 1em;
  line-height: 50px;
  color: var(--header-nav-color);
  text-decoration: none;
  float: right;
}

header .header-nav{
  display: block;
  padding: 0 1em;
  line-height: 50px;
  color: var(--header-nav-color);
  text-decoration: none;
  position: relative;
  transition: 225ms ease-out;
  float: right;
}

header a.header-nav:hover {
  z-index: 1;
  color: var(--header-nav-color-hover);
  background: var(--header-nav-color-bg-hover);
}

a.header-nav:after, a.header-nav:before{
  content: "";
  position: absolute;
  left: 0;
  top: 80%;
  width: 0;
  height: 10%;
  background-color: transparent;
  z-index: -2;
}

a.header-nav:before{
  transition: .3s;
  background-color: var(--header-nav-color-line-hover);
  z-index: -1;
}

a.header-nav:hover:after, a.header-nav:hover:before{
  width: 100%;
}

.material-symbols-outlined {
  font-variation-settings:
      'FILL' 0,
      'wght' 600,
      'GRAD' 0,
      'opsz' 48
}

input.header-nav{
  background-color: transparent;
  padding: -10px;
  color: var(--header-nav-color);
  border-style: none;
  transition: 225ms ease-out;
}

input.header-nav:hover {
  color: var(--header-nav-color-hover);
}

</style>
