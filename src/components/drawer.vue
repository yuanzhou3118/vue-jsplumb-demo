<template>
  <div
    class="drawer-component"
    :style="style"
    :class="[`mode-${mode}`, { 'is-open': visible, 'is-close': !visible }]"
  >
    <div class="drawer-component__container" v-show="visible">
      <slot></slot>
    </div>
    <div class="drawer-trigger" :class="`drawer-${mode}`" @click="toggerDrawer">
      <i class="el-icon-arrow-left"></i>
    </div>
  </div>
</template>
<script>
export default {
  name: 'Drawer',
  props: {
    width: {
      type: String,
      default: '3',
    },
    height: {
      type: String,
      default: '3',
    },
    mode: {
      type: String,
      default: 'left',
    },
    visible: {
      type: Boolean,
      default: true,
    },
    zIndex: {
      type: String,
      default: '3',
    },
  },
  computed: {
    style() {
      return {
        'z-index': this.zIndex,
        'width': this.mode == 'bottom' ? '100%' : `${this.width * 100}px`,
        'height': this.mode !== 'bottom' ? '100%' : `${this.height * 100}px`,
      };
    },
  },
  data() {
    return {};
  },
  methods: {
    toggerDrawer() {
      const visible = !this.visible;
      this.$emit('update:visible', visible);
      if (visible) {
        this.$emit('open');
      } else {
        this.$emit('close');
      }
    },
  },
};
</script>
<style lang="scss" scoped>
.drawer-component {
  position: relative;
  /* transition: width 300ms ease-in-out; */
  z-index: 2;
  /* transform: translate3d(0, 0, 0); */

  &:after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 1;
    box-shadow: 0px 0px 8px 0px rgba(0, 0, 0, 0.1);
  }

  &.mode-bottom {
    position: absolute;
    bottom: 0;
  }

  &__container {
    position: relative;
    z-index: 4;
    height: 100%;
    transition: opacity 300ms ease-in-out;
    transform: translate3d(0, 0, 0);
  }

  &.is-open {
    .drawer-component__container {
      opacity: 1;
    }
  }

  .drawer-trigger {
    cursor: pointer;
    display: flex;
    align-items: center;
    position: absolute;
    top: 45%;
    transform: translateY(-50%);
    width: 94px;
    height: 94px;
    background: #fff;
    z-index: 3;
    transition: all 300ms ease;
    transform-origin: center;
    box-shadow: 0 0 8px 0 rgba(0, 0, 0, 0.1);

    &.drawer-left {
      right: -19px;
      border-top-right-radius: 20px;
      border-bottom-right-radius: 20px;

      i {
        transform: translateX(77px);
      }
    }

    &.drawer-right {
      left: -19px;
      border-top-left-radius: 20px;
      border-bottom-left-radius: 20px;
      i {
        transform: rotate(180deg);
      }
    }

    &.drawer-bottom {
      top: -19px;
      left: 50%;
      transform: translate(-50%, 0) rotate(90deg);
      border-top-left-radius: 20px;
      border-bottom-left-radius: 20px;
      i {
        transform-origin: center;
        transform: rotate(180deg);
      }
    }
  }

  &.is-close {
    &.mode-left {
      width: 0 !important;
    }
    &.mode-right {
      width: 0 !important;
    }
    &.mode-bottom {
      height: 0 !important;
    }

    .drawer-component__container {
      opacity: 0;
    }

    /deep/ .drawer-left {
      right: -35px !important;
      i {
        transform: rotate(180deg) translateX(-70px) scale(1.5);
      }
    }

    /deep/ .drawer-right {
      left: -35px !important;
      i {
        transform: rotate(0) translateX(10px) scale(1.5);
      }
    }

    /deep/ .drawer-bottom {
      top: -35px !important;
      i {
        transform: rotate(0) translateX(10px) scale(1.5);
      }
    }
  }
}
</style>
