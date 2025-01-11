const favoriteTasksList = document.getElementById('favorite-tasks-list');
const favoriteTaskInput = document.getElementById('favorite-task-input');
const addFavoriteTaskButton = document.getElementById('add-favorite-task');
const calendarIssueInput = document.getElementById("calendar-issue-number")
const calendarEventTemplate = document.getElementById("event-template")
const calendarDataList = document.getElementById("calendar-jira-tasks")
const calendarMappings = document.getElementById("calendar-template-list")
let options

const addTaskToList = (task) => {
    const li = document.createElement("li")
    const span = document.createElement("span")
    let text = task.id
    if (task.name) {
        text = `${text} - ${task.name}`
    }
    span.textContent = text

    const sync = document.createElement("i")
    sync.classList.add("fas")
    sync.classList.add("fa-sync")
    sync.classList.add("loading")

    const removeBtn = document.createElement("button")
    removeBtn.textContent = "Odstranit"
    removeBtn.addEventListener("click", () => {
        li.remove()
        options.favoriteTasks = options.favoriteTasks.filter(it => it !== task)
    })

    li.appendChild(span)
    li.appendChild(removeBtn)
    favoriteTasksList.appendChild(li)

    if (!task.name) {
        span.appendChild(sync)
        chrome.runtime.sendMessage(
            {
                type: 'getTaskDetail',
                issue: task.id,
            },
            (response) => {
                if (response.error) {
                    console.error(response.error);
                } else {
                    sync.classList.add("hidden")
                    try {
                        text = text = `${task.id} - ${response.data.fields.summary}`
                        span.textContent = text
                        options.favoriteTasks.push(new Task(task.id, response.data.fields.summary))
                    } catch (e) {
                        const err = document.createElement("span")
                        err.classList.add("error")
                        err.textContent = "Failed to get a task info"
                        span.appendChild(err)
                    }
                }
            }
        )
    }
}

const addFavoriteTask = () => {
    const task = favoriteTaskInput.value.trim()
    if (task) {
        addTaskToList(new Task(task))
        favoriteTaskInput.value = ""
    }
}

const prepareCalendarDatalist = () => {
    calendarDataList.innerHTML = ""
    options.favoriteTasks.forEach(task => {
        const option = document.createElement("div")
        option.textContent = `${task.id} - ${task.name}`
        option.addEventListener("click", () => {
            calendarIssueInput.value = task.id
            calendarDataList.style.display = "none"
        })
        calendarDataList.appendChild(option)
    })
}

const insertCalendarTemplateToList = (template) => {
    const li = document.createElement("li")
    const span = document.createElement("span")
    span.textContent = `${template.template} - ${template.issue}`

    const removeBtn = document.createElement("button")
    removeBtn.textContent = "Odstranit"
    removeBtn.addEventListener("click", () => {
        li.remove()
        options.calendarTemplates = options.calendarTemplates.filter((it) => it !== template)
    })

    li.appendChild(span)
    li.appendChild(removeBtn)
    calendarMappings.appendChild(li)

    calendarEventTemplate.value = ""
    calendarIssueInput.value = ""
}

const addCalendarTemplate = () => {
    const template = new Template(calendarEventTemplate.value, calendarIssueInput.value)
    insertCalendarTemplateToList(template)
    options.calendarTemplates.push(template)
}

const onCalendarIssueInput = () => {
    prepareCalendarDatalist()
    const query = calendarIssueInput.value.toLowerCase()
    calendarDataList.style.display = "block"
    Array.from(calendarDataList.children).forEach(option => {
        if (option.textContent.toLowerCase().includes(query)) {
            option.style.display = "block"
        } else {
            option.style.display = "none"
        }
    })
}


const saveOptions = () => {
    options.jiraUsername = document.getElementById("jira-username").value
    options.jiraUrl = document.getElementById("jira-url").value
    options.jiraToken = document.getElementById("jira-api-token").value
    options.reviewDefaultValue = document.getElementById("bb-review-default").value
    options.reviewDescription = document.getElementById("bb-description-default").value
    options.save().then(() => {
        const status = document.getElementById("status")
        status.classList.remove("transparent")
        setTimeout(() => {
            status.classList.add("transparent")
        }, 750)
    })
}

const restoreOptions = () => {
    options = new Options()
    options.load().then((data) => {
        document.getElementById("jira-username").value = options.jiraUsername
        document.getElementById("jira-url").value = options.jiraUrl
        document.getElementById("jira-api-token").value = options.jiraToken
        options.favoriteTasks.forEach((it) => {
            addTaskToList(it)
        })
        options.calendarTemplates.forEach((it) => {
            insertCalendarTemplateToList(it)
        })
        document.getElementById("bb-review-default").value = options.reviewDefaultValue
        document.getElementById("bb-description-default").value = options.reviewDescription
    })
}

document.addEventListener("DOMContentLoaded", () => {
    restoreOptions() // TODO: await?
    document.getElementById("save").addEventListener("click", () => {
        saveOptions()
    })

    addFavoriteTaskButton.addEventListener("click", addFavoriteTask)
    favoriteTaskInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault()
            addFavoriteTask()
        }
    })

    calendarIssueInput.addEventListener("focus", onCalendarIssueInput)
    calendarIssueInput.addEventListener("input", onCalendarIssueInput)

    document.addEventListener("click", (e) => {
        if (!calendarIssueInput.contains(e.target) && !calendarDataList.contains(e.target)) {
            calendarDataList.style.display = "none"
        }
    })

    document.getElementById("add-calendar-template").addEventListener("click", addCalendarTemplate)
})

// TODO: save immediately after change?
// TODO: add help where to get jira token?