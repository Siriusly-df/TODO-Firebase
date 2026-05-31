const list = document.getElementById('todo-list')
const itemCountSpan = document.getElementById('item-count')
const uncheckedCountSpan = document.getElementById('unchecked-count')

const loadingDiv = document.getElementById('loading');
const errorDiv = document.getElementById('error');

let todos = [];

let loading = false;
let error = null;


function addTodo(todo) {
  return fetch('https://todo-app-9232e-default-rtdb.europe-west1.firebasedatabase.app/todos.json',
    {
      method: 'POST',
      body: JSON.stringify({
        text: todo.text,
        checked: todo.checked
      })
    }
  )
    .then(response => response.json())
    .then(data => data.name);
}

function getTodos() {
  loading = true;
  error = null;

  loadingDiv.style.display = 'block';
  errorDiv.style.display = 'none';

  return fetch('https://todo-app-9232e-default-rtdb.europe-west1.firebasedatabase.app/todos.json')
    .then(response => response.json())
    .then(data => {
      const todos = [];

      for (const id in data) {
        todos.push({
          id,
          text: data[id].text,
          checked: data[id].checked
        });
      }

      return todos;
    })
    .catch(err => {
      error = 'Помилка завантаження даних';
      errorDiv.innerText = error;
      errorDiv.style.display = 'block';
      return [];
    })
    .finally(() => {
      loading = false;
      loadingDiv.style.display = 'none';
    });
}

function newTodo() {
  const text = prompt('Введіть нову справу');

  if (!text) return;

  const todo = {
    text: text,
    checked: false
  };

  addTodo(todo).then(function(id) {
    todo.id = id;

    todos.push(todo);

    render(todos);
    updateCounter();
  });
}

function updateTodoInDB(id, updatedFields) {
  return fetch(`https://todo-app-9232e-default-rtdb.europe-west1.firebasedatabase.app/todos/${id}.json`,
    {
      method: 'PATCH',
      body: JSON.stringify(updatedFields)
    }
  );
}

function renderTodo(todo) {
  return `
    <li class="list-group-item">
      <input 
        type="checkbox" 
        class="form-check-input me-2"
        id="${todo.id}"
        ${todo.checked ? 'checked' : ''}
        onchange="checkTodo('${todo.id}')"
      />

      <label for="${todo.id}">
        <span class="${todo.checked ? 'text-success text-decoration-line-through' : ''}">
          ${todo.text}
        </span>
      </label>

      <button 
        class="btn btn-danger btn-sm float-end"
        onclick="deleteTodo('${todo.id}')"
      >
        delete
      </button>
    </li>
  `
}

function render(todos) {
  if (error) {
    list.innerHTML = '';
    return;
  }

  if (loading) {
    list.innerHTML = '';
    return;
  }

  const todosHTML = todos.map(renderTodo);
  list.innerHTML = todosHTML.join('');
}

function updateCounter() {
  itemCountSpan.innerText = todos.length

  const uncheckedTodos = todos.filter(function(todo) {
    return !todo.checked
  })
  uncheckedCountSpan.innerText = uncheckedTodos.length
}

function deleteTodoFromDB(id) {
  return fetch(`https://todo-app-9232e-default-rtdb.europe-west1.firebasedatabase.app/todos/${id}.json`,
    {
      method: 'DELETE'
    }
  );
}

function deleteTodo(id) {
  deleteTodoFromDB(id).then(() => {
    const index = todos.findIndex(function(todo) {
      return todo.id === id;
    });

    todos.splice(index, 1);

    render(todos);
    updateCounter();
  });
}

function checkTodo(id) {
  const todo = todos.find(function(todo) {
    return todo.id === id;
  });
  todo.checked = !todo.checked;

  updateTodoInDB(id, {
    checked: todo.checked
  });

  render(todos);
  updateCounter();
}

getTodos().then(function(data) {
  todos.length = 0;
  todos.push(...data);

  render(todos);
  updateCounter();
});