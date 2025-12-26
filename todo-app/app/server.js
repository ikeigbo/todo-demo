const express = require("express");

const app = express();
app.use(express.json());

let nextId = 1;
const todos = [
  { id: nextId++, text: "Learn Argo CD", done: false },
  { id: nextId++, text: "Deploy to kind", done: false }
];

// Health endpoint (good for probes)
app.get("/healthz", (req, res) => res.status(200).send("ok"));

// List todos
app.get("/api/todos", (req, res) => res.json(todos));

// Create todo
app.post("/api/todos", (req, res) => {
  const text = (req.body?.text || "").trim();
  if (!text) return res.status(400).json({ error: "text is required" });

  const todo = { id: nextId++, text, done: false };
  todos.push(todo);
  res.status(201).json(todo);
});

// Toggle done
app.patch("/api/todos/:id/toggle", (req, res) => {
  const id = Number(req.params.id);
  const todo = todos.find(t => t.id === id);
  if (!todo) return res.status(404).json({ error: "not found" });
  todo.done = !todo.done;
  res.json(todo);
});

// Tiny UI (so you can open in browser)
app.get("/", (req, res) => {
  res.type("html").send(`
<!doctype html>
<html>
<head><meta charset="utf-8"/><title>Todo Demo</title></head>
<body style="font-family: sans-serif; max-width: 720px; margin: 2rem auto;">
  <h1>Todo Demo</h1>
  <form id="f">
    <input id="t" placeholder="New todo..." style="width: 70%; padding: .5rem;" />
    <button style="padding: .5rem 1rem;">Add</button>
  </form>
  <ul id="list"></ul>

<script>
async function refresh() {
  const res = await fetch('/api/todos');
  const todos = await res.json();
  const ul = document.getElementById('list');
  ul.innerHTML = '';
  todos.forEach(td => {
    const li = document.createElement('li');
    li.style.margin = '.5rem 0';
    const btn = document.createElement('button');
    btn.textContent = td.done ? 'Undo' : 'Done';
    btn.onclick = async () => {
      await fetch('/api/todos/' + td.id + '/toggle', { method: 'PATCH' });
      refresh();
    };
    li.textContent = (td.done ? '✅ ' : '⬜ ') + td.text + ' ';
    li.appendChild(btn);
    ul.appendChild(li);
  });
}
document.getElementById('f').onsubmit = async (e) => {
  e.preventDefault();
  const text = document.getElementById('t').value.trim();
  if (!text) return;
  await fetch('/api/todos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });
  document.getElementById('t').value = '';
  refresh();
};
refresh();
</script>
</body>
</html>
  `);
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`todo-demo listening on ${port}`));
