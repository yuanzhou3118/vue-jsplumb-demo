<template>
  <div class="flow-menu" ref="tool">
    <el-input
      ref="condition"
      class="condition"
      v-model="params.condition"
      suffix-icon="el-icon-search"
      placeholder="请输入关键字，按“Enter”键查找"
      @keyup.enter.native="
        params.page = 1;
        searchResult();
      "
    />
    <el-collapse v-model="currentMenu" accordion class="el-data-collision-menu">
      <el-collapse-item
        class="el-data-collision-submenu"
        v-for="(menu, index) in menuList"
        :key="index"
        :name="`${index}`"
      >
        <template slot="title">
          <span class="node-pmenu">
            <i class="el-icon el-data-collision-database"></i>
            <span>{{ `${menu.name}（${menu.children.length}）` }}</span></span
          >
        </template>
        <div class="el-collapse-item__content-box" v-loading="menu.loading">
          <template v-if="menu.children.length > 0">
            <draggable
              v-for="(subMenu, key) in menu.children"
              :key="key"
              @end="end"
              :draggable="status ? null : `.node-menu-li`"
              :options="draggableOptions"
            >
              <div
                :type="subMenu.type"
                :menuIndex="key"
                class="node-menu-li"
                :index="`${index}-${key}`"
                :class="status ? `readOnly` : ``"
              >
                <i class="el-icon el-data-collision-table"></i>
                <el-tooltip
                  class="item"
                  effect="light"
                  :content="subMenu.name"
                  placement="top-start"
                >
                  <span class="el-data-collision-submenu__table-name">{{
                    subMenu.name
                  }}</span>
                </el-tooltip>

                <i class="el-line"></i>
              </div>
            </draggable>
          </template>
          <template v-if="menu.children.length == 0 && !menu.loading">
            <div class="no-data">暂无数据</div>
          </template>
        </div>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>
<script>
import draggable from 'vuedraggable';
import { getFolderAll } from '../request/index';
import { draggableOptions } from '../util/enum';
var mousePosition = {
  left: -1,
  top: -1,
};
export default {
  name: 'node-menu',
  props: ['status'],
  data() {
    return {
      // draggable配置参数参考 https://www.cnblogs.com/weixin186/p/10108679.html
      draggableOptions,
      currentMenu: `0`,
      params: { page: '', size: '', condition: '' },
      menuList: [
        {
          id: '1',
          type: 'database',
          name: '系统标准库',
          loading: false,
          ico: 'el-data-collision-database',
          children: [],
        },
      ],
    };
  },
  components: {
    draggable,
  },
  created() {
    /**
     * 以下是为了解决在火狐浏览器上推拽时弹出tab页到搜索问题
     * @param event
     */
    if (this.isFirefox()) {
      document.body.ondrop = function(event) {
        // 解决火狐浏览器无法获取鼠标拖拽结束的坐标问题
        mousePosition.left = event.layerX;
        mousePosition.top = event.clientY - 50;
        event.preventDefault();
        event.stopPropagation();
      };
    }
  },
  mounted() {
    this.searchResult();
  },
  methods: {
    async searchResult() {
      // this.$set(this.menuList, 0, { loading: true });
      this.menuList[0].loading = true;
      this.menuList[0].children = [];
      try {
        const { data } = await getFolderAll(this.params);
        console.log(data);
        const { list } = data;
        list.forEach((item) => {
          this.menuList[0].children.push({
            name: item.dbTableName,
            tableId: item.id,
            type: 'table',
          });
        });
        await this.$nextTick();
        // this.$set(this.menuList, 0, { loading: false });
        this.menuList[0].loading = false;
      } catch (err) {
        this.$message.error('查询系统标准库报错！');
        console.log(err);
      }
    },
    // 拖拽结束时触发
    end(evt) {
      let node = {};
      const index = evt.item.menuIndex || evt.item.getAttribute('menuIndex');
      const type = evt.item.type || evt.item.getAttribute('type');
      //区分excel还是table
      switch (type) {
        case 'table':
          const parent = this.menuList.find((item) => item.type === 'database');
          if (parent) {
            node = {
              tableId: parent.children[index].tableId,
              name: parent.children[index].name,
              type: parent.children[index].type,
            };
          }
          break;
      }
      this.$emit('addNode', evt, node);
    },
    // 是否是火狐浏览器
    isFirefox() {
      var userAgent = navigator.userAgent;
      if (userAgent.indexOf('Firefox') > -1) {
        return true;
      }
      return false;
    },
  },
};
</script>
<style lang="scss">
.flow-menu {
  position: relative;
  height: calc(100% - 60px);

  .condition {
    margin-top: 20px;
  }

  .el-data-collision {
    &-menu {
      position: relative;
      height: calc(100% - 52px);
      margin: 0 -10px;
      padding: 0 10px;
      border: 0;

      .el-collapse-item__wrap {
        height: calc(100% - 40px);
        margin: -10px;
        padding: 10px;
        overflow-x: hidden;
        overflow-y: scroll;

        .el-collapse-item__content {
          height: 100%;
          padding: 0;
          &-box {
            height: 100%;
            > div:not(.no-data) {
              &:last-child {
                .node-menu-li {
                  margin: 0;
                }
              }
            }

            .no-data {
              width: 100%;
              height: 100%;
              display: flex;
              align-items: center;
              justify-content: center;
            }
          }
        }
      }

      /deep/ .el-submenu__title {
        padding: 0 !important;

        &:hover {
          background-color: #fff;
        }

        > * {
          user-select: none;
        }
      }
    }

    &-submenu {
      position: relative;
      height: 100%;

      &__table-name {
        user-select: none;
        width: 100%;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        padding-right: 10px;
      }
    }
  }

  .node-pmenu {
    cursor: pointer;
    height: 20px;
    line-height: 20px;
    margin: 20px 0;
    display: block;
    font-size: 18px;
    color: #4a4a4a;
    display: inline-flex;
    justify-content: center;
    align-items: center;
  }

  /deep/ .el-data-collision-database {
    width: 20px;
    height: 20px;
    background: url(~@/assets/el-data-collision-database.png) center no-repeat;
    background-size: contain;
    margin-right: 10px;
  }

  .node-menu-li {
    border-radius: 4px;
    margin-bottom: 20px;
    position: relative;
    display: flex;
    align-items: center;
    height: 36px;
    line-height: 36px;
    font-size: 14px;
    color: rgba(51, 51, 51, 1);
    border-radius: 5px;
    padding: 0 13px 0 20px !important;
    background: #f5f6f7;
    box-shadow: 0px 1px 4px 0px rgba(0, 0, 0, 0.15);

    &.readOnly {
      cursor: not-allowed !important;
    }

    &:focus {
      outline: none;
    }

    * {
      &:focus {
        outline: none;
      }
    }

    .el-line {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      margin: 9px 13px 9px 0;

      &:after {
        content: '';
        position: absolute;
        top: 0;
        right: 5px;
        bottom: 0;
        border-right: 2px solid #d9dbdd;
      }

      &:before {
        content: '';
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        border-right: 2px solid #d9dbdd;
      }
    }
  }

  .node-menu-li:hover {
    cursor: move;
    background-color: #fff;
  }

  .menu-fade-in {
    &-enter-active,
    &-leave-active {
      transition-timing-function: ease;
      transition-duration: 300ms;
      transition-property: opacity, transform;
    }

    &-enter,
    &-leave-to {
      opacity: 0;
      transform: translate3d(0, 10px, 0);
    }
  }
}
</style>
