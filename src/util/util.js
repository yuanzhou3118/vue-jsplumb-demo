import { fetchGetTableFieldListNoPage } from '../request/index';
export function getElementRelList(lineList) {
  const result = [];
  lineList.forEach((item) => {
    result.push({
      sourceEle: parseInt(item.from),
      targetEle: parseInt(item.to),
    });
  });
  return result;
}

export function getDaCoRelColRelationList(sourceMap) {
  const result = [];
  sourceMap.forEach((item) => {
    result.push({
      sourceId: item.sourceColId,
      targetId: item.targetColId,
    });
  });
  return result;
}

export function getRightOrLeftTable(relList, elementList, id) {
  let field = [];
  let rightOrLeft = null;
  // 输出字段
  const exportNode = elementList.find((item) => item.type == 1);
  let relation = null;
  if (exportNode) {
    relation = relList.find(
      (item) => item.sourceEle == id && item.targetEle !== exportNode.id,
    );
  } else {
    relation = relList.find((item) => item.sourceEle == id);
  }
  if (relation) {
    const targetNode = elementList.find(
      (item) => item.id == relation.targetEle,
    );
    const { daCoRelColContentList } = targetNode;
    if (daCoRelColContentList) {
      const elementContent = daCoRelColContentList.find(
        (item) => item.fromEleId == id,
      );
      if (elementContent) {
        //type: 0左表 1右表
        if (elementContent.type == 0) {
          rightOrLeft = 'left';
          const elementList = daCoRelColContentList.filter(
            (item) => item.type == 0,
          );
          elementList.forEach((item) => {
            field.push({
              ...item,
              rename: item.rename || item.name,
            });
          });
        }
        if (elementContent.type == 1) {
          rightOrLeft = 'right';
          const elementList = daCoRelColContentList.filter(
            (item) => item.type == 1,
          );
          elementList.forEach((item) => {
            field.push({
              ...item,
              rename: item.rename || item.name,
            });
          });
        }
      }
    }
  }

  return { field, rightOrLeft };
}

export function getSourceMapByEcho(list) {
  const result = [];
  list.forEach((item) => {
    result.push({
      sourceColId: `${item.sourceId}`,
      targetColId: `${item.targetId}`,
    });
  });
  return result;
}

export function handleEchoJobData({ elementList, elementRelList }) {
  const result = { nodeList: [], lineList: [] };
  const { nodeList, lineList } = result;
  elementList.forEach((element) => {
    switch (element.type) {
      case 0: //表
        nodeList.push({
          type: 'table',
          name: element.dbTableName,
          tableId: element.metaTableId,
          id: element.id,
          top: `${element.y}px`,
          left: `${element.x}px`,
          ico: '',
          ...getRightOrLeftTable(elementRelList, elementList, element.id),
          sourceMap: null,
          condition: element.tableConditionList,
        });
        break;
      case 1: //export
        nodeList.push({
          type: 'export',
          name: '输出',
          tableId: element.metaTableId,
          id: `${element.id}`,
          top: `${element.y}px`,
          left: `${element.x}px`,
          field: [],
          ico: '',
          rightOrLeft: null,
          sourceMap: null,
          condition: element.tableConditionList,
        });
        break;
      case 2: //并集
        nodeList.push({
          type: 'calculators',
          name: '并集',
          tableId: element.metaTableId,
          id: `${element.id}`,
          ico: '',
          top: `${element.y}px`,
          left: `${element.x}px`,
          ...getRightOrLeftTable(elementRelList, elementList, element.id),
          sourceMap: getSourceMapByEcho(element.daCoRelColRelationList),
          condition: element.tableConditionList,
        });
        break;
      case 3: //交集
        nodeList.push({
          type: 'calculators',
          name: '交集',
          ico: '',
          tableId: element.metaTableId,
          id: `${element.id}`,
          top: `${element.y}px`,
          left: `${element.x}px`,
          ...getRightOrLeftTable(elementRelList, elementList, element.id),
          sourceMap: getSourceMapByEcho(element.daCoRelColRelationList),
          condition: element.tableConditionList,
        });
        break;
    }
  });

  elementRelList.forEach((elementRel) => {
    lineList.push({
      from: `${elementRel.sourceEle}`,
      to: `${elementRel.targetEle}`,
    });
  });

  return result;
}

export function changeNodePosition({ width, height }, data, level, preWidth) {
  const defaultTableWidth = 350;
  const defaultOtherWidth = 65;
  const defaultHeight = 70;
  const paddingTop = 20;
  const paddingLeft = 40;
  const defaultAllHeight = defaultHeight + paddingTop * 2;
  const defaultAllTableWidth = defaultTableWidth + paddingLeft * 2;
  const defaultAllOtherWidth = defaultOtherWidth + paddingLeft * 2;
  const sameLevelNodeList = data.nodeList.filter(
    (nodeItem) => nodeItem.level == level,
  );
  const levelCount = sameLevelNodeList.length;
  if (levelCount == 0) {
    return;
  }

  let currentWidth = defaultAllOtherWidth + preWidth;
  const isHaveTable = sameLevelNodeList.find((node) => node.type == 'table');
  if (isHaveTable) {
    currentWidth = defaultAllTableWidth + preWidth;
  }

  sameLevelNodeList.forEach(async (node) => {
    let calTop = 0;
    if (levelCount % 2) {
      const middleSort = parseInt(levelCount / 2) + 1;
      //奇数
      calTop =
        height / 2 -
        defaultAllHeight / 2 -
        (middleSort - node.sort) * defaultAllHeight +
        paddingTop;
    } else {
      const middleSort = parseInt(levelCount / 2);
      //偶数
      calTop =
        height / 2 -
        (middleSort - node.sort + 1) * defaultAllHeight +
        paddingTop;
    }
    const calLeft = width - currentWidth + paddingLeft;
    node.top = `${calTop}px`;
    node.left = `${calLeft}px`;
  });

  changeNodePosition({ width, height }, data, level + 1, currentWidth);
}

export async function getTreeConstruction(data) {
  return new Promise(async (resolve, reject) => {
    const endPoints = new Set();
    data.lineList.forEach((line) => {
      endPoints.add(line.to);
    });

    for (let item of endPoints.values()) {
      const isChild = data.lineList.find((line) => line.from == item);
      if (isChild) {
        endPoints.delete(item);
      }
    }
    const endPoint = [...endPoints][0];
    const endingNode = data.nodeList.find(
      (nodeItem) => nodeItem.id == endPoint,
    );
    endingNode.level = 1;
    endingNode.sort = 1;
    const treeList = {
      id: endPoint,
      children: [],
      levelCount: 1,
      level: 1,
    };
    //找到终结点，开始递归children
    treeList.children = getChildrenById(endPoint, data, 1, 1);
    resolve({ data });
  });
}

export function getChildrenById(parentId, data, level, sort) {
  const childrenList = [];
  const childRelation = data.lineList.filter((line) => line.to == parentId);
  if (childRelation) {
    level = level + 1;
    childRelation.forEach((child, index) => {
      const node = data.nodeList.find((nodeItem) => nodeItem.id == child.from);
      const childSort = index + 1 + (sort - 1) * 2;
      let childrenChildList = getChildrenById(
        child.from,
        data,
        level,
        childSort,
      );
      node.level = level;
      node.sort = childSort;
      childrenList.push({
        id: child.from,
        level,
        children: childrenChildList,
        levelCount: 0,
      });
    });
  }

  return childrenList;
}

export function getDaCoRelColContentList(calculatorId, lineList, nodeList) {
  const result = [];
  const line = lineList.filter((item) => item.to == calculatorId);
  if (!line) return result;
  line.forEach((item) => {
    const node = nodeList.find((v) => v.id == item.from);
    if (node) {
      node.field.forEach((val) => {
        let type = 0;
        if (node.rightOrLeft == 'right') {
          type = 1;
        }
        if (node.rightOrLeft == 'left') {
          type = 0;
        }
        result.push({
          ...val,
          tempId: parseInt(val.id),
          fromEleId: parseInt(val.fromEleId),
          type,
        });
      });
    }
  });
  return result;
}

export function getElementList(data) {
  const { nodeList, lineList } = data;
  const result = [];
  nodeList.forEach((item) => {
    let type = 0;
    let tableConditionList = item.condition;
    let daCoRelColContentList = null;
    let daCoRelColRelationList = null;
    switch (item.type) {
      case 'table':
        type = 0;
        break;
      case 'calculators':
        if (item.name == '并集') {
          type = 2;
        }
        if (item.name == '交集') {
          type = 3;
        }
        daCoRelColContentList = getDaCoRelColContentList(
          item.id,
          lineList,
          nodeList,
        );
        daCoRelColRelationList = item.sourceMap
          ? getDaCoRelColRelationList(item.sourceMap)
          : [];
        break;
      case 'export':
        type = 1;
        break;
    }
    result.push({
      tempId: parseInt(item.id),
      type,
      metaTableId: parseInt(item.tableId),
      x: parseFloat(item.left),
      y: parseFloat(item.top),
      daCoRelColContentList,
      daCoRelColRelationList,
      tableConditionList,
    });
  });
  return result;
}

/**
 * 此方法只能检测一般的对象对比
 *
 * 1.如果该属性值之一本身就是一个对象吗？
 * 2.如果属性值中的一个是NaN（在JavaScript中，是不是等于自己唯一的价值？）
 * 3.如果一个属性的值为undefined，而另一个对象没有这个属性（因而计算结果为不确定？）
 *
 * @param {*} x
 * @param {*} y
 */
export function deepEqual(x, y) {
  // 指向同一内存时
  if (x === y) {
    return true;
  } else if (
    typeof x === 'object' &&
    x != null &&
    typeof y === 'object' &&
    y != null
  ) {
    if (Object.keys(x).length != Object.keys(y).length) return false;

    for (var prop in x) {
      if (y.hasOwnProperty(prop)) {
        if (!deepEqual(x[prop], y[prop])) {
          console.log(prop);
          return false;
        }
      } else {
        console.log(prop);
        return false;
      }
    }

    return true;
  } else {
    console.log(prop);
    return false;
  }
}

export function getUUID() {
  var data = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  var nums = '';
  for (var i = 0; i < 9; i++) {
    var r = parseInt(Math.random() * 9 + 1);
    nums += data[r];
  }
  return nums;
}

export async function handleTableElementContent(tableId, tableUUId) {
  return new Promise(async (resolve, reject) => {
    const result = [];
    try {
      const { data } = await fetchGetTableFieldListNoPage({
        tableId,
      });
      const { list } = data;
      list.forEach((val) => {
        result.push({
          id: getUUID(),
          name: val.name,
          tableId: val.tableId,
          rename: val.name,
          typeValue: val.typeValue,
          isExportItem: false,
          isOutputCol: false,
          tableUUId,
          colLength: val.colLength,
          decimalLength: val.decimalLength,
          fromEleId: tableUUId,
        });
      });
      resolve(result);
    } catch (err) {
      reject(err);
    }
  });
}
