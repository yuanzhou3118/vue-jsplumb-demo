<template>
  <div
    ref="node"
    :style="nodeContainerStyle"
    @mouseup="isOnlyTooltip ? null : changeNodeSite()"
    :class="[node.type, ...nodeContainerClass]"
  >
    <div class="table-title">
      <!-- 节点类型的图标 -->
      <div class="node-left-ico" v-if="!isOnlyTooltip">
        <i
          :class="[
            { 'result-component__icon-jiao': node.name == '交集' },
            { 'result-component__icon-bing': node.name == '并集' },
            { 'result-component__icon-export': node.name == '输出' },
            { 'el-data-collision-table': node.type == 'table' },
          ]"
        ></i>
      </div>
      <!-- 节点名称 -->
      <div class="node-label" :show-overflow-tooltip="true">
        {{ node.name }}
      </div>
      <div
        v-if="node.type != 'export' && !isOnlyTooltip"
        class="flow-node-drag"
        :class="{ active: !isCanDelete }"
      ></div>
      <el-tooltip
        class="item"
        effect="light"
        placement="bottom"
        v-if="isHasRedMark"
        content="连接后需设置关联关系"
        ><i
          class="el-icon-warning node-label__red-mark"
          style="cursor: pointer;color:#F56C6C;position: absolute;bottom: 1px;"
        ></i
      ></el-tooltip>
      <!-- 节点状态图标 -->
      <div
        class="node-right-ico"
        v-if="isCanDelete && !isOnlyTooltip && !status"
      >
        <i class="el-icon-error" @click.stop.prevent="deleteElement"></i>
      </div>
    </div>
    <div
      class="table-condition"
      v-if="node.condition && node.condition.length > 0 && node.type == 'table'"
    >
      <template
        v-for="(condition, index) in node.condition.filter(
          (item) =>
            item.whereType == 3 ||
            (item.whereType != 3 && (item.contentStart || item.contentEnd)),
        )"
      >
        <div
          v-if="isOnlyTooltip || (!isOnlyTooltip && index < 2)"
          class="table-condition__item"
          :key="condition.columnName"
        >
          <label class="el-label">{{ condition.colmunName }}：</label>
          <div class="table-condition__item-result">
            <template v-if="condition.whereType == 3">
              为空值
            </template>
            <template v-else-if="condition.whereType == 2">
              {{ `大于${condition.contentStart},小于${condition.contentEnd}` }}
            </template>

            <template v-else>
              {{ condition.contentStart }}
            </template>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
export default {
  name: 'flow-panel-node',
  props: {
    node: Object,
    data: Object,
    isActiveTab: Boolean,
    status: Number,
    isOnlyTooltip: { type: Boolean, default: false },
    activeElement: Object,
  },
  data() {
    return {
      whereTypeMapping: {
        0: '精确查询',
        1: '模糊查询',
        2: '范围查询',
        3: '空值查询',
      },
      isCanDelete: true,
      clickFlag: false,
      moveFlag: false,
      isHasRedMark: false,
      lastMoveIndex: 0,
      curMoveIndex: 0,
    };
  },
  created() {
    this.checkIsHaveSourceMap();
    const isHaveParentNode = this.data.lineList.find(
      (item) => item.from == this.node.id,
    );
    if (isHaveParentNode) {
      this.isCanDelete = false;
    } else {
      this.isCanDelete = true;
    }
  },
  watch: {
    node: {
      async handler() {
        await this.$nextTick();
        this.checkIsHaveSourceMap();
      },
      deep: true,
    },
    data: {
      async handler() {
        await this.$nextTick();
        const isHaveParentNode = this.data.lineList.find(
          (item) => item.from == this.node.id,
        );
        if (isHaveParentNode) {
          this.isCanDelete = false;
        } else {
          this.isCanDelete = true;
        }
        this.checkIsHaveSourceMap();
      },
      deep: true,
    },
  },
  computed: {
    nodeContainerClass() {
      if (this.isOnlyTooltip) {
        return { 'node-tooltip-container': true };
      }
      return {
        'node-container': true,
        'node-active':
          this.activeElement.type == 'node'
            ? this.activeElement.nodeId === this.node.id
            : false,
      };
    },
    // 节点容器样式
    nodeContainerStyle() {
      if (this.isOnlyTooltip) {
        return {};
      }
      return {
        top: this.node.top,
        left: this.node.left,
      };
    },
  },
  methods: {
    checkIsHaveSourceMap() {
      if (this.node.type == 'calculators') {
        if (this.node.sourceMap !== null && this.node.sourceMap.length > 0) {
          this.isHasRedMark = false;
        } else {
          this.isHasRedMark = true;
        }
      } else {
        this.isHasRedMark = false;
      }
    },
    async deleteElement() {
      this.$emit('clickNode', {
        id: this.node.id,
        type: this.node.type,
      });
      await this.$nextTick();
      this.$emit('deleteElement');
    },
    // 点击节点
    clickNode() {
      this.$emit('clickNode', {
        id: this.node.id,
        tableId: this.node.tableId || null,
        type: this.node.type,
      });
    },
    mouseDown() {
      this.clickFlag = true;
      this.moveFlag = true;
    },
    mouseMove() {
      if (this.moveFlag) {
        this.lastMoveIndex++;
        this.clickFlag = false;
      }
    },
    // 鼠标移动后抬起
    changeNodeSite() {
      this.moveFlag = false;
      // 避免抖动
      if (
        this.node.left == this.$refs.node.style.left &&
        this.node.top == this.$refs.node.style.top
      ) {
        return;
      }
      this.$emit('changeNodeSite', {
        nodeId: this.node.id,
        left: this.$refs.node.style.left,
        top: this.$refs.node.style.top,
      });
    },
  },
};
</script>
<style lang="scss" scoped>
.node-left-ico {
  display: flex;
  align-items: center;
  line-height: 24px;

  i {
    margin: 0;
  }
}

.result-component {
  &__icon {
    &-jiao {
      width: 20px;
      height: 20px;
      margin-bottom: 4px;
      background-size: contain;
      background-repeat: no-repeat;
      background-image: url(../assets/jiao.png);
    }

    &-bing {
      width: 20px;
      height: 20px;
      margin-bottom: 4px;
      background-size: contain;
      background-repeat: no-repeat;
      background-image: url(../assets/and.png);
    }

    &-line {
      width: 19px;
      height: 21px;
      margin-bottom: 4px;
      background-size: contain;
      background-repeat: no-repeat;
      background-image: url(../assets/line-icon.png);
    }

    &-export {
      width: 24px;
      height: 19px;
      margin-bottom: 4px;
      background-size: contain;
      background-repeat: no-repeat;
      background-image: url(../assets/export.png);
    }
  }
}

.node-container,
.node-tooltip-container {
  position: absolute;
  padding: 12px 20px;
  border-radius: 4px;
  background-color: #fff;
  box-shadow: 0px 1px 4px 0px rgba(0, 0, 0, 0.15);

  .table {
    &-title {
      display: flex;
      cursor: pointer;
      z-index: 3;
    }

    &-condition {
      margin-top: 6px;
      display: flex;
      flex-direction: column;
      color: #8a8a8a;

      &__item {
        line-height: 20px;
        display: flex;
        line-height: 20px;
      }
    }
  }

  &.calculators,
  &.export {
    padding: 12px 10px;

    .table-title {
      text-align: center;
      flex-direction: column;
      justify-content: center;
      align-items: center;

      .node-label {
        width: 40px;
        margin: 0;
        font-size: 12px;
        line-height: 15px;
      }
    }
  }
}

.node-tooltip-container {
  position: relative;
  padding: 0;
  box-shadow: none;
  padding: 12px 20px;
  background: transparent;

  .node-label {
    margin: 0;
    white-space: revert;
    color: #fff;
    /* width: 100%; */
  }

  .table-condition {
    color: rgba(255, 255, 255, 0.7);
  }
}

.flow-node-drag {
  visibility: hidden;
  position: absolute;
  z-index: 2;
  top: 50%;
  right: -8.5px;
  transform: translateY(-50%);
  padding: 5px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:after {
    content: '';
    width: 8px;
    height: 8px;
    z-index: 2;
    background: #1879ff;
    border-radius: 50%;
    box-shadow: 0px 1px 4px 0px rgba(0, 0, 0, 0.15);
  }

  &.active {
    visibility: visible;
  }
}

.node-container:hover {
  cursor: move;

  .node-right-ico {
    visibility: visible;
  }

  .flow-node-drag {
    visibility: visible;
    cursor: crosshair;
  }
}

.node-label {
  text-align: left;
  max-width: 280px;
  color: #333;
  font-size: 16px;
  font-weight: 400;
  line-height: 24px;
  margin-left: 10px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center;
  cursor: pointer;
}
</style>
