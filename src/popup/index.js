import {
  stopWatchesPlay,
  getTimes,
  stopWatchesCreate,
  stopWatchesPause,
  stopWatchesGet,
  stopWatchesDelete,
  addTimeRecord,
  changeStopwatch
} from "./api"
import {timeFormat} from "../helpers/formats"
import _ from "underscore"

document.addEventListener("DOMContentLoaded", function () {
  if (localStorage["body"]) {
    document.body.innerHTML = localStorage["body"];
  }
}, false);

function parseTimes(times) {
  let monthTime = 0;
  let dayTime = 0;
  let sumByTasks = {};

  times.map((item) => {
    monthTime += item.value

    const date = new Date(item.record_date * 1000);
    const now = new Date();
    if (date.getDate() === now.getDate()) {
      dayTime += item.value;
    }

    if (sumByTasks[item.parent_id])
      sumByTasks[item.parent_id] += item.value;
    else
      sumByTasks[item.parent_id] = item.value;
  });

  const monthEl = document.getElementById("monthTime");
  monthEl.innerHTML = timeFormat(monthTime);

  const dayEl = document.getElementById("dayTime");
  dayEl.innerHTML = timeFormat(dayTime);

  return sumByTasks;
}

function parseTasks(related, times) {
  const projects = related.Project;
  const tasks = related.Task;
  let tableHtml = "";

  for (const task of Object.values(tasks)) {
    tableHtml += `
        <tr data-task="${task.id}">
            <td><button type="button" class="btn rounded-circle btn-sm btn-success" data-type="start" data-id="${task.id}">▶️</button></td>
            <td><a href="https://collab.nimax.ru${task.url_path}" target="_blank">#${task.task_number}</a></td>
            <td>${projects[task.project_id].name}</td>
            <td><b>${timeFormat(times[task.id])}</b></td>
            <td>${task.name}</td>
        </tr>
        <tr>
            <td colspan="5">
                <div class="row">
                    <div class="col">
                      <div class="btn-toolbar" role="toolbar">
                        <div class="btn-group btn-group-sm me-2" role="group">
                          <button
                              data-timerbtn="true" 
                              type="button"
                              class="btn btn-outline-primary"
                              data-taskid="${task.id}"
                              data-project="${task.project_id}"
                              data-time="0.17"
                              data-user="${task.assignee_id}"
                          >+10 м</button>
                          <button
                              data-timerbtn="true" 
                              type="button"
                              class="btn btn-outline-primary"
                              data-taskid="${task.id}"
                              data-project="${task.project_id}"
                              data-time="0.5"
                              data-user="${task.assignee_id}"
                          >+30 м</button>
                          <button
                              data-timerbtn="true" 
                              type="button"
                              class="btn btn-outline-primary"
                              data-taskid="${task.id}"
                              data-project="${task.project_id}"
                              data-time="1"
                              data-user="${task.assignee_id}"
                          >+1 ч</button>
                          <button
                              data-timerbtn="true"
                              type="button"
                              class="btn btn-outline-primary"
                              data-taskid="${task.id}"
                              data-project="${task.project_id}"
                              data-time="8"
                              data-user="${task.assignee_id}"
                          >+8 ч</button>
                        </div>
                        <div class="input-group input-group-sm">                       
                          <input data-input="hours" type="text" class="form-control col-sm-2" placeholder="0" aria-describedby="btnGroupAddon">
                          <div class="input-group-text">:</div>
                          <input data-input="minutes" type="text" class="form-control col-sm-2" placeholder="0" aria-describedby="btnGroupAddon">
                          <button
                              data-time-form="true" 
                              type="button"
                              class="btn btn-outline-primary"
                              data-taskid="${task.id}"
                              data-project="${task.project_id}"
                              data-user="${task.assignee_id}"
                          >+</button>
                        </div>
                      </div>
                    </div>
                </div>
            </td>
        </tr>
    `;
  }

  document.getElementById("myTasks").firstElementChild.innerHTML = tableHtml;
}

function parseStopWatches(related) {
  stopWatchesGet().then((data) => {
    const watches = data.data.stopwatches;

    let tasks = {};
    let tableHtml = "";

    data.data.tasks.map((item) => {
      tasks[item.id] = item;
    });

    if (watches) {
      for (const watch of watches) {
        if (document.querySelectorAll(`[data-task='${watch.parent_id}']`).length > 0) {
          document.querySelectorAll(`[data-task='${watch.parent_id}']`)[0].firstElementChild.firstElementChild.remove();
        }

        let time = watch.elapsed;
        const seconds = new Date().getTime() / 1000;
        time += watch.started_on ? seconds - watch.started_on : 0;
        time = time / 60 / 60;
        const task = tasks[watch.parent_id];

        const button = !watch.started_on ?
          `<button type="button" data-type="play" class="btn rounded-circle btn-sm btn-success" data-id="${watch.id}">▶️</button>`
          :
          `<button type="button" data-type="pause" class="btn rounded-circle btn-sm btn-danger" data-id="${watch.id}">⏸</button>`
        ;

        tableHtml += `
          <tr data-parent="${watch.parent_id}">
              <td>${button}</td>
              <td><a href="https://collab.nimax.ru${task.url_path}" target="_blank">#${task.task_number}</a></td>
              <td><b>${timeFormat(time)}</b></td>
              <td>${task.name}</td>
              <td>
                <div class="btn-group btn-group-sm">
                  <button data-del="${watch.id}" class="btn">x</button>
                  <button
                      data-timerbtn="true"
                      class="btn"
                      data-taskid="${task.id}"
                      data-project="${task.project_id}"
                      data-time="${time}"
                      data-user="${watch.user_id}"
                      data-del-watch="${watch.id}"
                  >+</button>
                </div>
              </td>
          </tr>
          <tr>
            <td colspan="5">
                <div class="row">
                    <div class="col">
                      <div class="btn-toolbar" role="toolbar">
                        <div class="btn-group btn-group-sm me-2" role="group">
                          <button
                              data-elapsed="true" 
                              type="button"
                              class="btn btn-outline-primary"
                              data-watch="${watch.id}"
                              data-time="${watch.elapsed + 300}"
                          >+5 м</button>
                          <button
                              data-elapsed="true" 
                              type="button"
                              class="btn btn-outline-primary"
                              data-watch="${watch.id}"
                              data-time="${watch.elapsed + 600}"
                          >+10 м</button>
                          <button
                              data-elapsed="true" 
                              type="button"
                              class="btn btn-outline-primary"
                              data-watch="${watch.id}"
                              data-time="${watch.elapsed + 1800}"
                          >+30 м</button>
                          <button
                              data-elapsed="true" 
                              type="button"
                              class="btn btn-outline-primary"
                              data-watch="${watch.id}"
                              data-time="${watch.elapsed + 3600}"
                          >+1 ч</button>
                        </div>
                        <div class="input-group input-group-sm">                       
                          <input data-input="hours" type="text" class="form-control col-sm-2" placeholder="0" aria-describedby="btnGroupAddon">
                          <div class="input-group-text">:</div>
                          <input data-input="minutes" type="text" class="form-control col-sm-2" placeholder="0" aria-describedby="btnGroupAddon">
                          <button
                              data-elapsed-form="true" 
                              type="button"
                              class="btn btn-outline-primary"
                              data-watch="${watch.id}"
                              data-time="${watch.elapsed}"
                          >+</button>
                        </div>
                      </div>
                    </div>
                </div>
            </td>
        </tr>
        `;
      }
    }

    document.getElementById("processTasks").firstElementChild.innerHTML = tableHtml;

    localStorage["body"] = document.body.innerHTML;
  });
}

//TODO: сделать функцию без таймаута, для кнопок
const debounceTimeFunc = _.debounce(() => {
  getTimes().then((data) => {
    if (data.data.error) {
      console.error(data.data.error);
      return false;
    }

    const times = data.data.time_records;
    const related = data.data.related;

    parseStopWatches(related);
    const sumByTasks = parseTimes(times);
    parseTasks(related, sumByTasks);

    setTimeout(debounceTimeFunc, 30000);
  });
}, 10, true);

debounceTimeFunc();

document.addEventListener('click', (event) => {
  if (!event.target.matches('button[data-id]')) return;

  const id = event.target.getAttribute('data-id');
  const type = event.target.getAttribute('data-type');

  switch (type) {
    case "start":
      stopWatchesCreate(id).then((data) => {
        event.target.remove();
        debounceTimeFunc();
      });
      break;
    case "pause":
      stopWatchesPause(id).then(() => {
        debounceTimeFunc();
      });
      break;
    case "play":
      stopWatchesPlay(id).then(() => {
        debounceTimeFunc();
      });
      break;
  }
});

document.addEventListener('click', (event) => {
  if (!event.target.matches('button[data-timerbtn]')) return;

  const task = event.target.getAttribute('data-taskid');
  const project = event.target.getAttribute('data-project');
  const time = event.target.getAttribute('data-time');
  const user = event.target.getAttribute('data-user');
  const delWatch = event.target.getAttribute('data-del-watch');

  const to = new Date();
  const toFormat = `${to.getFullYear()}-${to.getMonth() + 1}-${to.getDate()}`;

  addTimeRecord(project, task, user, time, toFormat).then((data) => {
    console.log(data.data);
    if (delWatch) {
      stopWatchesDelete(delWatch).then((data) => {
        console.log(data.data);

        debounceTimeFunc();
      });
    } else {
      debounceTimeFunc();
    }

  });
});

document.addEventListener('click', (event) => {
  if (!event.target.matches('button[data-elapsed]')) return;

  const task = event.target.getAttribute('data-watch');
  const time = event.target.getAttribute('data-time');

  changeStopwatch(task, time).then((data) => {
    console.log(data.data)

    debounceTimeFunc();
  });
});

document.addEventListener('click', (event) => {
  if (!event.target.matches('button[data-del]')) return;

  const id = event.target.getAttribute('data-del');

  stopWatchesDelete(id).then((data) => {
    console.log(data.data)

    debounceTimeFunc();
  });
});

document.addEventListener('click', (event) => {
  if (!event.target.matches('button[data-elapsed-form]')) return;

  const task = event.target.getAttribute('data-watch');
  let time = parseInt(event.target.getAttribute('data-time'));
  const inputs = event.target.parentElement.parentElement.getElementsByTagName("input");

  if (!inputs) {
    return;
  }

  Array.from(inputs).map((element) => {
    if (element.getAttribute('data-input') === 'hours') {
      time += element.value * 60 * 60;
    } else {
      time += element.value * 60;
    }
  });

  changeStopwatch(task, time).then((data) => {
    console.log(data.data)

    debounceTimeFunc();
  });
});

document.addEventListener('click', (event) => {
  if (!event.target.matches('button[data-time-form]')) return;

  const task = event.target.getAttribute('data-taskid');
  const project = event.target.getAttribute('data-project');
  let time = 0;
  const user = event.target.getAttribute('data-user');

  const inputs = event.target.parentElement.parentElement.getElementsByTagName("input");

  if (!inputs) {
    return;
  }

  Array.from(inputs).map((element) => {
    if (element.getAttribute('data-input') === 'hours') {
      time += parseInt(element.value);
    } else {
      time += element.value ? parseInt(element.value) / 60 : 0;
    }
  });



  const to = new Date();
  const toFormat = `${to.getFullYear()}-${to.getMonth() + 1}-${to.getDate()}`;

  addTimeRecord(project, task, user, time, toFormat).then((data) => {
    console.log(data.data)

    debounceTimeFunc();
  });
});
