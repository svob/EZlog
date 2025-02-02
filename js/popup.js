let options

document.addEventListener("DOMContentLoaded", () => {
    options = new Options()
    options.load().then(() => {
        const weekDisplay = document.getElementById("week-display")
        let currentWeekStart = new Date()
        currentWeekStart.setDate(currentWeekStart.getDate() - (currentWeekStart.getDay() - 1))
        currentWeekStart.setHours(0, 0, 0, 0)

        const updateWeekDisplay = () => {
            const start = new Date(currentWeekStart)
            const end = new Date(currentWeekStart)
            end.setDate(end.getDate() + 6)

            const formatDate = date => `${date.toLocaleDateString()}` // TODO: full date
            weekDisplay.textContent = `${formatDate(start)} - ${formatDate(end)}`
            updateCalendarDates(start)
        }

        const updateCalendarDates = (start) => {
            const headers = document.querySelectorAll("#weekly-calendar th")
            for (let i = 0; i <= 6; i++) {
                const day = new Date(start)
                day.setDate(day.getDate() + i)
                headers[i + 1].textContent = `${headers[i + 1].textContent.split("\n")[0]}\n(${day.getDate()})`
            }
        }

        document.getElementById("prev-week").addEventListener("click", () => {
            currentWeekStart.setDate(currentWeekStart.getDate() - 7)
            updateWeekDisplay()
            setupCalendar(currentWeekStart)
        })

        document.getElementById("next-week").addEventListener("click", () => {
            currentWeekStart.setDate(currentWeekStart.getDate() + 7)
            updateWeekDisplay()
            setupCalendar(currentWeekStart)
        })

        setupCalendar(currentWeekStart)
        updateWeekDisplay()
        setupFavoriteTasks()

        document.querySelectorAll(".collapsible-header").forEach(button => {
            button.addEventListener("click", () => {
                if (button.id === "recent-tasks-header") {
                    setupRecentTasks()
                }
                const content = button.nextElementSibling
                content.style.display = content.style.display === "block" ? "none" : "block"
            })
        })
    })
})

function setupFavoriteTasks() {
    const favoriteTasks = document.getElementById("favorite-tasks")

    const formatDate = (it) => {
        let year = new Intl.DateTimeFormat('en', {year: 'numeric'}).format(it)
        let month = new Intl.DateTimeFormat('en', {month: '2-digit'}).format(it)
        let day = new Intl.DateTimeFormat('en', {day: '2-digit'}).format(it)
        return `${year}-${month}-${day}`
    }

    options.favoriteTasks.forEach(task => {
        const li = document.createElement("li")
        const header = document.createElement("button")
        header.classList.add("collapsible-header")
        header.innerText = `${task.id} - ${task.name}`
        const div = document.createElement("div")
        div.classList.add("collapsible-content")
        const durationInput = document.createElement("input")
        durationInput.type = "text"
        durationInput.classList.add("log-value-input")
        durationInput.placeholder = "Duration"
        const descriptionInput = document.createElement("input")
        descriptionInput.type = "text"
        descriptionInput.classList.add("log-description-input")
        descriptionInput.placeholder = "Description"
        const date = document.createElement("input")
        const now = new Date()
        date.setAttribute("type", "date")
        date.value = formatDate(now)
        const logBtn = document.createElement("button")
        logBtn.classList.add("log-task-btn")
        logBtn.innerText = "Log Work"
        logBtn.addEventListener("click", () => {
            logWork(logBtn, task.id, new Date(date.value), durationInput.value, descriptionInput.value)
        })

        div.appendChild(durationInput)
        div.appendChild(descriptionInput)
        div.appendChild(date)
        div.appendChild(logBtn)
        li.appendChild(header)
        li.appendChild(div)
        favoriteTasks.appendChild(li)
    })
}

function setupRecentTasks() {
    const recentTasks = document.getElementById("recent-tasks")
    const loader = recentTasks.parentElement.querySelector(".loader")
    loader.classList.remove("hidden")

    const formatDate = (it) => {
        let year = new Intl.DateTimeFormat('en', {year: 'numeric'}).format(it)
        let month = new Intl.DateTimeFormat('en', {month: '2-digit'}).format(it)
        let day = new Intl.DateTimeFormat('en', {day: '2-digit'}).format(it)
        return `${year}-${month}-${day}`
    }

    getRecentTasks().then(it => {
        console.log(it)
        console.log(it["total"])
        it.issues.forEach(task => {
            const li = document.createElement("li")
            const header = document.createElement("button")
            header.classList.add("collapsible-header")
            header.innerText = `${task.key} - ${task.fields.summary}`
            const div = document.createElement("div")
            div.classList.add("collapsible-content")
            const durationInput = document.createElement("input")
            durationInput.type = "text"
            durationInput.classList.add("log-value-input")
            durationInput.placeholder = "Duration"
            const descriptionInput = document.createElement("input")
            descriptionInput.type = "text"
            descriptionInput.classList.add("log-description-input")
            descriptionInput.placeholder = "Description"
            const date = document.createElement("input")
            const now = new Date()
            date.setAttribute("type", "date")
            date.value = formatDate(now)
            const logBtn = document.createElement("button")
            logBtn.classList.add("log-task-btn")
            logBtn.innerText = "LogWork"
            logBtn.addEventListener("click", () => {
                logWork(logBtn, task.key, new Date(date.value), durationInput.value, descriptionInput.value)
            })

            div.appendChild(durationInput)
            div.appendChild(descriptionInput)
            div.appendChild(date)
            div.appendChild(logBtn)
            li.appendChild(header)
            li.appendChild(div)
            recentTasks.appendChild(li)

            header.addEventListener("click", () => {
                div.style.display = div.style.display === "block" ? "none" : "block"
            })

            loader.classList.add("hidden")
        })
    })
        .catch(error => console.error(error))
}

function setupCalendar(startOfWeek) {
    const loader = document.getElementById("weekly-calendar").parentElement.querySelector(".loader")
    loader.classList.remove("hidden")
    const tbody = document.getElementById("calendar-rows")
    const footCells = document.querySelectorAll("#weekly-calendar tfoot td")
    console.log(footCells)
    tbody.innerHTML = ""

    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(endOfWeek.getDate() + 7)
    const formatDate = (it) => {
        let year = new Intl.DateTimeFormat('en', {year: 'numeric'}).format(it)
        let month = new Intl.DateTimeFormat('en', {month: '2-digit'}).format(it)
        let day = new Intl.DateTimeFormat('en', {day: '2-digit'}).format(it)
        return `${year}-${month}-${day}`
    }
    getWorklog(formatDate(startOfWeek), formatDate(endOfWeek)).then(tasks => {
        const totals = Array(7).fill(0)
        const promises = tasks.issues.map(task => {
            const taskDays = Array(7).fill(0)
            return getWorklogForIssue(task.key).then(it => {
                const logs = it.worklogs
                    .filter(it => it.author.emailAddress === options.jiraUsername)
                    .filter(it => {
                        const d = new Date(it.started)
                        return d >= startOfWeek && d <= endOfWeek
                    })

                logs.forEach(it => {
                    const started = new Date(it.started)
                    taskDays[started.getDay() - 1] += it.timeSpentSeconds
                })

                const tr = document.createElement("tr")
                const td = document.createElement("td")
                td.innerText = `${task.key}\n${task.fields.summary}`
                tr.appendChild(td)

                for (let i = 0; i < 7; i++) {
                    const td = document.createElement("td")
                    if (taskDays[i] === 0) {
                        td.innerText = ""
                    } else {
                        td.innerText = `${+(taskDays[i] / 60 / 60).toFixed(2)}h`
                    }
                    tr.appendChild(td)

                    totals[i] += taskDays[i]
                }

                tbody.appendChild(tr)
            })
        })

        Promise.all(promises).then(() => {
            for (let i = 0; i < 7; i++) {
                if (totals[i] === 0) {
                    footCells[i + 1].innerText = ""
                } else {
                    footCells[i + 1].innerText = `${+(totals[i] / 60 / 60).toFixed(2)}h`
                }
            }
            const week = totals.reduce((acc, it) => acc + it)
            footCells[9].innerText = `${+(week / 60 / 60).toFixed(2)}h`
            loader.classList.add("hidden")
        })
    })
}


// init array[7] with zeros
// array[started.day - 1] += ...
// TODO: solve end day, when not logged via extension - time not 0:00