document.addEventListener('DOMContentLoaded', function () {
    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    function getWeekDates(startDate) {
        const dates = [];
        const start = new Date(startDate);
        start.setDate(start.getDate() - ((start.getDay() + 6) % 7)); // Start on Monday
        for (let i = 0; i < 7; i++) {
            const current = new Date(start);
            current.setDate(start.getDate() + i);
            dates.push(current);
        }
        return dates;
    }

    function formatDate(date) {
        return date.toISOString().split('T')[0]; // YYYY-MM-DD
    }

    function loadWeeklyTasksCalendar(weekStartDate) {
        const weekDates = getWeekDates(weekStartDate);

        const weekRangeElement = document.getElementById('current-week-range');
        weekRangeElement.textContent = `Od ${formatDate(weekDates[0])} do ${formatDate(weekDates[6])}`;

        const thead = document.querySelector('#weekly-tasks-calendar thead tr');
        const tbody = document.querySelector('#weekly-tasks-calendar tbody');
        const tfoot = document.querySelector('#weekly-tasks-calendar tfoot tr');

        // Reset table
        thead.innerHTML = '<th>Úkol</th><th>Celkem za úkol</th>';
        tbody.innerHTML = '';
        tfoot.innerHTML = '<td>Celkem</td><td id="total-hours-tasks">0</td>';

        // Fill header with dates
        weekDates.forEach(date => {
            const th = document.createElement('th');
            th.textContent = `${weekDays[date.getDay() - 1]} (${date.getDate()})`;
            thead.appendChild(th);
        });

        // Mock tasks
        const tasks = [
            { id: 'INS-29466', hours: [2, 3, 4, 0, 5, 6, 4] },
            { id: 'INS-29947', hours: [0.5, 1, 0, 0, 0, 0, 0] },
        ];

        let totalWeekHours = 0;
        tasks.forEach(task => {
            const row = document.createElement('tr');
            const totalTaskHours = task.hours.reduce((sum, h) => sum + h, 0);

            row.innerHTML = `
                <td><a href="https://jira.example.com/browse/${task.id}" target="_blank">${task.id}</a></td>
                <td>${totalTaskHours.toFixed(1)}h</td>
            `;

            task.hours.forEach(hours => {
                const td = document.createElement('td');
                td.textContent = hours ? `${hours}h` : '';
                row.appendChild(td);
                totalWeekHours += hours;
            });

            tbody.appendChild(row);
        });

        // Add totals to footer
        weekDates.forEach((_, i) => {
            const totalDayHours = tasks.reduce((sum, task) => sum + task.hours[i], 0);
            const td = document.createElement('td');
            td.textContent = totalDayHours ? `${totalDayHours.toFixed(1)}h` : '';
            tfoot.appendChild(td);
        });

        document.getElementById('total-hours-tasks').textContent = `${totalWeekHours.toFixed(1)}h`;
    }

    let currentWeekDate = new Date();
    loadWeeklyTasksCalendar(currentWeekDate);

    document.getElementById('prev-week').addEventListener('click', () => {
        currentWeekDate.setDate(currentWeekDate.getDate() - 7);
        loadWeeklyTasksCalendar(currentWeekDate);
    });

    document.getElementById('next-week').addEventListener('click', () => {
        currentWeekDate.setDate(currentWeekDate.getDate() + 7);
        loadWeeklyTasksCalendar(currentWeekDate);
    });

    function loadTogglTasks() {
        const mockTogglTasks = [
            { name: "Toggl Task 1", duration: "2h", date: "2023-01-01" },
            { name: "Toggl Task 2", duration: "3h", date: "2023-01-02" },
        ];

        const togglList = document.getElementById('toggl-tasks-list');
        togglList.innerHTML = '';

        mockTogglTasks.forEach(task => {
            const li = document.createElement('li');
            li.innerHTML = `
                ${task.date} - ${task.name} (${task.duration})
                <button class="log-to-jira">Log to Jira</button>
            `;

            const logButton = li.querySelector('.log-to-jira');
            logButton.addEventListener('click', () => {
                console.log(`Logging ${task.name} to Jira`);
                alert(`${task.name} logged to Jira!`);
            });

            togglList.appendChild(li);
        });
    }

    loadTogglTasks();
});