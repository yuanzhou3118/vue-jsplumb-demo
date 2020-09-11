<script>
import {
  Dialog,
  Message,
  Button,
  Table,
  TableColumn,
  Tooltip,
  Input,
  MessageBox,
} from 'element-ui';
import { defineComponent, ref, onMounted, watch } from '@vue/composition-api';
import { handleTableElementContent, deepEqual } from '../util/util';
import canvasTable from './canvasTable';

export const ModuleTitle = ({ children, data, props: { showTips } }) => (
  <div style="display: flex;align-items: center;" {...data}>
    {showTips && <div class="blueTips"></div>}
    <div class="moduleTitle">{children}</div>
  </div>
);

export default defineComponent({
  name: 'calculator-dialog',
  props: {
    calculatorDialogVisible: { type: Boolean, default: false },
    status: { type: Number, default: null },
    data: {
      type: Object,
      default: function() {
        return {};
      },
    },
  },
  setup(props, { emit, parent }) {
    const exportHeader = ref([]);
    const relList = ref([]);
    const itemName = ref(null);
    const colRelList = ref([]);
    const sourceFiledList = ref([]);
    const targetFiledList = ref([]);
    const data = ref(JSON.parse(JSON.stringify(props.data)));
    const sourceLoading = ref(false);
    const targetLoading = ref(false);
    const tableAndCanvas = ref(null);

    const handleCancel = () => {
      // if (colRelList.value.length == 0)
      //   return Message.error('必须选择一个映射关系');
      emit('update:calculatorDialogVisible', false);
      emit('cancel');
    };

    const handleConfirm = async () => {
      if (colRelList.value.length == 0)
        return Message.error('必须选择一个映射关系');
      let sourceMapChangeStatus = false;
      if (
        props.data.result.sourceMap &&
        props.data.result.sourceMap.length > 0 &&
        !deepEqual(props.data.result.sourceMap, colRelList.value)
      ) {
        sourceMapChangeStatus = true;
      }
      let exportChangeStatus = false;
      if (
        props.data.result.sourceMap &&
        props.data.result.sourceMap.length > 0 &&
        props.data.table[0].field.length > 0 &&
        props.data.table[1].field.length
      ) {
        const leftTable = props.data.table.find(
          (table) => table.rightOrLeft == 'left',
        );
        const rightTable = props.data.table.find(
          (table) => table.rightOrLeft == 'right',
        );
        if (!deepEqual(leftTable.field, sourceFiledList.value)) {
          exportChangeStatus = true;
        }
        if (!deepEqual(rightTable.field, targetFiledList.value)) {
          exportChangeStatus = true;
        }
      }
      if (sourceMapChangeStatus || exportChangeStatus) {
        try {
          MessageBox.confirm(
            '修改中间的映射关系和输出字段将影响到后边的所有连线',
            '提示',
            {
              type: 'warning',
              cancelButtonText: '取消',
              confirmButtonText: '确定',
              beforeClose: (action, instance, done) => {
                if (action === 'confirm') {
                  emit('confirm', {
                    changeStatus: true,
                    colRelList: colRelList.value,
                    sourceFiledList: sourceFiledList.value,
                    targetFiledList: targetFiledList.value,
                  });
                  done();
                } else done();
              },
            },
          );
        } finally {
        }
      } else {
        emit('confirm', {
          changeStatus: false,
          colRelList: colRelList.value,
          sourceFiledList: sourceFiledList.value,
          targetFiledList: targetFiledList.value,
        });
      }
    };

    const getSourceTableField = async (item) => {
      sourceLoading.value = true;
      try {
        if (item.tableId) {
          sourceFiledList.value = await handleTableElementContent(
            item.tableId,
            item.id,
          );
          await parent.$nextTick();
        } else {
          sourceFiledList.value = [].concat(item.field);
          await parent.$nextTick();
        }
        await initSource();
        sourceLoading.value = false;
      } catch (err) {
        sourceLoading.value = false;
        Message.error('查询表字段接口报错！');
      }
    };

    const getTargetTableField = async (item) => {
      targetLoading.value = true;
      try {
        if (item.tableId) {
          targetFiledList.value = await handleTableElementContent(
            item.tableId,
            item.id,
          );
          await parent.$nextTick();
        } else {
          targetFiledList.value = [].concat(item.field);
          await parent.$nextTick();
        }
        await initSource();
        targetLoading.value = false;
      } catch (err) {
        targetLoading.value = false;
        Message.error('查询表字段接口报错！');
      }
    };

    const getTableColumns = async () => {
      Object.values(data.value.table).forEach(async (item, index) => {
        if (item.rightOrLeft == null) {
          //没有左右表关系 即没有表字段的内容 field为空
          if (index == 0) {
            //默认第一个为 source表  第二个为 target表
            await getSourceTableField(item);
          } else {
            await getTargetTableField(item);
          }
        } else {
          if (item.rightOrLeft == 'left') {
            sourceFiledList.value = [...item.field];
          } else if (item.rightOrLeft == 'right') {
            targetFiledList.value = [...item.field];
          }
          initSource();
        }
      });
      await parent.$nextTick();
      /**
       * 就遍历一下左右表生成 输出字段
       */
      const fieldList = [];
      sourceFiledList.value.forEach((item) => {
        if (item.isOutputCol) {
          fieldList.push({
            //左右表的字段的id
            relationTempId: item.id,
            name: item.rename,
            isShowInput: false,
            rename: item.rename,
          });
        }
      });
      targetFiledList.value.forEach((item) => {
        if (item.isOutputCol) {
          fieldList.push({
            //左右表的字段的id
            relationTempId: item.id,
            name: item.rename,
            isShowInput: false,
            rename: item.rename,
          });
        }
      });
      exportHeader.value = fieldList;
    };

    const initSource = () => {
      if (data.value.result.sourceMap) {
        //映射关系 赋值
        colRelList.value = data.value.result.sourceMap;
        resizeMethods();
        //输出结果 赋值
        exportHeader.value = data.value.result.field;
      } else {
        tableAndCanvas.value.autoSort_click(2);
      }
    };

    const resizeMethods = (type) => {
      tableAndCanvas.value.resizeMethods(type);
    };

    const handleRelList = (val) => {
      relList.value = val;
    };
    const handleColRelList = (val) => {
      colRelList.value = val;
    };

    const cleanRelList = () => {
      relList.value.splice(0);
    };

    //生成对应的输出字段表头
    const handleExportHeader = () => {
      exportHeader.value = [];
      const data = [...targetFiledList.value, ...sourceFiledList.value];
      data.forEach((item) => {
        if (item.isOutputCol) {
          if (
            !exportHeader.value.find((value) => value.rename == item.rename)
          ) {
            exportHeader.value.push({
              name: item.rename,
              rename: item.rename,
              isShowInput: false,
              relationTempId: item.id,
            });
          }
        }
      });
    };

    const handleTargetFiledList = (val) => {
      targetFiledList.value = val;
      // handleExportHeader();
    };

    const handleSourceFiledList = (val) => {
      sourceFiledList.value = val;
      // handleExportHeader();
    };

    const handleExportHeaderItem = ({ node, status }) => {
      if (status) {
        exportHeader.value.push({
          name: node.rename,
          rename: node.rename,
          isShowInput: false,
          relationTempId: node.id,
        });
      } else {
        const headIndex = exportHeader.value.findIndex(
          (head) => head.relationTempId == node.id,
        );
        if (headIndex >= 0) {
          exportHeader.value.splice(headIndex, 1);
        }
      }
    };

    const changeFiledList = ({ source, target }) => {
      sourceFiledList.value = source;
      targetFiledList.value = target;
      sourceFiledList.value = removeRepeat(sourceFiledList.value, 'id');
      targetFiledList.value = removeRepeat(targetFiledList.value, 'id');
    };

    function removeRepeat(jsonArray, key) {
      let hash = {};
      return jsonArray.reduce(function(item, next) {
        hash[next[key]] ? '' : (hash[next[key]] = true && item.push(next));
        return item;
      }, []);
    }

    const changeTableItemName = async (type, item) => {
      switch (type) {
        case 0:
          exportHeader.value.forEach((item) => {
            item.isShowInput = false;
          });
          await parent.$nextTick();
          itemName.value = item.rename;
          item.isShowInput = true;
          break;
        case 1: //保存修改的输出字段名称
          let outputNode = targetFiledList.value.find(
            (val) => val.id == item.relationTempId,
          );
          if (outputNode) {
            //查看是否有关联关系 如果有 需要把对应的映射的字段也更新rename
            const sourceMap = colRelList.value.find(
              (val) => val.targetColId == outputNode.id,
            );
            if (sourceMap) {
              const sourceNode = sourceFiledList.value.find(
                (val) => val.id == sourceMap.sourceColId,
              );
              sourceNode.rename = itemName.value;
            }
            outputNode.rename = itemName.value;
          } else {
            outputNode = sourceFiledList.value.find(
              (val) => val.id == item.relationTempId,
            );
            if (outputNode) {
              const sourceMap = colRelList.value.find(
                (val) => val.sourceColId == outputNode.id,
              );
              if (sourceMap) {
                const targetNode = targetFiledList.value.find(
                  (val) => val.id == sourceMap.targetColId,
                );
                targetNode.rename = itemName.value;
              }
              outputNode.rename = itemName.value;
            }
          }
          item.rename = itemName.value;
          item.isShowInput = false;
          break;
        case 2: //取消
          itemName.value = null;
          item.isShowInput = false;
          break;
        default:
          break;
      }
    };

    watch(tableAndCanvas, async () => {
      if (!tableAndCanvas.value) return;
      if (data.value.table.length > 0) {
        getTableColumns();
      }
    });

    onMounted(() => {});

    return () => {
      return (
        <Dialog
          onClose={handleCancel}
          closeOnClickModal={false}
          class="calculator-dialog"
          visible={props.calculatorDialogVisible}
        >
          <ModuleTitle slot="title">设置关联关系</ModuleTitle>
          <div
            class={`calculator-dialog__content ${
              props.status ? `readOnly` : null
            }`}
          >
            <section>
              <ModuleTitle class="calculator-dialog__content-title">
                <span>配置字段</span>
                <Tooltip class="item" effect="light" placement="top-start">
                  <div slot="content">
                    1.每个数据碰撞算子至少需要存在一组关联字段；
                    <br />
                    2.选中的关联字段组将默认作为一个输出字段进行输出
                  </div>
                  <span class="set-notice">
                    <i class="el-icon-question" />
                    配置说明
                  </span>
                </Tooltip>
              </ModuleTitle>
              <div class="calculator-dialog__content-canvas">
                <canvasTable
                  onCleanRelList={cleanRelList}
                  onChangeFiledList={changeFiledList}
                  onResizeMethods={resizeMethods}
                  relList={relList.value}
                  colRelList={colRelList.value}
                  {...{
                    on: {
                      'update:relList': handleRelList.bind(null),
                      'update:colRelList': handleColRelList.bind(null),
                      'update:exportHeader': handleExportHeaderItem.bind(null),
                      'update:targetFiledList': handleTargetFiledList.bind(
                        null,
                      ),
                      'update:sourceFiledList': handleSourceFiledList.bind(
                        null,
                      ),
                    },
                  }}
                  tableWidth={`2.3`}
                  sourceLoading={sourceLoading.value}
                  sourceFiledList={sourceFiledList.value}
                  targetLoading={targetLoading.value}
                  targetFiledList={targetFiledList.value}
                  ref={tableAndCanvas}
                />
              </div>
            </section>
            <section>
              <ModuleTitle class="calculator-dialog__content-title">
                输出预览
              </ModuleTitle>
              <div class="export-table el-table el-table--small" height={60}>
                <div class="el-table__header-wrapper">
                  <table class="el-table__header">
                    <thead>
                      <tr>
                        {Object.entries(exportHeader.value).map(([, head]) => {
                          const { name, rename, isShowInput } = head;
                          return (
                            <th>
                              <div class="cell">
                                {!isShowInput && [
                                  <Tooltip
                                    class="item"
                                    effect="light"
                                    content={name}
                                    placement="top-start"
                                  >
                                    <span class="edit-label">{rename}</span>
                                  </Tooltip>,
                                  !props.status && (
                                    <Tooltip
                                      class="item"
                                      effect="light"
                                      content="编辑名称"
                                      placement="top"
                                    >
                                      <i
                                        onClick={changeTableItemName.bind(
                                          null,
                                          0,
                                          head,
                                        )}
                                        class="el-icon-edit"
                                      />
                                    </Tooltip>
                                  ),
                                ]}
                                {isShowInput && (
                                  <Input
                                    class="edit-table-item-name"
                                    vModel={itemName.value}
                                    onBlur={changeTableItemName.bind(
                                      null,
                                      2,
                                      head,
                                    )}
                                    nativeOnKeyup={(e) => {
                                      e.key === 'Enter' &&
                                        changeTableItemName(1, head);
                                    }}
                                  >
                                    <Button
                                      onClick={changeTableItemName.bind(
                                        null,
                                        1,
                                        head,
                                      )}
                                      slot={`append`}
                                      icon="el-icon-success"
                                    />
                                    <Button
                                      onClick={changeTableItemName.bind(
                                        null,
                                        2,
                                        head,
                                      )}
                                      slot="append"
                                      icon="el-icon-circle-close"
                                    />
                                  </Input>
                                )}
                              </div>
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                  </table>
                </div>
              </div>
            </section>
          </div>
          <div slot="footer">
            <Button onClick={handleCancel}>取 消</Button>
            <Button type="primary" onClick={handleConfirm}>
              提 交
            </Button>
          </div>
        </Dialog>
      );
    };
  },
});
</script>
<style lang="scss" scoped>
.calculator-dialog {
  /deep/.el-dialog {
    width: 715px;
    margin: 0 auto !important;
    top: 50%;
    transform: translateY(-50%);
  }

  /deep/.el-dialog__header {
    padding-bottom: 20px;
    border-bottom: 1px solid #ddd;
  }

  /deep/.el-dialog__body {
    padding: 0 20px;
  }

  /deep/.el-dialog__footer {
    padding-top: 20px;
    text-align: center;
    border-top: 1px solid #ddd;
  }

  .headerCss {
    color: #000000;
    background: rgba(250, 250, 250, 1);
  }

  .export-table {
    height: 60px;

    /deep/.el-table__header-wrapper {
      overflow-y: hidden;
      margin: -10px;
      padding: 10px;
      overflow-x: scroll;
    }

    /deep/ .el-table__header {
      width: auto !important;
      border-collapse: collapse !important;
      th {
        padding: 0;
        max-width: 120px;
        height: 40px;
        border: 1px solid #ebeef5;

        .cell {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 10px;
          white-space: nowrap;
          font-size: 14px;

          .edit-label {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            min-width: 55px;
            width: calc(100% - 22px);
          }

          .edit-table-item-name {
            min-width: 100px;

            .el-input__inner {
              padding-left: 7px;
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

          .el-icon-edit {
            cursor: pointer;
            margin-left: 10px;
            font-size: 16px;
            transition: color 300ms ease-in-out;

            &:hover {
              color: #409eff;
            }
          }
        }
      }
    }
  }

  &__content {
    &.readOnly {
      position: relative;
      &::after {
        content: '';
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 4;
        cursor: not-allowed;
      }
    }

    > section {
      /deep/ .blueTips {
        height: 16px;
      }
      /deep/ .moduleTitle {
        line-height: 16px;
        font-size: 16px;
      }
    }

    &-canvas {
      margin: -10px;
      padding: 10px;
      height: 400px;
      overflow-x: hidden;
      overflow-y: scroll;

      /deep/.el-table {
        font-size: 14px;
      }
    }

    &-title {
      padding: 20px 0;

      /deep/ .moduleTitle {
        display: flex;
        justify-content: space-between;
        width: 100%;

        > span {
          display: block;

          i {
            font-size: 16px;
            color: #ffbf00;
            margin-right: 5px;
          }

          &.set-notice {
            font-size: 14px;
            cursor: pointer;
            color: #8a8a8a;
          }
        }
      }
    }
  }
}
.blueTips {
  width: 3px;
  height: 22px;
  background: rgba(24, 144, 255, 1);
  display: inline-block;
}
.moduleTitle {
  font-size: 20px;
  font-weight: 500;
  color: rgba(51, 51, 51, 1);
  line-height: 20px;
  margin-left: 11px;
  display: inline-flex;
  align-items: center;
}
</style>
