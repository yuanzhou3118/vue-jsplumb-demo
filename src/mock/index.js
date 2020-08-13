import Mock from 'mockjs';
import {
  job64,
  job63,
  job28,
  taskList,
  craftList,
  nodeList,
  job65,
  job23,
  job11,
} from './task';
import { leftTable, rightTable } from './table';
Mock.mock(/\/folder\/all/, /get|post/i, nodeList);
Mock.mock(/\/job\/all/, 'get', (options) => {
  const taskType = options.url
    .split('?')[1]
    .split('&')[0]
    .split('=')[1];
  if (taskType == 1) {
    return taskList;
  } else {
    return craftList;
  }
});
Mock.mock(RegExp('/job/' + '.*'), 'delete', {
  code: '200',
  message: 'SUCCESS',
  serverTime: '2020-08-13T14:19:00.916',
  data: null,
});
Mock.mock('/job/run', 'post', {});
Mock.mock(RegExp('/job/stop/' + '.*'), 'get', {
  code: '200',
  message: 'SUCCESS',
  serverTime: '2020-08-13T14:19:00.916',
  data: null,
});
Mock.mock(RegExp('/job/echo/' + '.*'), 'get', (options) => {
  const taskId = options.url.split('/').pop();
  let flow = null;
  switch (taskId) {
    case '64':
      flow = job64;
      break;
    case '63':
      flow = job63;
      break;
    case '28':
      flow = job28;
      break;
    case '23':
      flow = job23;
      break;
    case '11':
      flow = job11;
      break;
    case '65':
      flow = job65;
      break;
    default:
      break;
  }
  return {
    data: { flow, id: taskId },
  };
});
Mock.mock(RegExp('/getTableHeadList' + '.*'), 'get', (options) => {
  const tableId = options.split('?')[1].split('=')[1];
  let data = null;
  if (tableId % 2) {
    data = leftTable;
  } else {
    data = rightTable;
  }
  return data;
});
// Random.csentence()
