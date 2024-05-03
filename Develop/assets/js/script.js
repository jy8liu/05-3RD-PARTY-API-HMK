// Initialize taskList and nextId if not yet stored in localStorage
let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
let nextId = JSON.parse(localStorage.getItem("nextId")) || 1;

// Generate a unique task id
function generateTaskId() {
    return nextId++; // Post-increment to ensure uniqueness for each ID
}

// Create a task card HTML
function createTaskCard(task) {
    let deadlineColor = '';
    const today = dayjs();
    const deadline = dayjs(task.deadline);
    if (deadline.isBefore(today)) {
        deadlineColor = 'bg-danger text-white'; // Bootstrap classes for red background
    } else if (deadline.subtract(2, 'day').isBefore(today)) {
        deadlineColor = 'bg-warning'; // Bootstrap class for yellow background
    }
    return `
        <div class="task card ${deadlineColor} mb-3" data-id="${task.id}">
            <div class="card-body">
                <h5 class="card-title">${task.title}</h5>
                <p class="card-text">${task.description}</p>
                <p class="card-text"><small>Deadline: ${task.deadline}</small></p>
                <button class="btn btn-sm btn-outline-secondary delete-task">Delete</button>
            </div>
        </div>
    `;
}

// Render the task list and make cards draggable
function renderTaskList() {
    $("#to-do, #in-progress, #done").empty(); // Clear current tasks
    taskList.forEach(task => {
        const cardHtml = createTaskCard(task);
        $(`#${task.state}`).append(cardHtml);
    });
    $(".task").draggable({
        revert: "invalid",
        containment: "document",
        helper: "clone",
        cursor: "move",
    });
}

// Handle adding a new task
function handleAddTask(event) {
    event.preventDefault();
    const title = $("#taskTitle").val();
    const description = $("#taskDescription").val();
    const deadline = dayjs($("#taskDeadline").val()).format("YYYY-MM-DD"); // Ensure correct format

    if (title.trim() !== '' && description.trim() !== '' && deadline) {
        const task = {
            id: generateTaskId(),
            title: title,
            description: description,
            deadline: deadline,
            state: "to-do",
        };
        taskList.push(task);
        saveTasksAndRefresh();
        $("#formModal").modal('hide'); // Hide the modal after saving
    } else {
        alert('All fields are required!');
    }
}

// Handle deleting a task
function handleDeleteTask(event) {
    const taskId = $(event.target).closest('.task').data('id');
    taskList = taskList.filter(task => task.id !== taskId);
    saveTasksAndRefresh();
}

// Handle dropping a task into a new status lane
function handleDrop(taskId, newState) {
  // Find task by id and update its state
  const taskIndex = taskList.findIndex(task => task.id == taskId);
  if (taskIndex > -1) {
      taskList[taskIndex].state = newState;
  }
  saveTasksAndRefresh();
}


// Save tasks and nextId to localStorage and refresh the task list
function saveTasksAndRefresh() {
    localStorage.setItem("tasks", JSON.stringify(taskList));
    localStorage.setItem("nextId", JSON.stringify(nextId));
    renderTaskList();
}

// When the page loads
$(document).ready(function () {
    renderTaskList();
    $("#taskForm").submit(handleAddTask);
    $(document).on('click', '.delete-task', handleDeleteTask);
    $(".swim-lanes .lane").each(function () {
        $(this).droppable({
            accept: ".task",
            drop: function(event, ui) {
                handleDrop(event, $(this));
            },
            hoverClass: "border-success"
        });
    });
    $("#taskDeadline").datepicker({ dateFormat: 'yy-mm-dd' }); // Configure DatePicker format
});

