<template>
  <div
    style="display: flex;justify-content: space-between;"
    class="collision-canvas"
  >
    <div>
      <el-table
        v-loading="sourceLoading"
        :data="sourceFiledList"
        header-cell-class-name="headerCss"
        ref="tableSource"
        border
        :style="[{ width: `${tableWidth * 100}px`, float: `left` }]"
      >
        <el-table-column
          v-for="(item, index) in sourceTableHeader"
          :key="item.prop"
          :label="item.label"
        >
          <template slot-scope="scope">
            <el-tooltip
              class="item"
              effect="light"
              :content="scope.row[item.prop]"
              placement="top-start"
            >
              <span class="edit-label">{{ scope.row[item.prop] }}</span>
            </el-tooltip>
            <span class="edit-iconfont">
              <el-tooltip
                class="item"
                effect="light"
                content="输出字段"
                placement="top"
              >
                <i
                  @click="chooseIsExport(scope.row, 'source')"
                  :class="{
                    'el-icon-export-icon': scope.row.isOutputCol,
                    'el-icon-no-export-icon': !scope.row.isOutputCol,
                  }"
                ></i>
              </el-tooltip>
            </span>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <canvas
      :id="canvasId"
      width="0"
      height="0"
      v-if="!sourceTableSameTargetTable"
    ></canvas>
    <div>
      <el-table
        v-loading="targetLoading"
        :data="targetFiledList"
        header-cell-class-name="headerCss"
        ref="tableTarget"
        border
        :style="`width: ${tableWidth * 100}px`"
      >
        <el-table-column
          v-for="(item, index) in targetTableHeader"
          :key="item.prop"
          :label="item.label"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <el-tooltip
              class="item"
              effect="light"
              :content="scope.row[item.prop]"
              placement="top-start"
            >
              <span class="edit-label">{{ scope.row[item.prop] }}</span>
            </el-tooltip>
            <span class="edit-iconfont">
              <el-tooltip
                class="item"
                effect="light"
                content="输出字段"
                placement="top"
              >
                <i
                  @click="chooseIsExport(scope.row, 'target')"
                  :class="{
                    'el-icon-export-icon': scope.row.isOutputCol,
                    'el-icon-no-export-icon': !scope.row.isOutputCol,
                  }"
                ></i>
              </el-tooltip>
            </span>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>
<script>
export default {
  name: 'table-and-canvas',
  props: {
    tableWidth: { type: String, default: '4' },
    canvasId: { type: String, default: 'are' },
    isUpdate: { type: Boolean, default: true },
    sourceTableSameTargetTable: { type: Boolean, default: false },
    targetLoading: { type: Boolean, default: false },
    sourceLoading: { type: Boolean, default: false },
    displayAutoSort: { type: Boolean, default: true },
    sourceFiledList: {
      type: Array,
      default: function() {
        return [];
      },
    },
    targetFiledList: {
      type: Array,
      default: function() {
        return [];
      },
    },
    relList: {
      type: Array,
      default: function() {
        return [];
      },
    },
    colRelList: {
      type: Array,
      default: function() {
        return [];
      },
    },
    sourceTableHeader: {
      type: Array,
      default: function() {
        return [{ prop: 'name', label: '字段名称' }];
      },
    },
    targetTableHeader: {
      type: Array,
      default: function() {
        return [{ prop: 'name', label: '字段名称' }];
      },
    },
    canvasWidth: {
      type: Number,
      default: 159,
    },
  },
  data() {
    return {
      gap: 54,
      gapFloat: 0.3,
      ctx: '',
      canvas: '',
      srcPoints: '',
      tarPoints: '',
      startP: '',
      endP: '',
      formCheckResult: [],
      currentRow: {},

      itemName: '',
    };
  },
  mounted() {
    // console.log("this.sourceTableHeader", this.sourceTableHeader);
  },
  methods: {
    resizeMethods(type) {
      this.$nextTick(() => {
        const sourceTableLength = this.sourceFiledList.length;
        const targetTableLength = this.targetFiledList.length;
        let height;
        if (sourceTableLength > targetTableLength) {
          height = this.$refs.tableSource.$el.offsetHeight;
        } else {
          height = this.$refs.tableTarget.$el.offsetHeight;
        }
        let canvas = document.getElementById(this.canvasId);
        const max = Math.max(sourceTableLength, targetTableLength);
        this.gap = height / (max + 1);
        canvas.height = max * this.gap + this.gap; //设置画布高度
        const {
          width: containerWidth,
        } = canvas.parentNode.getBoundingClientRect();
        const {
          width,
        } = canvas.parentNode.childNodes[0].getBoundingClientRect();
        canvas.width = containerWidth - width * 2;
        this.linePoint(type); //绘制点
      });
    },
    constructor(id, x, y, flag, r = 7.5, color = '#DDDDDD') {
      return { id, x, y, flag, r, color };
    },
    copy(id, x, y, color) {
      let p = this.constructor(id, x, y);
      p.color = '#2d78f4';
      return p;
    },
    chooseIsExport(item, tableType) {
      if (tableType == 'target') {
        //判断 映射字段中已经选中的 为输出字段的话，则不能重复选中
        const rel = this.colRelList.find((val) => val.targetColId == item.id);
        if (!rel) {
          item.isOutputCol = !item.isOutputCol;
          this.$emit('update:exportHeader', {
            node: item,
            status: item.isOutputCol,
          });
        } else {
          const sourceItem = this.sourceFiledList.find(
            (val) => val.id == rel.sourceColId,
          );
          if (item.isOutputCol)
            return this.$message.error('映射字段必须选择一个字段为输出字段');
          if (sourceItem.isOutputCol) {
            sourceItem.isOutputCol = false;
            item.isOutputCol = true;
            this.$emit('update:exportHeader', {
              node: sourceItem,
              status: false,
            });
            this.$emit('update:exportHeader', { node: item, status: true });
          } else {
            item.isOutputCol = true;
            this.$emit('update:exportHeader', { node: item, status: true });
          }
        }
      } else {
        const rel = this.colRelList.find((val) => val.sourceColId == item.id);
        if (!rel) {
          item.isOutputCol = !item.isOutputCol;

          this.$emit('update:exportHeader', {
            node: item,
            status: item.isOutputCol,
          });
        } else {
          const targetItem = this.targetFiledList.find(
            (val) => val.id == rel.targetColId,
          );
          if (item.isOutputCol)
            return this.$message.error('必须选择一个字段为输出字段');
          if (targetItem.isOutputCol) {
            targetItem.isOutputCol = false;
            this.$emit('update:exportHeader', {
              node: targetItem,
              status: false,
            });
            item.isOutputCol = true;
            this.$emit('update:exportHeader', {
              node: item,
              status: true,
            });
          } else {
            item.isOutputCol = true;
            this.$emit('update:exportHeader', {
              node: item,
              status: true,
            });
          }
        }
      }
    },
    autoSort_click(type) {
      let sameSourceList = [],
        diffSourceList = [],
        sameTargetList = [],
        diffTargetList = [];
      const sourceList = this.sourceFiledList;
      const targetList = this.targetFiledList;
      //排序前把最终保存的值存到真实的值里面
      if (type === 1) {
        if (this.relList) {
          this.changeColRelList('all', []);
          this.relList.forEach((item, index) => {
            const isTime = item.start.id == 0 ? true : false;
            const format = isTime ? 'yyyy-MM-dd HH:mm:ss' : '';
            this.changeColRelList('push', {
              isSourceTimeCol: isTime,
              sourceColId: item.start.id,
              targetColId: item.end.id,
              timeFormat: format,
              sequenceNo: item.sequence,
            });
          });
        }
        for (let i = 0; i < this.relList.length; i++) {
          for (let j = 0; j < sourceList.length; j++) {
            if (this.relList[i].start.id == sourceList[j].id) {
              sameSourceList.push(sourceList[j]);
            }
          }
        }
        diffSourceList = sourceList.filter(
          (item) => !sameSourceList.some((same) => same.id == item.id),
        );
        for (let i = 0; i < this.relList.length; i++) {
          for (let j = 0; j < targetList.length; j++) {
            if (this.relList[i].end.id == targetList[j].id) {
              sameTargetList.push(targetList[j]);
            }
          }
        }
        diffTargetList = targetList.filter(
          (item) => !sameTargetList.some((same) => same.id == item.id),
        );
      } else if (type === 2) {
        for (let i = 0; i < this.colRelList.length; i++) {
          for (let j = 0; j < sourceList.length; j++) {
            if (this.colRelList[i].sourceColId == sourceList[j].id) {
              sameSourceList.push(sourceList[j]);
            }
          }
        }
        diffSourceList = sourceList.filter(
          (item) => !sameSourceList.some((same) => same.id == item.id),
        );
        // sameTargetList = targetList.filter((item) => this.colRelList.some((same) => same.targetColId == item.id));
        for (let i = 0; i < this.colRelList.length; i++) {
          for (let j = 0; j < targetList.length; j++) {
            if (this.colRelList[i].targetColId == targetList[j].id) {
              sameTargetList.push(targetList[j]);
            }
          }
        }
        diffTargetList = targetList.filter(
          (item) => !sameTargetList.some((same) => same.id == item.id),
        );
      }
      this.resizeMethods(type);
      this.$emit('changeFiledList', {
        source: sameSourceList.concat(diffSourceList),
        target: sameTargetList.concat(diffTargetList),
      });
    },
    linePoint(type) {
      // 获取canvas dom
      this.canvas = document.getElementById(this.canvasId);
      // this.canvas.width = this.canvasWidth;
      this.ctx = this.canvas.getContext('2d');
      let width = this.canvas.width;
      let height = this.canvas.height;
      // 字段映射关系 最后需要提交的东西
      let colRelsList = this.colRelList;
      this.changeRelList('all', []);

      // 源表字段数据点
      // let srcList = [{id: 1}, {id: 2}, {id: 3}, {id: 4}, {id: 5}]; // 此处请求接口
      let srcList = this.sourceFiledList; // 此处请求接口
      // 目的字段数据点
      // let tarList = [{id: 7}, {id: 8}, {id: 9}, {id: 10}, {id: 11}, {id: 12}, {id: 13}]; // 此处请求接口
      let tarList = this.targetFiledList; // 此处请求接口
      // 间隔
      let len = Math.max(srcList.length, tarList.length);
      // let gap = height / (len + 2) || this.;
      let gap = this.gap;
      // 初始化显示点
      this.srcPoints = [];
      srcList.forEach((item, i) => {
        let p = this.constructor(
          item['id'],
          parseFloat(this.gapFloat * gap),
          parseFloat((i + 1.5) * gap),
          0,
        );
        this.srcPoints.push(p);
      });
      // let tarPoints = [];
      this.tarPoints = [];
      tarList.forEach((item, i) => {
        let p = this.constructor(
          item['id'],
          parseFloat(width - this.gapFloat * gap),
          parseFloat((i + 1.5) * gap),
          1,
        );
        this.tarPoints.push(p);
      });
      // 计算已存在的映射关系
      colRelsList.forEach((item) => {
        try {
          // console.log('----item', item);
          this.srcPoints.forEach((p) => {
            if (item['sourceColId'] == p.id) {
              //起点匹配
              let p1 = this.copy(p.id, p.x, p.y);
              p1.color = '#2d78f4';
              this.tarPoints.forEach((pp) => {
                if (item['targetColId'] == pp.id) {
                  //终点
                  let p2 = this.copy(pp.id, pp.x, pp.y);
                  p2.color = '#2d78f4';
                  let rel = {
                    start: p1,
                    end: p2,
                    sequence: item['sequenceNo'],
                  };
                  this.changeRelList('push', rel);
                  throw new Error('ending'); //该item对应映射计算完成 跳出循环
                }
              });
            }
          });
        } catch (e) {
          if (e.message == 'ending') {
            return;
          }
        }
      });
      // 一对映射关系
      this.startP = null;
      this.endP = null;
      this.redraw();
      if (this.isUpdate) {
        // 鼠标点击的时候
        this.canvas.addEventListener('mousedown', (event) => {
          this.detect(event);
        });
        // 鼠标抬起的时候
        this.canvas.addEventListener('mouseup', (event) => {
          this.reset(event);
        });
        // 鼠标移动的时候
        this.canvas.addEventListener('mousemove', (event) => {
          this.dragLine(event);
        });
        // 鼠标双击的时候
        this.canvas.addEventListener('dblclick', (event) => {
          this.quitRels(event);
        });
      }
    },
    redraw() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.drawPoints(this.srcPoints.concat(this.tarPoints));
      if (this.startP) this.drawPoint(this.startP);
      if (this.endP) this.drawPoint(this.endP);
      if (this.relList.length > 0) {
        this.drawRelList(this.relList);
      }
    },
    drawPoints(ps) {
      ps.forEach((p) => {
        this.drawPoint(p);
      });
    },
    drawPoint({ x, y, r, color }) {
      if (this.ctx) {
        if (color == '#DDDDDD') {
          this.ctx.beginPath();
          this.ctx.arc(x, y, r, 0, 2 * Math.PI);
          this.ctx.fillStyle = '#DDDDDD';
          this.ctx.fill();
          this.ctx.beginPath();
          this.ctx.arc(x, y, r - 1, 0, 2 * Math.PI);
          this.ctx.fillStyle = '#fff';
          this.ctx.fill();
        } else {
          this.ctx.beginPath();
          this.ctx.arc(x, y, r, 0, 2 * Math.PI);
          this.ctx.fillStyle = '#1890FF';
          this.ctx.fill();
          this.ctx.beginPath();
          this.ctx.arc(x, y, r - 1, 0, 2 * Math.PI);
          this.ctx.fillStyle = '#fff';
          this.ctx.fill();
          this.ctx.beginPath();
          this.ctx.arc(x, y, r - 4, 0, 2 * Math.PI);
          this.ctx.fillStyle = '#1890FF';
          this.ctx.fill();
        }
      }
    },
    drawLine(p1, p2) {
      this.drawArrow(this.ctx, p1.x, p1.y, p2.x, p2.y, 30, 10, 1, '#1890FF');
    },
    // 计算两点距离
    calDistance(p1, p2) {
      return ((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2) ** 0.5;
    },
    // 点击检测
    detect(event) {
      //鼠标点击canvas，获取的鼠标点击的位置(x,y)
      var x = event.clientX - this.canvas.getBoundingClientRect().left;
      var y = event.clientY - this.canvas.getBoundingClientRect().top;
      let p0 = this.constructor(0, x, y);
      this.srcPoints.concat(this.tarPoints).forEach((p) => {
        if (this.calDistance(p, p0) < p.r) {
          if (p.flag == 0) {
            this.startP = this.copy(p.id, p.x, p.y);
            // this.startP.color = "#2d78f4";
          } else {
            this.endP = this.copy(p.id, p.x, p.y);
            // this.endP.color = "#2d78f4";
          }
        }
      });
    },
    reset() {
      this.startP = null;
      this.endP = null;
      this.redraw();
    },
    dragLine(event) {
      //鼠标点击canvas，获取的鼠标点击的位置(x,y)
      var x = event.clientX - this.canvas.getBoundingClientRect().left;
      var y = event.clientY - this.canvas.getBoundingClientRect().top;
      let p0 = this.constructor(0, x, y);
      if (this.startP) {
        this.tarPoints.forEach((p) => {
          if (
            this.startP &&
            this.calDistance(this.startP, p0) > p.r &&
            this.calDistance(p, p0) < p.r
          ) {
            this.endP = this.copy(p.id, p.x, p.y);
            this.endP.color = '#2d78f4';
            this.saveRel();
          }
        });
        this.redraw();
        if (this.startP) this.drawLine(this.startP, p0);
        return;
      }
      if (this.endP) {
        this.srcPoints.forEach((p) => {
          if (
            this.endP &&
            this.calDistance(this.endP, p0) > p.r &&
            this.calDistance(p, p0) < p.r
          ) {
            this.startP = this.copy(p.id, p.x, p.y);
            this.startP.color = '#2d78f4';
            this.saveRel();
          }
        });
        this.redraw();
        if (this.endP) this.drawLine(p0, this.endP);
      }
    },
    async saveRel() {
      // let p1 = this.startP.copy();
      let p1 = this.copy(this.startP.id, this.startP.x, this.startP.y);
      // let p2 = this.endP.copy();
      let p2 = this.copy(this.endP.id, this.endP.x, this.endP.y);
      for (let i = 0; i < this.relList.length; i++) {
        if (
          this.relList[i]['start'].id == this.startP.id ||
          this.relList[i]['end'].id == this.endP.id
        ) {
          // 已经存在该映射关系
          this.endP = null;
          this.startP = null;
          return;
        }
      }
      let rel = {
        start: p1,
        end: p2,
        sequence: this.relList.length,
      };
      if (JSON.stringify(this.relList).indexOf(`"id":${p2.id},`) > -1) {
        return;
      }
      this.changeRelList('push', rel);
      this.changeColRelList('all', []);
      this.relList.forEach((item) => {
        this.changeColRelList('push', {
          sourceColId: item.start.id,
          targetColId: item.end.id,
        });
      });

      await this.$nextTick();
      const nodeLeft = this.sourceFiledList.find((item) => item.id == p1.id);
      const nodeRight = this.targetFiledList.find((item) => item.id == p2.id);
      if (nodeRight.isOutputCol) {
        nodeLeft.rename = nodeRight.rename;
      }
      if (nodeLeft.isOutputCol) {
        nodeRight.rename = nodeLeft.rename;
      }
      if (!nodeRight.isOutputCol && !nodeLeft.isOutputCol) {
        nodeLeft.isOutputCol = true;
        this.$emit('update:exportHeader', {
          node: nodeLeft,
          status: true,
        });
        nodeRight.rename = nodeLeft.rename;
      }
      this.$emit('update:targetFiledList', this.targetFiledList);
      this.$emit('update:sourceFiledList', this.sourceFiledList);
    },
    drawRelList() {
      this.relList.forEach((rel) => {
        this.drawPoint(rel.start);
        this.drawPoint(rel.end);
        this.drawLine(rel.start, rel.end);
      });
    },
    changeRelList(type, data) {
      let relList = this.relList;
      switch (type) {
        case 'push':
          relList.push(data);
          break;
        case 'pop':
          relList.pop();
          break;
        case 'set':
          if (typeof data === 'object') {
            let { i, temp } = data;
            this.$set(relList, i, temp);
          }
          break;
        case 'all':
          relList.splice(0);
          break;
        default:
          break;
      }
      this.$emit('update:relList', relList);
    },
    changeColRelList(type, data) {
      let colRelList = this.colRelList;
      switch (type) {
        case 'push':
          const nodeLeft = this.sourceFiledList.find(
            (item) => item.id == data.sourceColId,
          );
          const nodeRight = this.targetFiledList.find(
            (item) => item.id == data.targetColId,
          );
          if (nodeRight.isOutputCol && nodeLeft.isOutputCol) {
            nodeRight.isOutputCol = false;
            this.$emit('update:exportHeader', {
              node: nodeRight,
              status: false,
            });
          }
          if (!nodeRight.isOutputCol && !nodeLeft.isOutputCol) {
            nodeLeft.isOutputCol = true;
            this.$emit('update:exportHeader', {
              node: nodeLeft,
              status: true,
            });
          }
          if (nodeRight.isOutputCol) {
            nodeLeft.rename = nodeRight.rename;
          }
          if (nodeLeft.isOutputCol) {
            nodeRight.rename = nodeLeft.rename;
          }
          this.$emit('update:targetFiledList', this.targetFiledList);
          this.$emit('update:sourceFiledList', this.sourceFiledList);
          colRelList.push(data);
          break;
        case 'all':
          //全删除
          colRelList.splice(0);
          break;
      }
      this.$emit('update:colRelList', colRelList);
    },
    quitRels(event) {
      //鼠标点击canvas，获取的鼠标点击的位置(x,y)
      var x = event.clientX - this.canvas.getBoundingClientRect().left;
      var y = event.clientY - this.canvas.getBoundingClientRect().top;
      let p0 = this.constructor(0, x, y);
      this.srcPoints.concat(this.tarPoints).forEach((p) => {
        if (this.calDistance(p, p0) < p.r) {
          console.log(p.flag == 0 ? '源表id ' + p.id : '目的表id ' + p.id);
          for (let i = 0; i < this.relList.length; i++) {
            if (p.flag == 0) {
              if (this.relList[i]['start'].id == p.id) {
                console.log(
                  '源表id ' + p.id,
                  '映射关系 ',
                  this.relList[i]['start'].id,
                );
                this.resetOutputCol(
                  this.relList[i]['start'].id,
                  this.relList[i]['end'].id,
                );
                let temp = this.relList[this.relList.length - 1];
                this.changeRelList('set', { i, temp });
                this.changeRelList('pop');
                i--;
              }
            } else {
              if (this.relList[i]['end'].id == p.id) {
                console.log(
                  '目的表id ' + p.id,
                  '映射关系 ',
                  this.relList[i]['end'].id,
                );
                this.resetOutputCol(
                  this.relList[i]['start'].id,
                  this.relList[i]['end'].id,
                );
                let temp = this.relList[this.relList.length - 1];
                this.changeRelList('set', { i, temp });
                this.changeRelList('pop');

                i--;
              }
            }
          }
        }
      });
      this.reset();
      this.changeColRelList('all', []);
      this.relList.forEach((item) => {
        this.changeColRelList('push', {
          sourceColId: item.start.id,
          targetColId: item.end.id,
        });
      });
    },
    async resetOutputCol(startId, endId) {
      const nodeLeft = this.sourceFiledList.find((item) => item.id == startId);
      const nodeRight = this.targetFiledList.find((item) => item.id == endId);
      nodeLeft.isOutputCol = false;
      nodeRight.isOutputCol = false;
      await this.$emit('update:exportHeader', {
        node: nodeLeft,
        status: false,
      });
      await this.$emit('update:exportHeader', {
        node: nodeRight,
        status: false,
      });
      nodeLeft.rename = nodeLeft.name;
      nodeRight.rename = nodeRight.name;
      this.$emit('update:targetFiledList', this.targetFiledList);
      this.$emit('update:sourceFiledList', this.sourceFiledList);
    },
    drawArrow(ctx, fromX, fromY, toX, toY, theta, headlen, width, color) {
      theta = typeof theta !== 'undefined' ? theta : 30;
      headlen = typeof theta !== 'undefined' ? headlen : 10;
      width = typeof width !== 'undefined' ? width : 1;
      color = typeof color !== 'color' ? color : '#000';
      // 计算各角度和对应的P2,P3坐标
      var angle = (Math.atan2(fromY - toY, fromX - toX) * 180) / Math.PI,
        angle1 = ((angle + theta) * Math.PI) / 180,
        angle2 = ((angle - theta) * Math.PI) / 180,
        topX = headlen * Math.cos(angle1),
        topY = headlen * Math.sin(angle1),
        botX = headlen * Math.cos(angle2),
        botY = headlen * Math.sin(angle2);

      this.ctx.save();
      this.ctx.beginPath();

      var arrowX = fromX - topX,
        arrowY = fromY - topY;

      this.ctx.moveTo(arrowX, arrowY);
      this.ctx.moveTo(fromX, fromY);
      this.ctx.lineTo(toX, toY);
      arrowX = toX + topX;
      arrowY = toY + topY;
      this.ctx.moveTo(arrowX, arrowY);
      this.ctx.lineTo(toX, toY);
      arrowX = toX + botX;
      arrowY = toY + botY;
      this.ctx.lineTo(arrowX, arrowY);
      this.ctx.strokeStyle = color;
      this.ctx.lineWidth = width;
      this.ctx.stroke();
      this.ctx.restore();
    },
  },
};
</script>
<style lang="scss">
.collision-canvas {
  /deep/ .el-tooltip {
    outline: none;
  }

  .headerCss {
    height: 40px;
  }

  /deep/ .el-table__row {
    height: 40px;

    td {
      padding: 5px 0;

      > .cell {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .edit-table-item-name {
          .el-input__inner {
            border-right: 0;
            padding-right: 0;
          }

          .el-input__inner:focus {
            border-color: #dcdfe6;
          }
          .el-input-group__append {
            background: #fff;
            padding: 0 5px;
            margin: 0;

            .el-button {
              padding: 0;
              margin: 0;
              vertical-align: middle;
              i {
                font-size: 16px;

                &.el-icon-success {
                  color: #5acc9b;
                }

                &:before {
                  font-size: inherit;
                }
              }
            }
          }
        }

        .edit-iconfont {
          display: flex;
          align-items: center;
          font-size: 16px;

          .el-icon-edit {
            margin-right: 20px;
          }
        }
      }
    }
  }

  .edit-label {
    width: 150px;
    color: #666666 !important;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
}

.el-icon-export-icon {
  width: 16px;
  height: 16px;
  background: url(../assets/export-text.png) center no-repeat;
  background-size: contain;
}
.el-icon-no-export-icon {
  width: 16px;
  height: 16px;
  background: url(../assets/no-export-text.png) center no-repeat;
  background-size: contain;
}
</style>
