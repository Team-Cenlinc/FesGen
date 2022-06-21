<template>
  <header>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
    <div class="header-flex">
      <h1><small><a href="/" class="header-nav-home">{{ title }}</a></small></h1>
      <span>
        <button v-if="darkMode" class="material-symbols-outlined header-nav">dark_mode</button>
        <button v-if="!darkMode" class="material-symbols-outlined header-nav">light_mode</button>
        <a href="/about.html" class="header-nav">About</a>
        <a href="/help.html" class="header-nav">Help</a>
        <a href="https://github.com/Team-Cenlinc/FesGen/tree/main" target="_blank" class="header-nav">GitHub</a>
        <a href="https://www.fetarute.org/wiki/index.php/FesGen" target="_blank" class="header-nav">Wiki</a>
        <a href="/" target="_blank" class="header-nav">Home Page</a>
      </span>
    </div>
  </header>
</template>

<script>
export default {
  name: "flex-header",
  props: [
      'title'
  ],
  data() {
    return{
      darkMode: false,
    }
  }
}
</script>

<style>

header {
  background-color: #a5ddf0;
  color: #1f1f1f;
  padding: 10px 20px;
  margin:  0;
  box-shadow: 0 0 5px #484848;
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
  border-bottom-color: white;
}

header a.header-nav-home {
  display: flex;
  padding: 0 1em;
  line-height: 50px;
  color: #4f4f4f;
  text-decoration: none;
  float: right;
}

header .header-nav{
  display: block;
  padding: 0 1em;
  line-height: 50px;
  color: #4f4f4f;
  text-decoration: none;
  position: relative;
  transition: 225ms ease-out;
  float: right;
}

header a.header-nav:hover {
  z-index: 1;
  color: #383838;
  background: #e3e3e3;
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
  background-color: #7092d5;
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

button.header-nav{
  background-color: #a5ddf0;
  color: #4f4f4f;
  border-style: none;
  transition: 225ms ease-out;
}

button.header-nav:hover {
  color: #f3f3f3;
}

</style>
