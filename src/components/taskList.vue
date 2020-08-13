<template>
  <div class="task-list">
    <div class="panel__title">
      <span>任务列表（{{ taskData.length }}/10）</span>
      <span class="icon-box">
        <i class="el-icon-refresh-left" @click="getTaskList()"></i>
        <i class="el-data-collision-task" @click="searchNoRunTask()"></i
      ></span>
    </div>
    <div class="task-container" v-if="!noRunTaskVisible">
      <div class="task-container__list" v-loading="loading">
        <template v-if="taskData && taskData.length > 0">
          <div
            v-for="(task, index) in taskData"
            :key="index"
            v-loading="task.loading"
            @click.self="previewTask(task, index)"
            class="task-container__item"
            :class="{ 'is-active': activeJobId == task.id }"
          >
            <div
              class="task-container__item-title"
              @click.self="previewTask(task, index)"
            >
              <i
                @click.self="previewTask(task, index)"
                :class="{
                  'el-success-task': task.status == 2,
                  'el-error-task': task.status != 2,
                }"
              ></i>
              <span
                class="task-container__item-name"
                @click.self="previewTask(task, index)"
                >{{ task.name }}</span
              >
              <span
                @click.self="previewTask(task, index)"
                :class="`task-container__item-status task_${task.status}`"
              >
                {{ task.statusString }}
              </span>
              <el-dropdown
                trigger="click"
                @command="handleCommand($event, task.id)"
              >
                <span class="el-dropdown-link">
                  <i class="el-icon-more"></i>
                </span>
                <el-dropdown-menu
                  slot="dropdown"
                  class="task-container__item-action"
                >
                  <el-dropdown-item
                    v-if="
                      task.status == 1 || (task.isRepeat && task.status == 2)
                    "
                    command="2"
                    icon="el-icon-video-pause"
                    >中止</el-dropdown-item
                  >
                  <el-dropdown-item command="3" icon="el-icon-delete"
                    >删除</el-dropdown-item
                  >
                </el-dropdown-menu>
              </el-dropdown>
            </div>
            <div
              class="task-container__item-content"
              @click.self="previewTask(task, index)"
            >
              {{ task.timePeriodString }}
            </div>
          </div>
        </template>
        <template v-if="(!taskData || taskData.length == 0) && !loading">
          <img class="not-find-img" src="../assets/no-task.png" />
        </template>
      </div>
    </div>
    <div class="no-run-list" :class="noRunTaskVisible ? 'active' : ''">
      <div class="panel__title">
        <span
          ><i class="el-icon-arrow-left" @click="resetParams()"></i
          >已保存方案</span
        >
        <span class="icon-box"
          ><i class="el-icon-refresh-left" @click="getTaskList()"></i
        ></span>
      </div>
      <div class="task-container__list" v-loading="loading">
        <template v-if="taskData && taskData.length > 0">
          <div
            v-for="(task, index) in taskData"
            :key="index"
            v-loading="task.loading"
            @click.self="previewTask(task, index)"
            class="task-container__item"
            :class="{ 'is-active': activeJobId == task.id }"
          >
            <div
              class="task-container__item-title"
              @click.self="previewTask(task, index)"
            >
              <i
                @click.self="previewTask(task, index)"
                class="el-no-run-task"
              ></i>
              <span
                @click.self="previewTask(task, index)"
                class="task-container__item-name"
                >{{ task.name }}</span
              >
              <el-dropdown
                trigger="click"
                @command="handleCommand($event, task.id)"
              >
                <span class="el-dropdown-link">
                  <i class="el-icon-more"></i>
                </span>
                <el-dropdown-menu
                  slot="dropdown"
                  class="task-container__item-action"
                >
                  <!-- <el-dropdown-item command="1" icon="el-icon-video-play"
                    >运行</el-dropdown-item
                  > -->
                  <el-dropdown-item command="3" icon="el-icon-delete"
                    >删除</el-dropdown-item
                  >
                </el-dropdown-menu>
              </el-dropdown>
            </div>
            <div class="task-container__item-time">{{ task.timePeriod }}</div>
          </div>
        </template>
        <template v-if="(!taskData || taskData.length == 0) && !loading">
          <img class="not-find-img" src="../assets/no-task.png" />
        </template>
      </div>
    </div>
  </div>
</template>
<script>
import {
  getTaskList,
  deleteJobId,
  pauseTask,
  getAllContentByJobId,
} from '../request/index';
import { timingTypeString } from '../util/enum';
export default {
  name: 'task-list',
  props: {
    activeJobId: {
      type: String,
      default: '',
    },
    canvasLoading: {
      type: Boolean,
      default: false,
    },
    tabs: {
      type: Array,
      default: function() {
        return [];
      },
    },
  },
  data() {
    return {
      loading: false,
      timingTypeString,
      total: 0,
      taskData: null,
      noRunTaskVisible: false,
      params: { taskStatus: 1, condition: '' },
    };
  },
  async created() {
    this.getTaskList();
  },
  methods: {
    async handleCommand(command, id) {
      switch (command) {
        case '1':
          //运行
          this.$emit('runTaskAction', id);
          break;
        case '2':
          //中止
          try {
            const { data } = await pauseTask(id);
            if (data == 'NORMAL') {
              this.$message.success('中止成功');
            } else {
              this.$message.error('中止失败！');
            }
            this.getTaskList();
          } catch (err) {
            this.$message.error('中止失败！');
            console.log(err);
          }
          break;
        case '3':
          //删除
          const isHaveTab = this.tabs.find((tab) => tab.id == id);
          if (isHaveTab) {
            this.$emit('removeRepeatTaskTab', id);
          }
          this.deleteTask(id);
          break;
        default:
          break;
      }
    },
    async deleteTask(id) {
      try {
        const { data } = await deleteJobId(id);
        this.$message.success('删除成功');
        this.getTaskList();
      } catch (err) {
        this.$message.error('删除失败！');
        console.log(err);
      }
    },
    parentPreviewTask(jobId) {
      const taskIndex = this.taskData.findIndex((task) => task.id == jobId);
      this.previewTask(this.taskData[taskIndex], taskIndex);
    },
    async previewTask(
      { id, status, name, loading, startTime, endTime },
      index,
    ) {
      if (this.tabs.length == 5) {
        return this.$message.error('一次只能打开5个任务！');
      }
      this.$set(this.taskData, index, {
        ...this.taskData[index],
        loading: true,
      });
      const tab = this.tabs.find((tab) => tab.id == id);
      if (tab) {
        //状态发生变化
        if (tab.status == status) {
          loading = false;
          this.$set(this.taskData, index, {
            ...this.taskData[index],
            loading: false,
          });
          return this.$emit('changeTab', id);
        } else {
          this.$emit('removeRepeatTaskTab', id);
        }
      }
      this.$emit('update:canvasLoading', true);
      try {
        const { data } = await getAllContentByJobId(id);
        const { resultTableData, log } = data;
        this.$emit('previewTask', {
          id,
          jobContent: data.flow,
          log,
          status,
          resultData: resultTableData
            ? {
                ...resultTableData,
                loadingTime:
                  startTime && endTime
                    ? (
                        (new Date(endTime).getTime() -
                          new Date(startTime).getTime()) /
                        1000
                      ).toFixed(2)
                    : null,
                tableName: data.flow.resultTableName || '暂无',
              }
            : null,
        });
        this.$set(this.taskData, index, {
          ...this.taskData[index],
          loading: false,
        });
        console.log(data);
      } catch (err) {
        this.$set(this.taskData, index, {
          ...this.taskData[index],
          loading: false,
        });
        this.$emit('update:canvasLoading', false);
        this.$message.error('获取任务信息失败！');
        console.log(err);
      }
    },
    resetParams() {
      this.params.taskStatus = 1;
      this.getTaskList();
      this.noRunTaskVisible = false;
    },

    async getTaskList() {
      this.taskData = [];
      this.loading = true;
      const { data } = await getTaskList(this.params);
      data.forEach((item) => {
        let status = item.status;
        const timePeriodString = this.getTimePeriodString(item);
        if (item.status != null) {
          if (this.params.taskStatus == 1) {
            status = status == 0 ? 5 : status;
            const statusString = this.getStatusString(status);
            this.taskData.push({
              ...item,
              loading: false,
              status,
              statusString,
              timePeriodString,
            });
          } else {
            const statusString = this.getStatusString(status);
            this.taskData.push({
              ...item,
              loading: false,
              status,
              statusString,
              timePeriodString,
            });
          }
        }
      });
      if (this.params.taskStatus == 1 && this.params.condition == '') {
        this.$emit('updateTaskTotal', data.length);
      }
      this.loading = false;
    },
    getTimePeriodString(task) {
      let result = '';
      if (task.isRepeat) {
        switch (task.timingType) {
          case 5:
            result = `以${timingTypeString[task.timingType]}计算的时间间隔：${
              task.day
            }号 ${task.hour}时${task.minute}分${task.second}秒`;
            break;
          case 4:
            const weekString = s_week.find((item) => item.value == task.week);
            result = `以${timingTypeString[task.timingType]}计算的时间间隔：${
              weekString.label
            } ${task.hour}时${task.minute}分${task.second}秒`;
            break;
          case 3:
            result = `以${timingTypeString[task.timingType]}计算的时间间隔：${
              task.hour
            }时${task.minute}分${task.second}秒`;
            break;
          case 2:
            result = `以${timingTypeString[task.timingType]}计算的时间间隔： ${
              task.hour
            }时`;
            break;
          case 1:
            result = `以${timingTypeString[task.timingType]}计算的时间间隔： ${
              task.minute
            }分`;
            break;
          default:
            break;
        }
      } else {
        result = `执行时间：${task.year}-${task.month}-${task.day} ${task.hour}:${task.minute}:${task.second}`;
      }
      return result;
    },
    getStatusString(status) {
      let string = '';
      switch (status) {
        case 1:
          string = '执行中';
          break;
        case 2:
          string = '执行成功';
          break;
        case 3:
          string = '执行失败';
          break;
        case 4:
          string = '已中止';
          break;
        case 5:
          string = '未执行';
          break;
      }
      return string;
    },
    searchNoRunTask() {
      this.params.taskStatus = 0;
      this.params.condition = '';
      this.getTaskList();
      this.noRunTaskVisible = true;
    },
  },
};
</script>
<style lang="scss" scoped>
@mixin cover(
  $position: absolute,
  $z-index: auto,
  $top: 0,
  $right: 0,
  $bottom: 0,
  $left: 0
) {
  position: $position;
  top: $top;
  right: $right;
  bottom: $bottom;
  left: $left;
  z-index: $z-index;
}
.task-list {
  height: 100%;
  position: relative;

  > * {
    user-select: none;
  }

  .no-run-list {
    z-index: 2;
    background: #fff;
    position: absolute;
    width: 100%;
    height: calc(100vh - 60px);
    top: 0;
    left: 100%;
    opacity: 0;

    transform: translate3d(0, 0, 0);
    transition: all 300ms ease;

    .panel__title {
      span {
        z-index: 2;
      }
      .el-icon-arrow-left {
        z-index: 3;
        cursor: pointer;
      }
    }

    .task-container__list {
      overflow-y: scroll;
      overflow-x: hidden;
      position: relative;
      padding: 20px;
      height: calc(100% - 60px);

      .not-find-img {
        height: 143px;
        position: absolute;
        top: calc(50% - 20px);
        left: 50%;
        transform: translate(-50%, -50%);
      }

      .task-container__item {
        padding: 10px;

        &-title {
          cursor: pointer;
          margin: 0;

          .el-no-run-task {
            cursor: pointer;
            margin-right: 7px;
          }
        }

        &-name {
          cursor: pointer;
          width: calc(100% - 80px);
        }
      }
    }

    &.active {
      opacity: 1;
      transform: translate3d(-100%, 0, 0);
    }
  }
}
.task-container {
  padding: 0 20px;
  margin: 20px 0;
  position: relative;
  height: calc(100% - 100px);

  .task-container__list {
    overflow-y: scroll;
    overflow-x: hidden;
    position: relative;
    margin: 0 -10px;
    padding: 20px 10px 0;
    height: calc(100% - 32px);
  }

  .not-find-img {
    height: 143px;
    position: absolute;
    top: calc(50% - 20px);
    left: 50%;
    transform: translate(-50%, -50%);
  }

  &__item {
    position: relative;
    background: rgba(255, 255, 255, 1);
    box-shadow: 0px 1px 4px 0px rgba(0, 0, 0, 0.15);
    border-radius: 4px;
    padding: 10px 14px 10px 18px;
    margin-bottom: 20px;
    color: #8a8a8a;
    /* cursor: pointer; */
    border: 1px solid transparent;
    transition: all 300ms ease;

    &.is-active {
      background: rgba(231, 241, 255, 0.2);
      border-color: rgba(182, 220, 255, 1);
    }

    &:hover {
      background: rgba(231, 241, 255, 0.2);
      border-color: rgba(182, 220, 255, 1);
    }

    &-name {
      cursor: pointer;
      color: #000000;
      width: calc(100% - 140px);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &-title {
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 10px;

      > .el-icon-delete {
        color: #8a8a8a;
        font-size: 20px;
      }

      /deep/ .el-icon-more {
        transform: rotate(90deg);
      }
    }

    &-content {
      cursor: pointer;
    }

    &-status {
      cursor: pointer;
      width: 80px;
      height: 24px;
      line-height: 24px;
      white-space: nowrap;
      text-align: center;
      margin-right: 10px;

      &.task_1 {
        color: #1890ff;
        background-color: #ecf6ff;
      }

      &.task_2 {
        color: #30d48e;
        background-color: #eafaf3;
      }

      &.task_3 {
        color: #d43030;
        background-color: #fbeaea;
      }

      &.task_4 {
        color: #8a8a8a;
        background-color: #ededed;
      }

      &.task_5 {
        color: #8a8a8a;
        background-color: #ededed;
      }
    }
  }
}

.panel {
  &__title {
    position: relative;
    height: 60px;
    line-height: 60px;
    font-weight: 400;
    color: #333333;
    font-size: 20px;

    margin: 0 20px;

    display: flex;
    align-items: center;
    justify-content: space-between;

    &:after {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      z-index: 1;
      border-bottom: 1px solid #eaeaea;
    }

    span.icon-box {
      z-index: 2;
      display: flex;

      .el-icon-refresh-left {
        cursor: pointer;
        color: #409eff;
        margin-right: 10px;
        font-size: 22px;
      }
    }
  }

  .el-data-collision-task {
    z-index: 2;
    cursor: pointer;
    width: 20px;
    height: 20px;
    background: url(../assets/el-data-collision-task.png) center no-repeat;
    background-size: contain;
    margin-right: 10px;
  }

  .el-success-task {
    display: block;
    z-index: 2;
    width: 21px;
    height: 20px;
    background: url(../assets/success-task.png) center no-repeat;
    background-size: contain;
    margin-right: 10px;
  }
  .el-error-task {
    display: block;
    z-index: 2;
    width: 21px;
    height: 20px;
    background: url(../assets/error-task.png) center no-repeat;
    background-size: contain;
    margin-right: 10px;
  }
  .el-no-run-task {
    display: block;
    z-index: 2;
    width: 50px;
    height: 50px;
    background: url(../assets/no-run-task.png) center no-repeat;
    background-size: contain;
    margin-right: 10px;
  }
}
</style>
