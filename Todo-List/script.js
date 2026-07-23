const todoInput = document.getElementById('js-todo-input')
const todos = document.getElementById('js-todos')
const todoForm = document.getElementById('js-todo-form')
const todoOverlay = document.getElementById('js-overlay')
const filterBtn = document.getElementById('js-btn-box')
const allFilterBtn = document.querySelectorAll('.filter-btn')
const clearBtn = document.getElementById('js-clear-btn')
const taskLeft = document.getElementById('js-task-left')

let tasks = []
let currentFilter = "all"

const savedTask = localStorage.getItem("saveTask")

if (savedTask !== null) {
  tasks = JSON.parse(savedTask)
}

const savedFilter = localStorage.getItem("saveFilter")

if(savedFilter !== null) {
  currentFilter = savedFilter
  const currentBtn = document.querySelector(`[data-filter="${currentFilter}"]`)
  allFilterBtn.forEach(oneBtn => oneBtn.classList.remove('active'))
  currentBtn.classList.add('active')
}

renderToPage()

todoForm.addEventListener('submit', function(e) {
   e.preventDefault()
   const todoInputValue = todoInput.value.trim()

   if(!todoInputValue) {
    return
   }

   tasks.push({
    id: Date.now(),
    text: todoInputValue,
    completed: false,
    isEditing: false
   })

   localStorage.setItem("saveTask", JSON.stringify(tasks))
   renderToPage()

   todoInput.value = ''
   todoInput.blur()
} )

function renderToPage() {
  todos.innerHTML = ""

  let filteredTasks 

  if (currentFilter === "all") {
    filteredTasks = tasks
  } else if (currentFilter === "active") {
    filteredTasks = tasks.filter(task => task.completed === false)
  } else if (currentFilter === "completed") {
    filteredTasks = tasks.filter(task => task.completed === true)
  }

  if(filteredTasks.length === 0) {
    let emptyMessage = ''

    if(currentFilter === 'all') {
      emptyMessage = "No tasks here"
    } else if(currentFilter === 'active') {
      emptyMessage = "No active tasks"
    } else if(currentFilter === 'completed') {
      emptyMessage = "No completed tasks"
    }

    todos.innerHTML = `<p class="empty-msg">${emptyMessage}</p>`
  } else {
    for(let task of filteredTasks) {
      const li = `
      <li class="task-list ${task.completed ? 'task-list-completed' : ''} ${task.isEditing ? 'task-editing' : '' }"  data-id="${task.id}">
        <div class="left-li">
         <input id="checkbox-${task.id}" class="todo-checkbox" type="checkbox" ${task.completed ? 'checked' : ''} >

         ${task.isEditing === true? `<input type="text" class="input-text" value="${task.text}" />` : `<label for="checkbox-${task.id}" class="label-text ${task.completed ? 'completed' : ''}">${task.text}</label>`}
        </div>
        <div class="right-li">
          ${task.isEditing === true 
            ? `<button aria-label="save task" class="save-btn">✅</button>` + `<button aria-label="cancel task" class="cancel-btn">❌</button>`
            : task.completed === true 
                ? `<button aria-label="delete task" class="delete-btn">🗑️</button>`
                : `<button aria-label="edit task" class="edit-btn">✏️</button>` + `<button aria-label="delete task" class="delete-btn">🗑️</button>`
          }
        </div>
      </li>
      `
      todos.innerHTML += li
    }
  }
  
  const tasksLeft = tasks.filter(task => task.completed === false).length
  taskLeft.textContent = `${tasksLeft} tasks left`
  
}

function savingTask(taskObj, newText) {
  taskObj.text = newText
  taskObj.isEditing = false

  localStorage.setItem("saveTask", JSON.stringify(tasks))
  renderToPage()
  todoOverlay.style.display = 'none'
}

function cancelingTask(taskObj) {
  taskObj.isEditing = false
  todoOverlay.style.display = 'none'
  renderToPage()
}

todos.addEventListener('click', (e) => {
  if (e.target.classList.contains('delete-btn')) {
    const taskItem = e.target.closest('li')
    const taskID = Number(taskItem.dataset.id)
    tasks = tasks.filter(task => task.id !== taskID)

    localStorage.setItem("saveTask", JSON.stringify(tasks))
    renderToPage()
  }

  if (e.target.classList.contains('edit-btn')) {
    const taskItem = e.target.closest('li')
    const taskID = Number(taskItem.dataset.id)
    const taskToEdit = tasks.find(task => task.id === taskID)
    taskToEdit.isEditing = true
    todoOverlay.style.display = 'block'

    renderToPage()
    const newTaskItem = document.querySelector(`[data-id="${taskID}"]`)
    const editInput = newTaskItem.querySelector('input[type="text"]')
    editInput.focus()
    editInput.setSelectionRange(editInput.value.length, editInput.value.length)
  }

  if(e.target.classList.contains('save-btn')) {
    const taskItem = e.target.closest('li')
    const taskID = Number(taskItem.dataset.id)
    const taskToSave = tasks.find(task => task.id === taskID)

    let newText = taskItem.querySelector('input[type="text"]').value
    

    if(!newText.trim()) {
      newText = taskToSave.text
    }
    savingTask(taskToSave, newText)
  }

  if(e.target.classList.contains('cancel-btn')) {
    const taskItem = e.target.closest('li')
    const taskID = Number(taskItem.dataset.id)
    const taskToCancel = tasks.find(task => task.id === taskID)

    cancelingTask(taskToCancel)
  }

  if(e.target.classList.contains('todo-checkbox')) {
    const taskItem = e.target.closest('li')
    const taskID = Number(taskItem.dataset.id)
    const taskToToggle = tasks.find(task => task.id === taskID)

    taskToToggle.completed = !taskToToggle.completed
    
    localStorage.setItem("saveTask", JSON.stringify(tasks))
    renderToPage()
  }
})

todoOverlay.addEventListener('click', (e) => {
  const taskBeingEdited = tasks.find(task => task.isEditing === true)

  if(!taskBeingEdited) {
    return
  }

  const taskItem = document.querySelector(`[data-id="${taskBeingEdited.id}"]`)
  let newText = taskItem.querySelector('input[type="text"]').value

  if(newText === taskBeingEdited.text) {
    cancelingTask(taskBeingEdited)
  } else {
    savingTask(taskBeingEdited, newText)
  }
})

filterBtn.addEventListener('click', (e) => {
  const btn = e.target.dataset.filter
  currentFilter = btn

  allFilterBtn.forEach((singleBtn) => {
    singleBtn.classList.remove('active')

  })
  e.target.classList.add('active')

  localStorage.setItem("saveFilter", currentFilter)
  renderToPage()
})

clearBtn.addEventListener('click', () => {
  tasks = tasks.filter(task => !task.completed)
  localStorage.setItem("saveTask", JSON.stringify(tasks))
  renderToPage()
})