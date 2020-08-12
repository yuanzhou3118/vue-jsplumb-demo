export const demoData = {
  name: '流程B',
  nodeList: [
    {
      id: 'nodeA',
      name: 'A表',
      type: 'table',
      left: '522px',
      top: '205px',
      state: 'success',
      detail: null,
      field: null,
    },
    {
      id: 'nodeB',
      type: 'table',
      name: 'B表',
      left: '520px',
      top: '343px',
      state: 'error',
      detail: null,
      field: null,
    },
    {
      id: 'nodeC',
      name: '并集结果',
      type: 'table',
      left: '847px',
      top: '274px',
      state: 'warning',
      detail: null,
      field: null,
    },
  ],
  lineList: [
    {
      from: 'nodeA',
      to: 'nodeC',
    },
    {
      from: 'nodeB',
      to: 'nodeC',
    },
  ],
};

export const dataInit = {
  nodeList: [],
  lineList: [],
};

export const timingTypeString = {
  1: '分',
  2: '时',
  3: '天',
  4: '周',
  5: '月',
};

export const intType = [
  'int',
  'decimal',
  'smallint',
  'tinyint',
  'mediumint',
  'integer',
  'bigint',
  'float',
  'double',
];

export const dateAllType = ['date', 'time', 'year', 'datetime', 'timestamp'];

export const draggableOptions = {
  preventOnFilter: false,
  sort: false,
  disabled: false,
  ghostClass: 'tt',
  // 不使用H5原生的配置
  forceFallback: true,
  // 拖拽的时候样式
  // fallbackClass: 'flow-node-draggable'
};

export const calculators = [
  {
    label: '交集',
    name: 'intersection',
    type: 'calculators',
    icon: 'result-component__icon-jiao',
  },
  {
    label: '并集',
    name: 'union',
    type: 'calculators',
    icon: 'result-component__icon-bing',
  },
  {
    label: '输出',
    name: 'export',
    type: 'export',
    icon: 'result-component__icon-export',
  },
];
