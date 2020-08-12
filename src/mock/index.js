import Mock from 'mockjs';
Mock.mock('/folder/all', /get|post/i, {
  status: 200,
  message: 'success',
  data: {
    total: 1,
    list: [
      {
        id: '1',
        name: '菜单1',
      },
    ],
  },
});
Mock.mock('/job', 'post', {});
Mock.mock('/job', 'put', {});
Mock.mock('/job/all', 'get', {});
Mock.mock(RegExp('/job/' + '.*'), 'delete', {});
Mock.mock('/job/run', 'post', {});
Mock.mock(RegExp('/job/stop/' + '.*'), 'get', {});
Mock.mock(RegExp('/job/echo/' + '.*'), 'get', {});
Mock.mock('/getTableHeadList', 'get', {});
// Random.csentence()
