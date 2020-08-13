<template>
  <div class="flow-button-group" :style="{ ...position }">
    <div
      v-if="!status"
      class="flow-button-group__item"
      @click.stop="resetFlowContainer"
    >
      <svg
        t="1595660240940"
        class="icon"
        viewBox="0 0 1024 1024"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        p-id="2636"
        width="200"
        height="200"
      >
        <path
          d="M983.964 953.145 846.307 953.145c-21.721 0-39.33-17.575-39.33-39.249L806.977 796.141c0-21.677 17.609-39.249 39.33-39.249l39.33 0L885.637 580.263c0-21.679-17.607-39.251-39.33-39.251L531.664 541.012l0 215.88 39.332 0c21.721 0 39.33 17.572 39.33 39.249l0 117.756c0 21.674-17.609 39.249-39.33 39.249L433.34 953.146c-21.723 0-39.33-17.575-39.33-39.249L394.01 796.141c0-21.677 17.607-39.249 39.33-39.249l39.33 0 0-215.88L177.693 541.012c-21.721 0-39.33 17.572-39.33 39.251l0 176.629 39.33 0c21.721 0 39.33 17.572 39.33 39.249l0 117.756c0 21.674-17.609 39.249-39.33 39.249L40.036 953.146c-21.721 0-39.33-17.575-39.33-39.249L0.706 796.141c0-21.677 17.609-39.249 39.33-39.249l39.33 0L79.366 560.636c0-43.355 35.219-78.502 78.663-78.502L472.67 482.134 472.67 266.257l-39.33 0c-21.723 0-39.33-17.575-39.33-39.253L394.01 109.252c0-21.679 17.607-39.251 39.33-39.251l137.657 0c21.721 0 39.33 17.572 39.33 39.251l0 117.751c0 21.679-17.609 39.253-39.33 39.253l-39.332 0 0 215.878 334.309 0c43.441 0 78.66 35.147 78.66 78.502l0 196.255 39.33 0c21.721 0 39.33 17.572 39.33 39.249l0 117.756C1023.294 935.571 1005.684 953.145 983.964 953.145z"
          p-id="2637"
        ></path>
      </svg>
    </div>
    <div
      class="flow-button-group__item"
      :class="{ disabled: !isCanZoomAdd }"
      @click.stop="isCanZoomAdd ? zoomAdd() : null"
    >
      <svg
        t="1595660649648"
        class="icon"
        viewBox="0 0 1024 1024"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        p-id="7457"
        width="200"
        height="200"
      >
        <path
          d="M926.72 829.44q28.672 32.768 31.232 57.344t-18.944 48.128q-24.576 27.648-54.272 26.112t-57.344-24.064l-164.864-158.72q-46.08 30.72-99.84 47.616t-113.152 16.896q-80.896 0-151.552-30.72t-123.392-83.456-82.944-123.392-30.208-151.552q0-79.872 30.208-150.528t82.944-123.392 123.392-83.456 151.552-30.72 151.552 30.72 123.392 83.456 83.456 123.392 30.72 150.528q0 61.44-17.92 116.736t-49.664 101.376q13.312 14.336 37.376 38.4t48.128 48.64 44.544 44.032zM449.536 705.536q53.248 0 100.352-19.968t81.92-54.784 54.784-81.92 19.968-100.352-19.968-100.352-54.784-81.92-81.92-54.784-100.352-19.968-99.84 19.968-81.408 54.784-55.296 81.92-20.48 100.352 20.48 100.352 55.296 81.92 81.408 54.784 99.84 19.968zM512 384l128 0 0 128-128 0 0 128-129.024 0 0-128-126.976 0 0-128 126.976 0 0-128 129.024 0 0 128z"
          p-id="7458"
        ></path>
      </svg>
    </div>
    <div
      class="flow-button-group__item"
      :class="{ disabled: !isCanZoomMinus }"
      @click.stop="isCanZoomMinus ? zoomMinus() : null"
    >
      <svg
        t="1595660656545"
        class="icon"
        viewBox="0 0 1024 1024"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        p-id="7595"
        width="200"
        height="200"
      >
        <path
          d="M927.744 829.44q28.672 32.768 31.232 57.344t-18.944 48.128q-24.576 27.648-54.272 26.112t-57.344-24.064l-164.864-157.696q-46.08 29.696-99.84 46.592t-113.152 16.896q-80.896 0-151.552-30.72t-123.392-83.456-82.944-123.392-30.208-151.552q0-79.872 30.208-150.528t82.944-123.392 123.392-83.456 151.552-30.72 151.552 30.72 123.392 83.456 83.456 123.392 30.72 150.528q0 61.44-17.92 116.736t-49.664 102.4l36.864 37.888q24.576 23.552 48.64 48.128t43.52 44.032zM450.56 705.536q53.248 0 100.352-19.968t81.92-54.784 54.784-81.92 19.968-100.352-19.968-100.352-54.784-81.92-81.92-54.784-100.352-19.968-99.84 19.968-81.408 54.784-55.296 81.92-20.48 100.352 20.48 100.352 55.296 81.92 81.408 54.784 99.84 19.968zM256 384l385.024 0 0 128-385.024 0 0-128z"
          p-id="7596"
        ></path>
      </svg>
    </div>
  </div>
</template>
<script>
export default {
  name: 'panel-tools',
  props: {
    position: {
      type: Object,
      default: function() {
        return { top: '80px', right: '20px' };
      },
    },
    status: { type: Number, default: null },
    isCanZoomMinus: Boolean,
    isCanZoomAdd: Boolean,
    zoom: Number,
  },
  methods: {
    zoomAdd() {
      if (this.zoom > 0.1) {
        this.isCanZoomMinus = true;
      }
      if (this.zoom >= 4) {
        this.isCanZoomAdd = false;
        return;
      }
      this.isCanZoomAdd = true;
      const zoom = this.zoom + 0.1;
      this.$emit('changeZoom', zoom);
    },
    zoomMinus() {
      if (this.zoom < 4) {
        this.isCanZoomAdd = true;
      }
      if (this.zoom <= 0.1) {
        this.isCanZoomMinus = false;
        return;
      }
      this.isCanZoomMinus = true;
      const zoom = this.zoom - 0.1;
      this.$emit('changeZoom', zoom);
    },
    resetFlowContainer() {
      this.$emit('resetFlowContainer');
    },
  },
};
</script>
<style lang="scss" scoped>
.flow-button-group {
  display: flex;
  position: absolute;
  z-index: 5;
  background: #fff;
  border-radius: 5px;
  box-shadow: 0px 2px 6px 0px rgba(0, 0, 0, 0.1);

  &__item {
    position: relative;
    cursor: pointer;
    width: 50px;
    height: 50px;
    padding: 15px;
    &:after {
      content: '';
      position: absolute;
      margin: 10px 0;
      right: 1px;
      top: 0;
      height: calc(100% - 20px);
      width: 1px;
      background: #eaeaea;
    }

    &:last-child {
      &:after {
        width: 0;
      }
    }

    > svg {
      width: 100%;
      height: 100%;
      transition: fill 300ms ease;
      fill: #409eff;

      &:hover {
        fill: #66b1ff;
      }
    }

    &.disabled {
      > svg {
        fill: #dcdfe6;
      }
    }
  }
}
</style>
