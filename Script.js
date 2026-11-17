(function () {
  var KEY = "todo-tasks-v1";
  var tasks = [];
  var filter = "all";

  var form = document.getElementById("form");
  var input = document.getElementById("input");
  var list = document.getElementById("list");
  var bar = document.getElementById("bar");
  var summary = document.getElementById("summary");
  var count = document.getElementById("count");
  var clearBtn = document.getElementById("clear");
  var filterBtns = document.querySelectorAll("[data-filter]");

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) tasks = JSON.parse(raw) || [];
    } catch (e) { tasks = []; }
    if (!tasks.length) {
      tasks = [
        { id: 1, text: "Reply to pending emails", done: false },
        { id: 2, text: "Tick this task off", done: true }
      ];
    }
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(tasks)); } catch (e) {}
  }

  function render() {
    list.innerHTML = "";
    var shown = tasks.filter(function (t) {
      return filter === "all" || (filter === "done" ? t.done : !t.done);
    });

    if (!shown.length) {
      var empty = document.createElement("li");
      empty.className = "empty";
      empty.style.cssText = "display:block;border:0;background:none;";
      empty.textContent = tasks.length
        ? "Nothing in this view."
        : "No tasks yet. Add your first one above.";
      list.appendChild(empty);
    }

    shown.forEach(function (t) {
      var li = document.createElement("li");
      li.dataset.id = t.id;
      if (t.done) li.className = "done";

      var cb = document.createElement("input");
      cb.type = "checkbox";
      cb.checked = t.done;
      cb.setAttribute("aria-label", "Mark “" + t.text + "” as completed");
      cb.addEventListener("change", function () { toggle(t.id); });

      var span = document.createElement("span");
      span.textContent = t.text;

      var del = document.createElement("button");
      del.className = "del";
      del.type = "button";
      del.textContent = "Delete";
      del.setAttribute("aria-label", "Delete “" + t.text + "”");
      del.addEventListener("click", function () { remove(t.id, li); });

      li.append(cb, span, del);
      list.appendChild(li);
    });

    var done = tasks.filter(function (t) { return t.done; }).length;
    var left = tasks.length - done;
    bar.style.width = tasks.length ? (done / tasks.length * 100) + "%" : "0";
    summary.textContent = tasks.length
      ? done + " of " + tasks.length + " completed"
      : "Nothing planned yet";
    count.textContent = left + (left === 1 ? " task left" : " tasks left");
    clearBtn.hidden = done === 0;
    save();
  }

  function add(text) {
    tasks.unshift({ id: Date.now(), text: text, done: false });
    render();
  }
  function toggle(id) {
    tasks.forEach(function (t) { if (t.id === id) t.done = !t.done; });
    render();
  }
  function remove(id, li) {
    li.classList.add("leaving");
    setTimeout(function () {
      tasks = tasks.filter(function (t) { return t.id !== id; });
      render();
    }, 160);
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var text = input.value.trim();
    if (!text) { input.focus(); return; }
    add(text);
    input.value = "";
    input.focus();
  });

  filterBtns.forEach(function (b) {
    b.addEventListener("click", function () {
      filter = b.dataset.filter;
      filterBtns.forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
      render();
    });
  });

  clearBtn.addEventListener("click", function () {
    tasks = tasks.filter(function (t) { return !t.done; });
    render();
  });

  load();
  render();
})();
