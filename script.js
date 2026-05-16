const STORAGE_KEY = "codex.todo.tasks";

const form = document.querySelector("#task-form");
const input = document.querySelector("#task-input");
const list = document.querySelector("#task-list");
const template = document.querySelector("#task-template");
const filters = document.querySelectorAll(".filter");
const count = document.querySelector("#task-count");
const summary = document.querySelector("#task-summary");
const clearCompleted = document.querySelector("#clear-completed");

let tasks = loadTasks();
let activeFilter = "all";

render();

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const title = input.value.trim();
  if (!title) return;

  tasks.unshift({
    id: crypto.randomUUID(),
    title,
    completed: false,
  });

  input.value = "";
  saveAndRender();
});

filters.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    filters.forEach((filter) => filter.classList.toggle("is-active", filter === button));
    render();
  });
});

clearCompleted.addEventListener("click", () => {
  tasks = tasks.filter((task) => !task.completed);
  saveAndRender();
});

function render() {
  list.innerHTML = "";

  getVisibleTasks().forEach((task) => {
    const item = template.content.firstElementChild.cloneNode(true);
    const checkbox = item.querySelector(".task-check");
    const title = item.querySelector(".task-title");
    const deleteButton = item.querySelector(".delete-button");

    item.classList.toggle("is-completed", task.completed);
    checkbox.checked = task.completed;
    title.value = task.title;
    title.setAttribute("aria-label", `Edit task: ${task.title}`);

    checkbox.addEventListener("change", () => {
      task.completed = checkbox.checked;
      saveAndRender();
    });

    title.addEventListener("change", () => {
      const nextTitle = title.value.trim();
      if (!nextTitle) {
        tasks = tasks.filter((candidate) => candidate.id !== task.id);
      } else {
        task.title = nextTitle;
      }

      saveAndRender();
    });

    title.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        title.blur();
      }
    });

    deleteButton.addEventListener("click", () => {
      tasks = tasks.filter((candidate) => candidate.id !== task.id);
      saveAndRender();
    });

    list.append(item);
  });

  updateMeta();
}

function getVisibleTasks() {
  if (activeFilter === "active") {
    return tasks.filter((task) => !task.completed);
  }

  if (activeFilter === "completed") {
    return tasks.filter((task) => task.completed);
  }

  return tasks;
}

function updateMeta() {
  const openTasks = tasks.filter((task) => !task.completed).length;
  const completedTasks = tasks.length - openTasks;

  count.textContent = `${openTasks} ${openTasks === 1 ? "task" : "tasks"} left`;
  summary.textContent = tasks.length
    ? `${completedTasks} done, ${openTasks} still open`
    : "No tasks yet";
  clearCompleted.disabled = completedTasks === 0;
}

function saveAndRender() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  render();
}

function loadTasks() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? [];
  } catch {
    return [];
  }
}