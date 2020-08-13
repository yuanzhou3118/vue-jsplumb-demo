import axios from 'axios';

axios.interceptors.response.use(
  (response) => {
    return Promise.resolve(response);
  },
  (error) => {
    console.log(error);
    return Promise.reject(error);
  },
);
export function post(url, params) {
  return new Promise((resolve, reject) => {
    axios({
      method: 'post',
      url: url,
      data: params || '',
    })
      .then((res) => {
        resolve(res.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

export function deletes(url, params) {
  let param = params;
  if (!params || params === '') {
    param = '';
  }
  return new Promise((resolve, reject) => {
    axios({
      method: 'delete',
      url: url + param,
    })
      .then((res) => {
        resolve(res.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

export function put(url, params) {
  return new Promise((resolve, reject) => {
    axios({
      method: 'put',
      url: url,
      data: params || '',
    })
      .then((res) => {
        resolve(res.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

export function get(url, params) {
  return new Promise((resolve, reject) => {
    axios({
      method: 'get',
      url: url,
      params: params || {},
    })
      .then((res) => {
        resolve(res.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

export const getFolderAll = (params) => get(`/folder/all`, params);
// export const createJob = (params) => post(`/job`, params);
// export const editJob = (params) => put(`/job`, params);
export const getTaskList = (params) => get(`/job/all`, params);
export const deleteJobId = (jobId) => deletes(`/job/${jobId}`);
export const runTaskApi = (params) => post(`/job/run`, params);
export const pauseTask = (jobId) => get(`/job/stop/${jobId}`);
export const getAllContentByJobId = (jobId) => get(`/job/echo/${jobId}`);
export const fetchGetTableFieldListNoPage = (params) =>
  get(`/getTableHeadList`, params);
