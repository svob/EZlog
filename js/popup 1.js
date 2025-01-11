document.addEventListener('DOMContentLoaded', function() {
    // Collapsible sections
    const collapsibles = document.getElementsByClassName("collapsible");
    for (let i = 0; i < collapsibles.length; i++) {
        collapsibles[i].addEventListener("click", function() {
            this.classList.toggle("active");
            const content = this.nextElementSibling;
            if (content.style.maxHeight) {
                content.style.maxHeight = null;
            } else {
                content.style.maxHeight = content.scrollHeight + "px";
            }
        });
    }

    // Weekly log navigation
    let currentWeek = 1;
    const weekDisplay = document.getElementById('current-week');
    document.getElementById('prev-week').addEventListener('click', () => {
        currentWeek--;
        weekDisplay.textContent = `Týden ${currentWeek}`;
        loadWeeklyTasks(currentWeek);
    });
    document.getElementById('next-week').addEventListener('click', () => {
        currentWeek++;
        weekDisplay.textContent = `Týden ${currentWeek}`;
        loadWeeklyTasks(currentWeek);
    });

    // Load weekly tasks
    function loadWeeklyTasks(week) {
        // This would typically involve an API call to Jira
        // For demonstration, we'll use mock data
        const mockTasks = [
            { name: "Task 1", hours: 5 },
            { name: "Task 2", hours: 3 },
            { name: "Task 3", hours: 2 },
        ];

        const tbody = document.querySelector('#weekly-tasks tbody');
        tbody.innerHTML = '';
        let totalHours = 0;

        mockTasks.forEach(task => {
            const row = tbody.insertRow();
            row.insertCell(0).textContent = task.name;
            row.insertCell(1).textContent = task.hours;
            totalHours += task.hours;
        });

        document.getElementById('total-hours').textContent = totalHours;
    }

    // Initial load of weekly tasks
    loadWeeklyTasks(currentWeek);

    // Load favorite tasks
    function loadFavoriteTasks() {
        // This would typically involve loading from storage or an API
        // For demonstration, we'll use mock data
        const mockFavorites = ["Favorite Task 1", "Favorite Task 2", "Favorite Task 3"];
        const favoritesList = document.getElementById('favorite-tasks-list');
        const taskSelect = document.getElementById('task-select');

        favoritesList.innerHTML = '';
        mockFavorites.forEach(task => {
            const li = document.createElement('li');
            li.textContent = task;
            favoritesList.appendChild(li);

            const option = document.createElement('option');
            option.value = task;
            option.textContent = task;
            taskSelect.appendChild(option);
        });
    }

    // Load favorite tasks
    loadFavoriteTasks();

    // Log work form submission
    document.getElementById('log-work-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const task = document.getElementById('task-select').value;
        const time = document.getElementById('time-spent').value;
        const description = document.getElementById('work-description').value;

        // This would typically involve an API call to log the work
        console.log(`Logging work: ${time} hours on ${task} - ${description}`);
        alert('Práce zalogována!');
        this.reset();
    });

    // Load Toggl tasks
    function loadTogglTasks() {
        // This would typically involve an API call to Toggl
        // For demonstration, we'll use mock data
        const mockTogglTasks = [
            { name: "Toggl Task 1", duration: "2h 30m" },
            { name: "Toggl Task 2", duration: "1h 45m" },
            { name: "Toggl Task 3", duration: "3h 15m" },
        ];

        const togglList = document.getElementById('toggl-tasks-list');
        togglList.innerHTML = '';

        mockTogglTasks.forEach(task => {
            const li = document.createElement('li');
            li.textContent = `${task.name} (${task.duration})`;
            const logButton = document.createElement('button');
            logButton.textContent = 'Log to Jira';
            logButton.className = 'log-to-jira';
            logButton.addEventListener('click', () => logToJira(task));
            li.appendChild(logButton);
            togglList.appendChild(li);
        });
    }

    // Load Toggl tasks
    loadTogglTasks();

    // Function to log Toggl task to Jira
    function logToJira(task) {
        // This would typically involve an API call to log the work in Jira
        console.log(`Logging Toggl task to Jira: ${task.name} (${task.duration})`);
        alert(`Task "${task.name}" logged to Jira!`);
    }
});

