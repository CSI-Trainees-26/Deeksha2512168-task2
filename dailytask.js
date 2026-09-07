document.addEventListener('DOMContentLoaded', () => {

    const taskInput = document.getElementById('taskInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const pendingList = document.getElementById('pendingList');
    const completedList = document.getElementById('completedList');
    const pendingColumn = document.getElementById('pendingColumn');
    const completedColumn = document.getElementById('completedColumn');

    const STORAGE_KEY = 'dailyTasks';

    let tasks = loadTasks();

    function loadTasks() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    }

    function saveTasks() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    }

    function generateId() {
        return 'task-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    }

    function render() {
        pendingList.innerHTML = '';
        completedList.innerHTML = '';

        const pendingTasks = tasks.filter(t => t.status === 'pending');
        const completedTasks = tasks.filter(t => t.status === 'completed');

        if (pendingTasks.length === 0) {
            pendingList.appendChild(emptyMessage('No pending tasks'));
        } else {
            pendingTasks.forEach(task => pendingList.appendChild(createTaskElement(task)));
        }

        if (completedTasks.length === 0) {
            completedList.appendChild(emptyMessage('No completed tasks yet'));
        } else {
            completedTasks.forEach(task => completedList.appendChild(createTaskElement(task)));
        }
    }

    function emptyMessage(text) {
        const li = document.createElement('li');
        li.className = 'empty-msg';
        li.textContent = text;
        return li;
    }

    function createTaskElement(task) {
        const li = document.createElement('li');
        li.className = 'task-item' + (task.status === 'completed' ? ' completed' : '');
        li.setAttribute('draggable', 'true');
        li.dataset.id = task.id;

        const span = document.createElement('span');
        span.className = 'task-text';
        span.textContent = task.text;

        const actions = document.createElement('div');
        actions.className = 'task-actions';

        const editBtn = document.createElement('button');
        editBtn.className = 'edit-icon-btn';
        editBtn.textContent = 'Edit';
        editBtn.addEventListener('click', () => editTask(task.id));

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-icon-btn';
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', () => deleteTask(task.id));

        actions.appendChild(editBtn);
        actions.appendChild(deleteBtn);

        li.appendChild(span);
        li.appendChild(actions);

        li.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', task.id);
            li.classList.add('dragging');
        });

        li.addEventListener('dragend', () => {
            li.classList.remove('dragging');
        });

        return li;
    }

    function addTask() {
        const text = taskInput.value.trim();
        if (text === '') return;

        tasks.push({
            id: generateId(),
            text: text,
            status: 'pending'
        });

        taskInput.value = '';
        saveTasks();
        render();
    }

    addTaskBtn.addEventListener('click', addTask);

    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    function editTask(id) {
        const task = tasks.find(t => t.id === id);
        if (!task) return;

        const updatedText = prompt('Edit task:', task.text);
        if (updatedText === null) return; // cancelled
        const trimmed = updatedText.trim();
        if (trimmed === '') return;

        task.text = trimmed;
        saveTasks();
        render();
    }

    function deleteTask(id) {
        tasks = tasks.filter(t => t.id !== id);
        saveTasks();
        render();
    }

    [pendingColumn, completedColumn].forEach(column => {
        column.addEventListener('dragover', (e) => {
            e.preventDefault(); // allow drop
            column.classList.add('drag-over');
        });

        column.addEventListener('dragleave', () => {
            column.classList.remove('drag-over');
        });

        column.addEventListener('drop', (e) => {
            e.preventDefault();
            column.classList.remove('drag-over');

            const taskId = e.dataTransfer.getData('text/plain');
            const task = tasks.find(t => t.id === taskId);
            if (!task) return;

            const newStatus = column.dataset.status; 

            task.status = newStatus;
            saveTasks();
            render();
        });
    });

    render();
});