<template>
  <div id="app">
    <header><img src="@/assets/logo.svg" />vue-jsplumb</header>
    <PanelIndex />
  </div>
</template>

<script>
import PanelIndex from './pages/index.vue';

export default {
  name: 'App',
  components: {
    PanelIndex,
  },
};
</script>

<style lang="scss">
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  li {
    list-style: none;
  }
}
a {
  text-decoration: none;
}
html,
body {
  height: 100%;
}

header {
  height: 60px;
  display: flex;
  align-items: center;
  line-height: 60px;
  font-size: 30px;
  color: #fff;
  font-weight: bolder;
  justify-content: center;
  background-color: #0a132b;

  &,
  * {
    user-select: none;
    -webkit-user-drag: none;
  }

  img {
    height: 20px;
    display: block;
    -webkit-filter: invert(1);
    filter: invert(1);
    margin-right: 20px;
  }
}

#app {
  font-family: 'SourceHanSansCN-Medium', 'SourceHanSansCN', 'Avenir', Helvetica,
    Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  height: 100vh;
  color: #2c3e50;
  font-size: 14px;
  text-align: left;
  overflow: hidden;
  height: 100%;
  background: rgba(240, 242, 245, 1);
}
#app::-webkit-scrollbar {
  width: 0;
}
</style>
