<template>
  <footer>
    <div class="footer-flex">
      <div id="footer-description">
        <p>
          {{ title }} - Beta<br>
          是由 Cenlinc Studio 开发的导视牌生成器。</p>
      </div>
      <div>
            <span>
            Powered by Fetarute Community<br>
            © 2022 Team Cenlinc
            </span>
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
  padding: 20px 30px 20px 30px;
  box-shadow: 0 0 7px var(--footer-shade-color);
  flex: 0 0 auto;
}


footer .footer-flex {
  width: 100%;
  height: 100%;
  display: -webkit-flex; /* Safari */
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
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
}

footer span {
  font-size: 14px;
  color: var(--footer-text-color);
  text-align: right;
  float: right;
}
</style>