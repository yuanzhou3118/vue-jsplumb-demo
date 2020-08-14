<template>
  <div class="panel">
    <Drawer mode="left" :visible.sync="isShowNodeMenu" width="3.2">
      <div class="left-part">
        <div class="panel__title">数据源</div>
        <nodeMenu
          :status="activeTabItem && activeTabItem.status"
          @addNode="addNode"
          ref="nodeMenu"
        ></nodeMenu>
      </div>
    </Drawer>
    <div class="panel-container">
      <div class="panel-container__title">
        <div class="notice-for-new" :class="{ active: isShowNewTaskNotice }">
          操作说明：
          <ul>
            <li>1、拖拽左侧数据源到此画布；</li>
            <li>2、拖拽交并集操作按钮；</li>
            <li>3、连接算子与数据表；</li>
            <li>4、设置关联关系；</li>
            <li>5、拖拽输出至画布，且连接完成；</li>
            <li>6、点击“运行”。</li>
          </ul>
        </div>
        <el-tabs
          class="panel-container__tabs"
          v-model="canvasActiveId"
          type="card"
          @tab-click="tabClick"
          closable
        >
          <el-tab-pane
            v-for="(item, index) in canvasTabList"
            :key="item.name"
            :name="`${item.id}`"
          >
            <div slot="label" class="edit-label">
              <span class="edit-label-content">{{ item.name }}</span>
              <span>
                <el-popover
                  v-if="canvasActiveId == item.id && !item.status"
                  popper-class="edit-label-name-popover"
                  ref="editCanvasName"
                  @show="handleCanvasNamePopover(item.label)"
                  :value="editCanvasNamePopover"
                  placement="bottom"
                  title="编辑任务名称"
                  width="320"
                  :popper-options="{
                    boundariesElement: '.panel-container',
                    gpuAcceleration: false,
                  }"
                  trigger="manual"
                >
                  <el-form
                    ref="rulesForm"
                    :model="nameValidateForm"
                    :rules="rules"
                    @submit.native.prevent
                  >
                    <el-form-item prop="name">
                      <el-input
                        v-model="nameValidateForm.name"
                        :maxlength="10"
                        placeholder="请输入任务名称"
                        @keyup.enter.native="editCanvasName(index)"
                      />
                    </el-form-item>
                    <el-form-item style="margin:0;text-align:right;">
                      <el-button @click="editCanvasNamePopover = false"
                        >取消</el-button
                      >
                      <el-button type="primary" @click="editCanvasName(index)"
                        >确定</el-button
                      >
                    </el-form-item>
                  </el-form>
                  <i
                    slot="reference"
                    @click="toggleEditCanvasNamePopover(item.name)"
                    v-if="canvasActiveId == item.id && !item.status"
                    class="el-icon-edit"
                  ></i>
                </el-popover>
                <i
                  @click.stop.prevent="removeTab(index)"
                  class="el-icon-close"
                ></i
              ></span>
            </div>
            <div
              class="tab-pane-container"
              style="width:100%;height:100%;"
              v-flowDrag
              @mousewheel.stop.prevent="mouseWheelAction($event)"
            >
              <div
                v-if="item.id == canvasActiveId"
                :ref="`flowContainer_${item.id}`"
                :id="`flowContainer_${item.id}`"
                class="container flowContainer"
                :style="{
                  '-webkit-transform': `scale(${item.zoom})`,
                  '-moz-transform': `scale(${item.zoom})`,
                  '-ms-transform': `scale(${item.zoom})`,
                  '-o-transform': `scale(${item.zoom})`,
                  'transform': `scale(${item.zoom})`,
                }"
              >
                <template v-for="node in item.data.nodeList">
                  <flowNode
                    :activeElement="activeElement"
                    :key="node.id"
                    :node="node"
                    :status="item.status"
                    :data="item.data"
                    @deleteElement="deleteElement"
                    @changeNodeSite="changeNodeSite"
                    @nodeRightMenu="nodeRightMenu"
                    @openPreview="openPreview"
                    @clickNode="clickNode"
                  ></flowNode>
                </template>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane
            v-if="canvasTabList.length > 0"
            :key="'close'"
            disabled
            :name="'close'"
            :closable="false"
            ><div
              slot="label"
              class="el-button el-button--danger el-button--mini"
              @click.stop.prevent="closeAllTab"
            >
              全部关闭
            </div></el-tab-pane
          >
          <el-tab-pane :key="'add'" disabled :name="'add'" :closable="false"
            ><div slot="label" @click.stop.prevent="addTab">
              <el-tooltip
                class="item"
                effect="dark"
                content="添加标签页"
                placement="bottom"
              >
                <i class="el-data-collision-add-tabs"></i
              ></el-tooltip></div
          ></el-tab-pane>
        </el-tabs>
        <div
          class="result-component"
          :class="activeTabItem && activeTabItem.status ? `readOnly` : ``"
          ref="calculators"
        >
          <template>
            <draggable
              v-model="calculators"
              :draggable="`.moveCalculator`"
              @end="endCalculators"
              v-bind="draggableOptions"
              :disabled="activeTabItem && activeTabItem.status ? true : false"
            >
              <div
                :class="[
                  'result-component__item',
                  { moveCalculator: item.type !== 'link' },
                ]"
                :key="item.name"
                v-for="item in calculators"
              >
                <i :class="`result-component__icon ${item.icon}`"></i>
                {{ item.label }}
              </div>
            </draggable>
          </template>
        </div>
        <Tools
          v-show="!isFullScreen"
          v-if="activeTabItem && activeTabItem.data.nodeList.length > 0"
          @changeZoom="changeZoom"
          :zoom.sync="activeTabItem.zoom"
          :status="activeTabItem.status"
          @resetFlowContainer="resetFlowContainer"
          :isCanZoomAdd.sync="isCanZoomAdd"
          :isCanZoomMinus.sync="isCanZoomMinus"
        ></Tools>
        <div class="button-group">
          <el-button @click="clearCanvas" :disabled="!isCanClear" type="warning"
            >清除画布</el-button
          >
        </div>
      </div>
    </div>
    <Drawer
      mode="right"
      :visible.sync="isShowTaskList"
      @open="openTaskList"
      width="3.6"
    >
      <div class="right-part">
        <task-list
          ref="taskList"
          :tabs="canvasTabList"
          @removeRepeatTaskTab="removeRepeatTaskTab"
          @changeTab="changeTab"
          :canvasLoading.sync="canvasLoading"
          @updateTaskTotal="updateTaskTotal"
          @previewTask="previewTaskDetail"
          :activeJobId="canvasActiveId"
        ></task-list>
      </div>
    </Drawer>
    <calculator-dialog
      v-if="calculatorDialogVisible"
      @confirm="handleCalculatorData"
      :data="calculatorDialogData"
      :status="activeTabItem && activeTabItem.status"
      :calculatorDialogVisible.sync="calculatorDialogVisible"
    ></calculator-dialog>
  </div>
</template>
<script>
import draggable from 'vuedraggable';
import { jsPlumb } from 'jsplumb';
import Drawer from '../components/drawer';
import Tools from '../components/panelTools';
import calculatorDialog from '../components/calculatorDialog';
import nodeMenu from '../components/nodeMenu';
import taskList from '../components/taskList';
import flowNode from '../components/flowNode';
import { calculators, draggableOptions, dataInit } from '../util/enum';
import { easyFlowMixin } from '../util/mixins';
import * as utils from '../util/util';
export default {
  name: 'panel',
  mixins: [easyFlowMixin],
  data() {
    var checkJobName = async (rule, value, callback) => {
      const flag = new RegExp('[`////:*?\\\\<>"|]');
      if (value && flag.test(value)) {
        callback(new Error('任务名称不能包含 / : * ? " <> | 这些在特殊符号'));
      } else {
        callback();
      }
    };
    return {
      //编辑修改tab名称
      nameValidateForm: { name: '' },
      canvasLoading: false,
      editCanvasNamePopover: false,
      //算子类型
      calculators,
      draggableOptions,
      // jsPlumb 实例
      jsPlumb,
      rules: {
        name: [
          { required: true, message: '请输入任务名称', trigger: 'blur' },
          { max: 10, message: '长度在10个字符', trigger: 'blur' },
          { validator: checkJobName, required: true, trigger: 'blur' },
        ],
      },
      // 是否加载完毕标志位
      loadEasyFlowFinish: false,
      // 激活的元素、可能是节点、可能是连线
      activeElement: {
        // 可选值 node 、line
        type: undefined,
        // 节点ID
        nodeId: undefined,
        // 连线ID
        sourceId: undefined,
        targetId: undefined,
      },

      //tabs
      panelContainerStyle: { width: `calc(100vw - 320px - 360px)` },
      canvasActiveId: '',
      canvasTabList: [],

      //数据预览
      activeCondition: null,
      dataDetailComponent: false,

      //画布初始化数据
      dataInit,

      //算子的弹窗
      calculatorDialogVisible: false,
      calculatorDialogData: null,

      isCanSave: false,
      isCanClear: false,
      isCanRun: false,
      isShowNewTaskNotice: true,
      isCanZoomAdd: true,
      isCanZoomMinus: true,
      isFullScreen: false,

      taskTotal: 0,

      //抽屉
      isShowNodeMenu: true,
      isShowTaskList: false,
      isShowErrorLogDrawer: true,
      isShowResultDataDrawer: true,

      isFirstSave: false,
    };
  },
  components: {
    Drawer,
    flowNode,
    nodeMenu,
    taskList,
    draggable,
    calculatorDialog,
    Tools,
  },
  directives: {
    flowDrag: {
      bind(el, binding) {
        if (!binding) {
          return;
        }
        el.onmousedown = (e) => {
          if (e.button == 2) {
            // 右键不管
            return;
          }
          //  鼠标按下，计算当前原始距离可视区的高度
          let disX = e.clientX;
          let disY = e.clientY;
          let offsetLeft = el.firstChild.offsetLeft;
          let offsetTop = el.firstChild.offsetTop;
          el.style.cursor = 'move';
          document.onmousemove = function(event) {
            // 移动时禁止默认事件
            event.preventDefault();
            const left = event.clientX - (disX - offsetLeft);
            const top = event.clientY - (disY - offsetTop);
            el.firstChild.style.left = `${left}px`;
            el.firstChild.style.top = `${top}px`;
          };

          document.onmouseup = function(e) {
            el.style.cursor = 'auto';
            document.onmousemove = null;
            document.onmouseup = null;
          };
        };
      },
    },
  },
  watch: {
    async canvasActiveId(val, oldVal) {
      if (val != oldVal) {
        await this.$nextTick();
        if (!this.isFirstSave) {
          if (this.canvasActiveId) {
            this.editCanvasNamePopover = false;
            this.resetCanvasData();
          } else {
            if (this.canvasTabList.length == 0) {
              this.isCanSave = false;
              this.isCanClear = false;
              this.isShowNewTaskNotice = true;
              this.isCanRun = false;
              return;
            }
          }
        }
      }
    },
  },
  computed: {
    activeTabItem() {
      return (
        this.canvasTabList.find((item) => item.id == this.canvasActiveId) ||
        null
      );
    },
    activeTabIndex() {
      return this.canvasTabList.findIndex(
        (item) => item.id == this.canvasActiveId,
      );
    },
  },
  created() {
    //初始化
    this.jsPlumb = jsPlumb.getInstance();
    this.jsPlumb.ready(() => {
      // 导入默认配置
      this.jsPlumb.importDefaults(this.jsplumbSetting);
    });
  },
  async mounted() {
    window.onresize = () => {
      this.jsPlumb.setSuspendDrawing(false, true);
    };
  },
  methods: {
    mouseWheelAction(ev) {
      const deltay = ev.deltaY;
      const tabIndex = this.activeTabIndex;
      if (this.canvasTabList[tabIndex].zoom <= 0.1 && deltay > 0) {
        this.isCanZoomMinus = false;
        return;
      }
      if (this.canvasTabList[tabIndex].zoom >= 4 && deltay < 0) {
        this.isCanZoomAdd = false;
        return;
      }
      let scale = this.canvasTabList[tabIndex].zoom;
      scale += deltay * -0.01;
      scale = Math.min(Math.max(0.1, scale), 4);

      if (scale <= 0.1) {
        this.isCanZoomMinus = false;
      }
      if (scale >= 4) {
        this.isCanZoomAdd = false;
      }
      this.isCanZoomAdd = true;
      this.isCanZoomMinus = true;
      this.$set(this.canvasTabList, tabIndex, {
        ...this.canvasTabList[tabIndex],
        zoom: scale,
      });
      this.jsPlumb.setZoom(scale);
    },
    openTaskList() {
      this.$refs.taskList.resetParams();
    },
    async toggleEditCanvasNamePopover(name) {
      this.editCanvasNamePopover = !this.editCanvasNamePopover;
      await this.$nextTick();
      if (this.editCanvasNamePopover == true) {
        this.nameValidateForm.name = name;
      }
    },
    async closeAllTab() {
      this.isFirstSave = false;
      let isChange = false;
      this.canvasTabList.forEach((tab) => {
        if (!tab.status) {
          if (!utils.deepEqual(tab.data, tab.deepCloneData)) {
            isChange = isChange || true;
          } else {
            isChange = isChange || false;
          }
        } else {
          isChange = isChange || false;
        }
      });
      await this.$nextTick();
      if (isChange) {
        this.$confirm('刚刚修改的内容未保存，全部关闭将丢失！', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }).then(() => {
          this.canvasTabList = [];
          this.canvasActiveId = null;
          this.isCanSave = false;
          this.isCanClear = false;
          this.isShowNewTaskNotice = true;
          this.isCanRun = false;
        });
      } else {
        this.canvasTabList = [];
        this.canvasActiveId = null;
        this.isCanSave = false;
        this.isCanClear = false;
        this.isShowNewTaskNotice = true;
        this.isCanRun = false;
      }
    },
    tabClick(tab) {
      console.log(tab);
    },
    async resetFlowContainer() {
      let { data, id } = this.canvasTabList.find(
        (tabItem) => tabItem.id == this.canvasActiveId,
      );

      const tabIndex = this.activeTabIndex;
      this.$set(this.canvasTabList, tabIndex, {
        ...this.canvasTabList[tabIndex],
        zoom: 1,
      });
      this.jsPlumb.setZoom(1);
      await this.$nextTick();
      //重置所有 绝对定位信息
      const flowContainer = this.$refs[`flowContainer_${id}`][0];
      flowContainer.style.top = 0;
      flowContainer.style.left = 0;
      const containerRect = flowContainer.getBoundingClientRect();
      await utils.getTreeConstruction(data, id);
      utils.changeNodePosition(containerRect, data, 1, 0);
      await this.$nextTick();
      // this.jsPlumb.repaintEverything();
      this.jsPlumb.setSuspendDrawing(false, true);
    },
    changeZoom(zoom) {
      const tabIndex = this.activeTabIndex;
      this.$set(this.canvasTabList, tabIndex, {
        ...this.canvasTabList[tabIndex],
        zoom,
      });
      this.jsPlumb.setZoom(zoom);
    },
    changeTab(id) {
      const tab = this.canvasTabList.find((tabItem) => tabItem.id == id);
      if (!tab) return;
      this.isFirstSave = false;
      this.canvasActiveId = `${id}`;
    },
    // async saveForDraft() {
    //   const activeTab = this.activeTabItem;
    //   if (activeTab.data.nodeList.length == 0) {
    //     return this.$message.error('不能保存空画布！');
    //   }

    //   await this.$nextTick();
    //   const result = await this.createAction();
    //   if (result) {
    //     this.isShowTaskList = true;
    //     this.$refs.taskList.searchNoRunTask();
    //   }
    // },
    async resetCanvasData() {
      this.isFullScreen = false;
      if (this.canvasTabList.length == 0) {
        this.isCanSave = false;
        this.isCanClear = false;
        this.isShowNewTaskNotice = true;
        this.isCanRun = false;
        return;
      }
      const { status, data } = this.canvasTabList.find(
        (item) => item.id == this.canvasActiveId,
      );
      if (!status) {
        this.isCanSave = true;
      } else {
        this.isCanSave = false;
      }
      if (status == null) {
        this.isCanClear = true;
      } else {
        this.isCanClear = false;
      }
      if (status == null && data.nodeList.length == 0) {
        this.isShowNewTaskNotice = true;
      } else {
        this.isShowNewTaskNotice = false;
      }
      if (!status) {
        this.isCanRun = true;
      } else {
        this.isCanRun = false;
      }
      // this.jsPlumb.repaintEverything(false, true);
      // this.jsPlumb.repaintEverything();
      await this.$nextTick();
      console.log('reload');
      this.dataReload();
    },
    updateTaskTotal(val) {
      this.taskTotal = val;
    },
    setCondition({ condition, tempId }) {
      const { data } = this.canvasTabList.find(
        (item) => item.id == this.canvasActiveId,
      );
      const node = data.nodeList.find((item) => item.id == tempId);
      node.condition = condition;
    },
    async previewTaskDetail({ id, jobContent, log, status, resultData }) {
      //查看是否已经打开过
      const tab = this.canvasTabList.find((tab) => tab.id == id);
      if (tab) {
        return this.$message.error('已经打开过了！');
      }

      const data = utils.handleEchoJobData(jobContent);
      this.canvasTabList.push({
        name: jobContent.name,
        status,
        id,
        zoom: 1,
        data,
        log,
        deepCloneData: JSON.parse(JSON.stringify(data)),
        resultTableData: resultData,
      });
      this.isFirstSave = false;
      this.canvasActiveId = `${id}`;

      await this.$nextTick();
      this.canvasLoading = false;
    },
    judgeConditionComplete(data) {
      return new Promise((resolve) => {
        data.nodeList.forEach((node) => {
          if (node.condition && node.condition.length > 0) {
            node.condition.forEach((item) => {
              if (
                item.whereType != 3 &&
                !item.contentStart &&
                !item.contentEnd
              ) {
                resolve('筛选条件必须输入内容！');
              }
            });
          }
        });
        resolve();
      });
    },
    async clearCanvas() {
      const { data, status } = this.canvasTabList.find(
        (item) => item.id == this.canvasActiveId,
      );
      data.lineList = [];
      data.nodeList = [];
      this.jsPlumb.deleteEveryConnection(); //删除divID所有连接线
      this.jsPlumb.deleteEveryEndpoint();
      if (status == null) {
        this.isShowNewTaskNotice = true;
      } else {
        this.isShowNewTaskNotice = false;
      }
      this.dataReload();
    },
    handleCanvasNamePopover(value) {
      this.nameValidateForm.name = value;
    },
    // 返回唯一标识
    getUUID() {
      var data = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
      var nums = '';
      for (var i = 0; i < 9; i++) {
        var r = parseInt(Math.random() * 9 + 1);
        nums += data[r];
      }
      return nums;
    },
    // async createAction() {
    //   return new Promise(async (resolve, reject) => {
    //     const tab = this.canvasTabList.find(
    //       (item) => item.id == this.canvasActiveId,
    //     );

    //     const tabIndex = this.activeTabIndex;
    //     if (tab.status == null) {
    //       const checkMsg = await checkTaskName({
    //         jobName: tab.name,
    //       });
    //       if (checkMsg.data) {
    //         return this.$message.error('任务名称重复！');
    //       }
    //     }
    //     const params = {
    //       name: tab.name,
    //       elementList: utils.getElementList(tab.data),
    //       elementRelList: utils.getElementRelList(tab.data.lineList),
    //     };
    //     try {
    //       if (tab.status == 0) {
    //         this.isFirstSave = false;
    //         //编辑任务 status一定是 0
    //         const { data } = await editJob({ ...params, id: tab.id });
    //         tab.id = data;
    //       } else {
    //         this.isFirstSave = true;
    //         const { data } = await createJob(params);
    //         tab.id = data;
    //         tab.status = 0;
    //         this.canvasActiveId = `${data}`;
    //       }
    //       await this.$nextTick();
    //       tab.data = JSON.parse(JSON.stringify(tab.data));
    //       tab.deepCloneData = JSON.parse(JSON.stringify(tab.data));
    //       this.$message.success('保存方案成功！');
    //       resolve(tab.id);
    //     } catch (err) {
    //       resolve(err);
    //       console.log(err);
    //       this.$message.error('保存方案失败！');
    //     }
    //   });
    // },
    async handleCalculatorData({
      colRelList,
      sourceFiledList,
      targetFiledList,
      changeStatus,
    }) {
      const tab = this.canvasTabList.find(
        (item) => item.id == this.canvasActiveId,
      );
      if (!this.activeElement) return;
      const calculator = tab.data.nodeList.find(
        (item) => item.id == this.activeElement.nodeId,
      );
      calculator.sourceMap = colRelList;
      const line = tab.data.lineList.filter(
        (item) => item.to == this.activeElement.nodeId,
      );

      if (line.length < 2) return;
      line.forEach((item) => {
        let nodeIndex = tab.data.nodeList.findIndex((v) => v.id == item.from);
        let node = tab.data.nodeList[nodeIndex];
        if (node.rightOrLeft == null) {
          if (node.id == sourceFiledList[0].fromEleId) {
            node.field = sourceFiledList;
            node.rightOrLeft = 'left';
          } else if (node.id == targetFiledList[0].fromEleId) {
            node.field = targetFiledList;
            node.rightOrLeft = 'right';
          }
        } else {
          if (node.rightOrLeft == 'right') {
            this.$set(tab.data.nodeList, nodeIndex, {
              ...node,
              rightOrLeft: 'right',
              field: [...targetFiledList],
            });
          } else {
            this.$set(tab.data.nodeList, nodeIndex, {
              ...node,
              rightOrLeft: 'left',
              field: [...sourceFiledList],
            });
          }
        }
      });
      await this.$nextTick();
      if (changeStatus) {
        //修改映射关系，断线
        const connections = this.jsPlumb.getConnections();
        const removeFromNode = this.getParentNodes(
          calculator.id,
          tab.data.lineList,
        );
        if (connections && removeFromNode) {
          removeFromNode.forEach((nodeId) => {
            const connection = connections.find(
              (item) => item.sourceId == nodeId,
            );
            this.jsPlumb.deleteConnection(connection);
          });
        }
      }
      this.calculatorDialogVisible = false;
    },
    getParentNodes(id, lineList, result = []) {
      const parentLine = lineList.find((line) => line.from == id);
      if (parentLine) {
        result.push(id);
        const line = lineList.find(
          (line) => line.to == parentLine.to && line.from != id,
        );
        if (line) {
          result.push(line.from);
        }
        this.getParentNodes(parentLine.to, [...lineList], result);
      }
      return result;
    },
    // 拖拽结束时触发
    endCalculators(evt) {
      const draggableItem = this.calculators[evt.newDraggableIndex];
      const node = {
        ico: draggableItem.icon,
        name: draggableItem.label,
        tableId: draggableItem.tableId || null,
        type: draggableItem.type,
      };
      this.addNode(evt, node);
    },
    // 加载流程图
    async loadEasyFlow() {
      // 初始化节点
      const { data, status } = this.canvasTabList.find(
        (item) => item.id == this.canvasActiveId,
      );
      if (!status) {
        // await this.$nextTick();
        for (var i = 0; i < data.nodeList.length; i++) {
          let node = data.nodeList[i];
          // 设置源点，可以拖出线连接其他节点
          this.jsPlumb.makeSource(`${node.id}`, this.jsplumbSourceOptions);
          // // 设置目标点，其他源点拖出的线可以连接该节点
          this.jsPlumb.makeTarget(`${node.id}`, this.jsplumbTargetOptions);
          this.jsPlumb.draggable(`${node.id}`, {
            containment: false,
          });
        }
      }
      // 初始化连线
      for (let i = 0; i < data.lineList.length; i++) {
        let line = data.lineList[i];
        var connParam = {
          source: `${line.from}`,
          target: `${line.to}`,
          label: line.label ? line.label : '',
          connector: line.connector ? line.connector : '',
          anchors: line.anchors ? line.anchors : undefined,
          paintStyle: line.paintStyle ? line.paintStyle : undefined,
        };
        this.jsPlumb.connect(connParam, this.jsplumbConnectOptions);
      }
      this.$nextTick(function() {
        this.loadEasyFlowFinish = true;
      });
    },
    //线上的删除功能
    isShowDelete(status) {
      const iDom = document.createElement('i');
      if (status) {
        return iDom;
      }
      iDom.setAttribute('class', 'el-icon-error line-delete');
      iDom.setAttribute('style', 'color:#FF0000');
      return iDom;
    },
    jsPlumbInit() {
      const activeTab = this.activeTabItem;
      this.jsPlumb.ready(async () => {
        // 导入默认配置
        this.jsPlumb.importDefaults({
          ...this.jsplumbSetting,
          ConnectionOverlays: [
            [
              'Custom',
              {
                create: () => {
                  return this.isShowDelete(activeTab.status);
                },
                location: 0.5,
              },
            ],
          ],
          Container: `flowContainer_${activeTab.id}`,
        });
        // 会使整个jsPlumb立即重绘。
        this.jsPlumb.setSuspendDrawing(false, true);
        // 初始化节点
        this.loadEasyFlow();
        // 单点击了连接线, https://www.cnblogs.com/ysx215/p/7615677.html
        this.jsPlumb.bind('click', (conn) => {
          this.activeElement.type = 'line';
          this.activeElement.sourceId = conn.sourceId;
          this.activeElement.targetId = conn.targetId;
          this.deleteElement();
        });
        // 连线
        this.jsPlumb.bind('connection', (evt) => {
          console.warn('在连接线');
          let from = evt.source.id;
          let to = evt.target.id;
          if (this.loadEasyFlowFinish) {
            const { data } = this.canvasTabList.find(
              (item) => item.id == this.canvasActiveId,
            );
            data.lineList.push({ from: from, to: to });
            this.lineComplete(from, to);
          }
        });

        // 删除连线回调
        this.jsPlumb.bind('connectionDetached', async (evt) => {
          console.log('删除连线回调');
          if (activeTab.status) {
            return;
          }
          if (evt.sourceId && evt.targetId) {
            await this.deleteLine(evt.sourceId, evt.targetId);
          }
        });

        // 改变线的连接节点
        this.jsPlumb.bind('connectionMoved', (evt) => {
          this.changeLine(evt.originalSourceId, evt.originalTargetId);
        });

        // 连线右击
        this.jsPlumb.bind('contextmenu', (evt) => {
          console.log('contextmenu', evt);
        });

        // 连线
        this.jsPlumb.bind('beforeDrop', (evt) => {
          const from = evt.sourceId;
          const to = evt.targetId;
          if (from === to) {
            this.$message.error('节点不支持连接自己');
            return false;
          }
          if (this.hasLine(from, to)) {
            this.$message.error('该关系已存在,不允许重复创建');
            return false;
          }
          if (this.hashOppositeLine(from, to)) {
            this.$message.error('不支持两个节点之间连线回环');
            return false;
          }
          if (this.judgeIsTableLink(from, to)) {
            this.$message.error('不支持两个表之间互相连接');
            return false;
          }
          /**
           * 判断两个节点
           * 1。表--算子
           * 2. 算子--输出
           * 3.算子--算子
           */
          const tab = this.canvasTabList.find(
            (item) => item.id == this.canvasActiveId,
          );
          const nodeFrom = tab.data.nodeList.find((item) => item.id == from);
          const nodeTo = tab.data.nodeList.find((item) => item.id == to);

          const relations = tab.data.lineList.filter(
            (line) => line.to == to && line.from != from,
          );
          if (relations && relations.length == 2) {
            this.$message.error('一个算子只能连接两个表');
            return false;
          }
          if (nodeTo.type == 'table') {
            this.$message.error('表不能被连接！');
            return false;
          }

          if (nodeFrom.type == 'calculators') {
            const line = tab.data.lineList.filter((val) => val.to == from);
            if (line.length < 2) {
              this.$message.error('算子没有连接完整！');
              return false;
            }

            if (!nodeFrom.sourceMap || nodeFrom.sourceMap.length == 0) {
              this.$message.error('请至少选择一对映射关系连线！');
              return false;
            }

            //生成算子的表字段
            const calculatorsField = [];
            line.forEach((lineItem) => {
              const node = tab.data.nodeList.find(
                (nodeItem) => nodeItem.id == lineItem.from,
              );
              node.field.forEach((fieldItem) => {
                if (fieldItem.isOutputCol) {
                  calculatorsField.push({
                    name: fieldItem.rename,
                    rename: fieldItem.rename,
                    id: this.getUUID(),
                    isOutputCol: false,
                    isShowInput: false,
                    colLength: fieldItem.colLength,
                    decimalLength: fieldItem.decimalLength,
                    typeValue: fieldItem.typeValue,
                    tableUUId: nodeFrom.id,
                    fromEleId: nodeFrom.id,
                  });
                }
              });
            });
            nodeFrom.field = calculatorsField;
            console.log(calculatorsField);
          }

          if (nodeTo.type == 'export' && nodeFrom.type == 'table') {
            this.$message.error('表不能直接连接输出');
            return false;
          }

          return true;
        });

        // beforeDetach
        this.jsPlumb.bind('beforeDetach', (evt) => {
          console.warn('beforeDetach', evt);
        });
        this.jsPlumb.setContainer(
          this.$refs[`flowContainer_${activeTab.id}`][0],
        );
      });
    },
    // 删除线
    async deleteLine(fromId, toId) {
      const { data } = this.canvasTabList.find(
        (item) => item.id == this.canvasActiveId,
      );
      if (data.nodeList.length == 0) return;
      if (data.lineList.length == 0) return;
      //删除 节点相关的所有表数据和映射关系
      const toNode = data.nodeList.find((i) => i.id == toId);
      if (toNode && toNode.type !== 'export') {
        const fromId1 = data.nodeList.find((i) => i.id == fromId);
        const fromId2 = data.lineList.find(
          (item) => item.from != fromId && item.to == toId,
        );
        await this.resetNodeData(fromId1);
        await this.resetNodeData(toNode, true);
        if (fromId2) {
          const fromNode2 = data.nodeList.find(
            (item) => item.id == fromId2.from,
          );
          await this.resetNodeData(fromNode2);
        }
      }
      await this.$nextTick();
      //删除线
      data.lineList = data.lineList.filter(
        (line) => line.from !== fromId || line.to !== toId,
      );
    },
    // 是否具有该线
    hasLine(from, to) {
      const { data } = this.canvasTabList.find(
        (item) => item.id == this.canvasActiveId,
      );
      for (var i = 0; i < data.lineList.length; i++) {
        var line = data.lineList[i];
        if (line.from === from && line.to === to) {
          return true;
        }
      }
      return false;
    },

    async lineComplete(from, to) {
      const { data } = this.canvasTabList.find(
        (item) => item.id == this.canvasActiveId,
      );
      const toItem = data.nodeList.find((item) => item.id == to);
      if (toItem.type == 'calculators') {
        this.clickNode({
          id: toItem.id,
          type: toItem.type,
        });
        await this.$nextTick();
        this.calculatorDialogData = this.getCalculatorDialogData(toItem.id);
        if (!this.calculatorDialogData) return;
        await this.$nextTick();
        this.calculatorDialogVisible = true;
      }
    },
    // 是否含有相反的线
    hashOppositeLine(from, to) {
      return this.hasLine(to, from);
    },
    judgeIsTableLink(from, to) {
      const { data } = this.canvasTabList.find(
        (item) => item.id == this.canvasActiveId,
      );
      let result = false;
      const fromItem = data.nodeList.find((item) => item.id == from);
      const toItem = data.nodeList.find((item) => item.id == to);
      if (fromItem.type == 'table' && toItem.type == 'table') {
        result = true;
      }
      return result;
    },
    // 删除激活的元素
    deleteElement() {
      const activeTab = this.activeTabItem;
      if (activeTab.status) return;
      if (this.activeElement.type === 'line') {
        this.$confirm('确定删除所点击的线吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        })
          .then(() => {
            //判断是否可以删除线
            if (this.isHaveParent(this.activeElement.targetId))
              return this.$message.error('不能删除有父节点的连线！');

            //删除线的的连接两端的内容
            const source = activeTab.data.nodeList.find(
              (node) => node.id == this.activeElement.sourceId,
            );
            this.resetNodeData(source);
            const target = activeTab.data.nodeList.find(
              (node) => node.id == this.activeElement.targetId,
            );
            if (target.type == 'calculators') {
              this.resetNodeData(target, true);
            } else {
              this.resetNodeData(target);
            }

            var conn = this.jsPlumb.getConnections({
              source: this.activeElement.sourceId,
              target: this.activeElement.targetId,
            })[0];
            this.jsPlumb.deleteConnection(conn);
          })
          .catch(() => {});
      } else {
        this.deleteNode(this.activeElement.nodeId);
      }
    },
    isHaveParent(nodeId) {
      let result = false;
      const activeTab = this.activeTabItem;
      const node = activeTab.data.lineList.find((val) => val.from == nodeId);
      if (node) result = true;
      return result;
    },
    /**
     * 删除节点
     * @param nodeId 被删除节点的ID
     */
    deleteNode(nodeId) {
      const activeTab = this.activeTabItem;
      const { nodeList, lineList } = activeTab.data;
      //查验是否可以删除
      const relation = lineList.find((line) => line.from == nodeId);
      if (relation) {
        return this.$message.error('不能删除子节点！');
      }
      const currentNode = nodeList.find((item) => item.id == nodeId);
      this.$confirm('确定要删除节点' + currentNode.name + '?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        closeOnClickModal: false,
      })
        .then(() => {
          //删除 节点相关的所有表数据和映射关系
          this.deleteRelationNode(nodeId);
          //删除节点
          activeTab.data.nodeList = activeTab.data.nodeList.filter((node) => {
            if (node.id === nodeId) {
              return false;
            }
            return true;
          });

          if (activeTab.status == null && activeTab.data.nodeList.length == 0) {
            this.isShowNewTaskNotice = true;
          } else {
            this.isShowNewTaskNotice = false;
          }
          //删除节点连线
          activeTab.data.lineList = activeTab.data.lineList.filter(
            (node) => node.from !== nodeId && node.to !== nodeId,
          );
          this.$nextTick(function() {
            this.jsPlumb.removeAllEndpoints(nodeId);
          });
        })
        .catch(() => {});
      return true;
    },
    deleteRelationNode(nodeId) {
      const activeTab = this.activeTabItem;
      const line = activeTab.data.lineList.filter((item) => item.to == nodeId);
      line.forEach((val) => {
        const node = activeTab.data.nodeList.find((v) => v.id == val.from);
        this.resetNodeData(node);
      });
    },
    resetNodeData(node, isResetSourceMap = false) {
      if (node.field.length > 0) {
        node.field.forEach((val) => {
          val.rename = val.name;
          val.isOutputCol = false;
        });
      }
      node.rightOrLeft = null;
      if (isResetSourceMap) {
        node.sourceMap = null;
      }

      return node;
    },
    /**
     * 拖拽结束后添加新的节点
     * @param evt
     * @param nodeMenu 被添加的节点对象
     * @param mousePosition 鼠标拖拽结束的坐标
     */
    async addNode(evt, nodeMenu) {
      let screenX = evt.originalEvent.clientX,
        screenY = evt.originalEvent.clientY;
      const canvasContainerRect = document
        .querySelector('.panel-container .el-tabs__content')
        .getBoundingClientRect();
      let left = screenX,
        top = screenY;
      // 计算是否拖入到容器中
      if (
        left < canvasContainerRect.x ||
        left > canvasContainerRect.width + canvasContainerRect.x ||
        top < canvasContainerRect.y ||
        canvasContainerRect.y >
          canvasContainerRect.y + canvasContainerRect.height
      ) {
        this.$message.error('请把节点拖入到画布中');
        return;
      }
      if (this.canvasTabList.length == 0) {
        this.addTab();
      }
      await this.$nextTick();
      const activeTab = this.activeTabItem;
      const flowContainer = this.$refs[`flowContainer_${activeTab.id}`][0];
      if (nodeMenu.type == 'export') {
        const isHasExport = activeTab.data.nodeList.find(
          (node) => node.type == 'export',
        );
        if (isHasExport) {
          this.$message.error('画布中已经存在输出节点了，不能重复拖拽');
          return;
        }
      }

      left = left - canvasContainerRect.x;
      top = top - canvasContainerRect.y;

      if (nodeMenu.type == 'table') {
        left -= 100;
        top -= 15;
      } else {
        left -= 30;
        top -= 30;
      }
      const distanceToParentHeight =
        canvasContainerRect.height / activeTab.zoom -
        canvasContainerRect.height;
      const distanceToParentWidth =
        canvasContainerRect.width / activeTab.zoom - canvasContainerRect.width;

      top =
        top / activeTab.zoom -
        distanceToParentHeight / 2 -
        parseFloat(flowContainer.style.top || 0) / activeTab.zoom;
      left =
        left / activeTab.zoom -
        distanceToParentWidth / 2 -
        parseFloat(flowContainer.style.left || 0) / activeTab.zoom;

      const nodeId = this.getUUID();
      var node = {
        id: `${nodeId}`,
        name: nodeMenu.name,
        tableId: nodeMenu.tableId || null,
        type: nodeMenu.type,
        left: left + 'px',
        top: top + 'px',
        ico: nodeMenu.ico,
        state: 'success',
        field: [],
        condition: null,
        rightOrLeft: null,
        sourceMap: null,
      };

      if (this.isShowNewTaskNotice) {
        this.isShowNewTaskNotice = false;
      }
      activeTab.data.nodeList.push(node);
      this.$nextTick(function() {
        this.jsPlumb.makeSource(nodeId, this.jsplumbSourceOptions);
        if (nodeMenu.type !== 'table') {
          this.jsPlumb.makeTarget(nodeId, this.jsplumbTargetOptions);
        }
        this.jsPlumb.draggable(`${node.id}`, {
          containment: false,
          stop: function() {
            console.log('---------拖完了');
          },
        });
      });

      this.clickNode({ id: node.id, type: node.type });
    },
    nodeRightMenu(nodeId, evt) {
      this.menu.show = true;
      this.menu.curNodeId = nodeId;
      this.menu.left = evt.x + 'px';
      this.menu.top = evt.y + 'px';
    },
    // 改变节点的位置
    changeNodeSite(data) {
      const activeTab = this.activeTabItem;
      for (var i = 0; i < activeTab.data.nodeList.length; i++) {
        let node = activeTab.data.nodeList[i];
        if (node.id === data.nodeId) {
          node.left = data.left;
          node.top = data.top;
        }
      }
    },
    clickNode({ id, type, tableId }) {
      this.activeElement = { type, nodeId: id, tableId };
    },
    openPreview() {
      const { type, nodeId } = this.activeElement;
      const activeTab = this.activeTabItem;
      let node = null;
      switch (type) {
        case 'table':
          node = activeTab.data.nodeList.find((item) => item.id == nodeId);
          this.activeCondition = node.condition;
          this.dataDetailComponent = true;
          break;
        case 'calculators':
          this.calculatorDialogData = this.getCalculatorDialogData(nodeId);
          if (!this.calculatorDialogData)
            return this.$message.error(
              '必须选择两个表连接算子，才能设置映射关系！',
            );
          this.calculatorDialogVisible = true;
          break;
        default:
          break;
      }
    },
    //id 是算子的id
    getCalculatorDialogData(id) {
      const activeTab = this.activeTabItem;
      const line = activeTab.data.lineList.filter((item) => item.to == id);
      if (line.length < 2) {
        return false;
      }
      const calculatorData = { table: [], result: null };
      calculatorData.result = activeTab.data.nodeList.find((v) => v.id == id);
      line.forEach((item) => {
        const node = activeTab.data.nodeList.find((val) => val.id == item.from);
        calculatorData.table.push({ ...node });
      });

      return calculatorData;
    },
    // 加载流程图
    async dataReload() {
      this.jsPlumb = jsPlumb.getInstance();
      await this.$nextTick();
      jsPlumb.repaintEverything();
      this.jsPlumbInit();
    },
    addTab() {
      if (this.canvasTabList.length == 5) {
        return this.$message.error('一次只能打开5个任务！');
      }
      const currentTime = `${new Date().getTime()}`.substring(5);
      let name = `任务${currentTime}`;
      const id = this.getUUID();
      this.canvasTabList.push({
        name,
        id,
        status: null,
        zoom: 1,
        log: null,
        deepCloneData: { nodeList: [], lineList: [] },
        resultTableData: null,
        data: { nodeList: [], lineList: [] },
      });
      this.isFirstSave = false;
      this.canvasActiveId = `${id}`;
    },
    //无提示的删除
    async removeRepeatTaskTab(id = null, index = null) {
      let tabIndex = null;
      if (index != null) {
        tabIndex = index;
      }
      if (id != null) {
        tabIndex = this.canvasTabList.findIndex((tab) => tab.id == id);
      }
      const isActive =
        this.canvasTabList[tabIndex].id == this.canvasActiveId ? true : false;
      const activeIndex = tabIndex;
      await this.$nextTick();
      const preId = this.canvasTabList[activeIndex - 1]
        ? `${this.canvasTabList[activeIndex - 1].id}`
        : null;
      const nextId = this.canvasTabList[activeIndex + 1]
        ? `${this.canvasTabList[activeIndex + 1].id}`
        : null;
      this.canvasTabList.splice(tabIndex, 1);

      this.isFirstSave = false;
      if (isActive) {
        if (this.canvasTabList.length > 0) {
          this.canvasActiveId = preId || nextId;
        } else {
          this.canvasActiveId = null;
        }
      }
    },
    removeTab(index) {
      const tab = this.canvasTabList[index];
      if (!tab) return;
      if (!tab.status) {
        if (utils.deepEqual(tab.data, tab.deepCloneData)) {
          this.removeRepeatTaskTab(null, index);
        } else {
          this.$confirm('是否确定要关闭这个画布?', '', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
          }).then(async () => {
            this.removeRepeatTaskTab(null, index);
          });
        }
      } else {
        this.removeRepeatTaskTab(null, index);
      }
    },
    editCanvasName(index) {
      this.$refs.rulesForm[0].validate((valid) => {
        if (valid) {
          const isRepeatIndex = this.canvasTabList.findIndex(
            (item) => item.name == this.nameValidateForm.name,
          );
          if (isRepeatIndex >= 0 && isRepeatIndex != index) {
            return this.$message.error('任务名称重复！');
          }
          const tab = this.canvasTabList[index];
          tab.name = this.nameValidateForm.name;
          this.editCanvasNamePopover = false;
          this.resetCanvasData();
        } else {
          return false;
        }
      });
    },
  },
};
</script>
<style lang="scss" scoped>
@import url('../assets/scss/index.scss');
.panel {
  position: relative;
  display: flex;
  height: calc(100vh - 60px);

  &__title {
    position: relative;
    height: 60px;
    line-height: 60px;
    font-weight: 400;
    color: #333333;
    font-size: 20px;

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
      border-bottom: 1px solid #eaeaea;
    }
  }

  .left-part {
    position: relative;
    width: 320px;
    height: calc(100vh - 60px);
    padding: 0 20px;
    background: #fff;
    z-index: 2;

    /* .panel__title {
      margin: 0 20px;
    } */
  }

  .right-part {
    width: 360px;
    height: calc(100vh - 60px);
    background: #fff;
    z-index: 2;
    /* box-shadow: 0px 0px 8px 0px rgba(0, 0, 0, 0.1);s */
  }

  &-container {
    position: relative;
    width: calc(100vw - 320px - 360px);
    height: calc(100vh - 60px);
    flex: 1;

    &__title {
      position: relative;
      height: 100%;
      /* padding: 0 20px; */
      background: #fff;
      z-index: 1;
      box-shadow: 0px 2px 6px 0px rgba(0, 0, 0, 0.1);
    }

    .flow-button-group {
      display: flex;
      position: absolute;
      top: 80px;
      right: 20px;
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

    &__tabs {
      height: 100%;

      /deep/.el-tabs__nav {
        border: 0 !important;
      }

      /deep/.el-tabs__nav-wrap {
        margin: 0;
      }

      /deep/.el-tabs__nav-prev {
        line-height: 33px;
      }

      /deep/.el-tabs__nav-next {
        line-height: 33px;
      }

      /deep/.el-tabs__header {
        padding: 0 120px 0 20px;
        display: flex;
        align-items: flex-end;
        height: 60px;
        border: 0;
        box-shadow: 0px 2px 6px 0px rgba(0, 0, 0, 0.1);
      }

      /deep/ .el-tabs__content {
        height: calc(100% - 60px);
        background: #f0f2f5;

        .el-tab-pane {
          height: 100%;
        }
      }

      /deep/ .el-tabs__item {
        min-width: 180px;
        height: 32px;
        line-height: 32px;
        font-size: 14px;
        padding: 0 11px !important;
        display: inline-flex;
        align-items: center;
        justify-content: space-between;
        border-top: 1px solid #d7d7d7;
        border-left: 1px solid #d7d7d7 !important;
        border-bottom: 0;

        &:first-child {
          border-top-left-radius: 4px;
        }

        &:nth-last-child(3) {
          border-top-right-radius: 4px;
          border-right: 1px solid #d7d7d7;
        }

        &#tab-close {
          border: 0 !important;
          cursor: pointer;
          color: #333;
          min-width: 82px;

          .el-button {
            padding: 5px 10px;
          }
        }

        &#tab-add {
          padding: 0 !important;
          border: 0 !important;
          cursor: pointer;
          color: #333;
          width: 40px;
          min-width: 40px;
        }

        .edit-label-content {
          margin-right: 8px;
        }

        &:hover {
          .edit-label {
            .el-icon-close {
              visibility: visible;
            }
          }
        }

        &.is-active {
          .edit-label {
            .el-icon-close {
              visibility: visible;
            }
          }
        }

        > .el-icon-close {
          display: none;
        }

        .edit-label {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;

          &-content {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .el-icon-edit {
            margin: 0;
            width: 16px;
            font-size: 14px;
          }

          .el-icon-close {
            visibility: hidden;
            width: 18px !important;
            height: 18px;
            line-height: 1.1;
            font-size: 18px;
            color: #8a8a8a;
            margin: 0;

            &:hover {
              color: #fff;
            }
          }
        }
      }

      /deep/ .el-tabs__header {
        margin: 0;
      }
    }

    .button-group {
      position: absolute;
      top: 13px;
      right: 20px;
      width: 90px;
      white-space: nowrap;

      .add-tabs {
        display: inline-block;
        vertical-align: middle;
      }

      .el-button {
        margin-left: 10px;
      }
    }
  }

  .container {
    position: relative;
    height: 100%;
    flex: 1;
    overflow: visible;

    &::-webkit-scrollbar {
      display: none;
    }
  }

  .notice-for-new {
    user-select: none;
    visibility: visible;
    opacity: 0;
    position: absolute;
    z-index: auto;
    line-height: 28px;
    color: #8a8a8a;
    top: 50%;
    left: 50%;
    transition: all 300ms ease;
    transform: translate3d(-50%, 0, 0);

    &.active {
      z-index: 4;
      opacity: 1;
      visibility: visible;
      transform: translate3d(-50%, -50%, 0);
    }
  }

  /deep/ .result-component {
    position: absolute;
    z-index: 2;
    top: 80px;
    left: 20px;
    background: #fff;
    box-shadow: 0px 2px 6px 0px rgba(0, 0, 0, 0.1);

    &.readOnly {
      * {
        cursor: not-allowed !important;
      }
    }

    &__item {
      position: relative;
      width: 60px;
      font-size: 12px;
      padding: 11px 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: pointer;
      background: #fff;

      &:nth-child(1),
      &:nth-child(2) {
        &:after {
          content: '';
          position: absolute;
          margin: 0 10px;
          left: 0;
          bottom: 1px;
          width: calc(100% - 20px);
          height: 1px;
          background: #eaeaea;
        }
      }
    }

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

  .el-data-collision-add-tabs {
    cursor: pointer;
    display: inline-block;
    vertical-align: middle;
    width: 23px;
    height: 24px;
    background-size: contain;
    background-repeat: no-repeat;
    background-image: url(../assets/add-tabs.png);
  }

  .collision-full-screen {
    height: calc(100vh - 60px);
    /* height: 100%; */
    z-index: 10;
  }
}
</style>
<style lang="scss">
.edit-label-name-popover {
  margin-top: 20px !important;
}
.container_node-tooltip {
  max-width: 100vw;
  padding: 0 !important;
  cursor: default;
  * {
    cursor: default !important;
  }
}
.data-detail-slide-right {
  &-enter-active,
  &-leave-active {
    transition-timing-function: ease;
    transition-duration: 300ms;
    transition-property: opacity, transform;
  }

  &-enter,
  &-leave-to {
    transform: translate3d(540px, 0, 0);
  }
}
</style>
