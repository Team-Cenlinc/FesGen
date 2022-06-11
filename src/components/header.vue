<template>
  <header>
    <div class="header-flex">
      <h1><small><a href="/" class="header-nav-home">{{ title }}</a></small></h1>
      <span>
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
  ]
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
  color: #4f4f4f;
  text-decoration: none;
  float: right;
}

header a.header-nav{
  display: flex;
  padding: 0 1em;
  line-height: 50px;
  color: #4f4f4f;
  text-decoration: none;
  position: relative;
  transition: 225ms ease-out;
  float: right;
}

header a.header-nav:hover {
  background-color: rgba(79, 79, 79, .65);
  color: #f3f3f3;
}
</style>
