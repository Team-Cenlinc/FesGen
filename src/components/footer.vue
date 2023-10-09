<template>
  <footer>
    <div class="footer-flex">
      <div id="footer-description">
        <p>
          {{ title }} - Beta - v2023.09.004<br>
          是由 Cenlinc Studio 开发的导视牌生成器。
        </p>
      </div>
      <div id="teleport">
        <a id="teleport-nav-twitter" href="https://twitter.com/Fetarute">
          <svg viewBox="0 0 1200 1227" width="30" height="30" xmlns="http://www.w3.org/2000/svg">
            <path d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.854V687.828Z"/>
          </svg>
        </a>
      </div>
      <div id="copyright-explanation">
        Powered by Fetarute Community with ❤️<br>
        导视牌设计版权所有 © 2023 Team Cenlinc | Update 2023.10b08
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: "flex-footer",
  props: [
      "title"
  ]
}
</script>

<style scoped>
footer {
  margin: 0;
  background-color: var(--footer-backgroun-color);
  padding: 20px 30px 55px 30px;
  box-shadow: 0 0 7px var(--footer-shade-color);
}


footer .footer-flex {
  width: 100%;
  height: 100%;
  justify-content: space-between;
}

footer h2 {
  color: var(--footer-text-color);
}

footer #footer-description p{
  color: var(--footer-text-color);
  display: -webkit-flex; /* Safari */
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  padding-bottom: 10px;
}

#teleport-nav-twitter{
  transition: 200ms ease-out;
  fill: var(--footer-text-color)
}

#teleport-nav-twitter:hover{
  fill: var(--footer-transition-color)
}

footer #copyright-explanation{
  font-size: 14px;
  line-height: 20px;
  color: var(--footer-text-color);
  text-align: right;
  float: right;
}
</style>