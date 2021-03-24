import axios from "axios"

//https://app.activecollab.com/226440/api/v1/users/9/tasks

export async function getTasks() {
  let p = new Promise(function(resolve, reject){
    chrome.storage.sync.get(['USER_ID'], function(options){
      resolve(options);
    })
  });

  const configOut = await p;

  return request(`/api/v1/users/${configOut.USER_ID}/tasks`);
}

export async function getTimes() {
  let p = new Promise(function(resolve, reject){
    chrome.storage.sync.get(['USER_ID'], function(options){
      resolve(options);
    })
  });

  const configOut = await p;

  const to = new Date();
  const toFormat = `${to.getFullYear()}-${to.getMonth() + 1}-${to.getDate()}`;
  const from = new Date(to.getFullYear(), to.getMonth(), 1);
  const fromFormat = `${from.getFullYear()}-${from.getMonth() + 1}-${from.getDate()}`;

  return request(`/api/v1/users/${configOut.USER_ID}/time-records/filtered-by-date?from=${fromFormat}&to=${toFormat}`);
}

export function stopWatchesGet() {
  return request('/api/v1/stopwatches', "GET");
}

export function stopWatchesCreate(id) {
  return request('/api/v1/stopwatches', "POST", {}, {elapsed: 0, parent_id: id, parent_type: "Task"})
}

export function stopWatchesPause(id) {
  return request(`/api/v1/stopwatches/${id}/pause`, "PUT")
}

export function changeStopwatch(id, time) {
  return request(`/api/v1/stopwatches/${id}`, "PUT", {}, {elapsed: time})
}

export function stopWatchesPlay(id) {
  return request(`/api/v1/stopwatches/${id}/resume`, "PUT")
}

export function stopWatchesDelete(id) {
  return request(`/api/v1/stopwatches/${id}`, "DELETE")
}

export function addTimeRecord(project, task, user, time, date) {
  console.log(time);
  return request(`/api/v1/projects/${project}/time-records`, "POST", {}, {
    billable_status: 1,
    job_type_id: 8,
    parent_id: task,
    parent_type: "Task",
    record_date: date,
    source: "built_in_timer",
    summary: "",
    task_id: task,
    user_id: user,
    value: time
  })
}

async function request(path, method = "GET", query = {}, body = {}) {
  let p = new Promise(function(resolve, reject){
    chrome.storage.sync.get(['PHP_SESS', 'US_FOR', 'CSRF'], function(options){
      resolve(options);
    })
  });

  const configOut = await p;

  const data = {
    url: `https://collab.nimax.ru${path}`,
    method: method,
    cookie: `PHPSESSID=${configOut.PHP_SESS}; activecollab_us_for_fec7922ce064e7ad0ed34dd21dd8b9f1619655ae=${configOut.US_FOR};`,
    data: JSON.stringify(body),
    csrf: configOut.CSRF
  }

  return axios.request({
    url: 'https://pure-garden-45151.herokuapp.com/request',
    method: "POST",
    data: data
  });
}