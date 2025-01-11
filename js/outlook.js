let observerConnected = false
let peek
let options

const dateMapping = {
    "leden": "January",
    "únor": "February",
    "březen": "March",
    "duben": "April",
    "květen": "May",
    "červen": "June",
    "červenec": "July",
    "srpen": "August",
    "září": "September",
    "říjen": "October",
    "listopad": "November",
    "prosinec": "December",
}

const onCalendarIssueInput = () => {
    const calendarDataList = document.getElementById("calendar-jira-tasks")
    const calendarIssueInput = document.getElementById("calendar-issue-number")

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

const displayModal = (eventTitle) => {
    const modal = document.getElementById("modal")
    const closeBtn = modal.querySelector(".close")
    const templateName = modal.querySelector("#event-template")
    const issue = modal.querySelector("#calendar-issue-number")
    const save = modal.querySelector("#add-calendar-template")
    const calendarDataList = document.getElementById("calendar-jira-tasks")

    issue.addEventListener("focus", onCalendarIssueInput)
    issue.addEventListener("input", onCalendarIssueInput)

    templateName.value = `^${eventTitle}$`

    document.querySelector("#modal .modal-content").addEventListener("click", (e) => {
        if (!issue.contains(e.target) && !calendarDataList.contains(e.target)) {
            calendarDataList.style.display = "none"
        }
    })

    closeBtn.addEventListener("click", () => {
        modal.style.display = "none"
    })

    save.addEventListener("click", () => {
        options.calendarTemplates.push(new Template(templateName.value, issue.value))
        options.save().then(() => {
            modal.style.display = "none"
        })
    })

    modal.addEventListener("click", (e) => {
        e.stopImmediatePropagation()
    })

    modal.style.display = "block"
}

const handleEventPeek = () => {
    peek = document.querySelector('[data-app-section="CalendarItemPeek"]')
    if (peek) {
        waitFor('[name="JoinButton"]').then((connectButton) => {
                const title = peek.getElementsByClassName("rHI1u")[0].textContent
                const logButton = document.createElement("button")
                logButton.classList.add("icon-button-small")
                logButton.classList.add("blue-back")

                logButton.textContent = "⏱️"
                connectButton.parentElement.parentElement.appendChild(logButton)

                // Po 06.01.2025 9:00 – 17:00
                const dateString = peek.getElementsByClassName("AhH9N")[0].textContent
                const timeMatch = dateString.match("^.* (..\...\.....) (.*:.*) .* (.*:.*)$")
                const timeStart = timeMatch[2].split(":")
                const timeEnd = timeMatch[3].split(":")
                const minutes = (timeEnd[0] * 60 + parseInt(timeEnd[1])) - (timeStart[0] * 60 + parseInt(timeStart[1]))
                const date = new Date(Date.parse(timeMatch[1]))

                logButton.addEventListener("click", () => {
                    let logged = false
                    for (const i of options.calendarTemplates) {
                        const it = Object.assign({}, i)
                        const regex = new RegExp(it.template)
                        if (regex.test(title)) {
                            logWork(logButton, it.issue, date, minutes, title)
                            logged = true
                            break
                        }
                    }

                    if (!logged) {
                        displayModal(title)
                    }
                })
            }
        )
    }
}

const addTableLogButton = (eventTitle) => {
    const title = eventTitle.innerText.split("\n")[0]
    const logButton = document.createElement("button")
    logButton.classList.add("icon-button-small")
    logButton.classList.add("blue-back")
    logButton.classList.add("absolute")
    logButton.textContent = "⏱️"
    eventTitle.parentElement.appendChild(logButton)

    // Android sedánek Zasedačka Praha - Madrid (2.NP) 10:30 do 11:00
    let timeElement
    if (eventTitle.parentElement.role === "button") {
        timeElement = eventTitle.parentElement
    } else {
        timeElement = eventTitle.parentElement.parentElement
    }

    let dayIndex
    if (eventTitle.parentElement.parentElement.classList.contains("O05RF")) {
        dayIndex = eventTitle.parentElement.parentElement.getAttribute("data-itemindex")
    } else {
        dayIndex = eventTitle.parentElement.parentElement.parentElement.getAttribute("data-itemindex")
    }
    dayIndex = parseInt(dayIndex)

    const timeMatch = timeElement.title.replace(/[\r\n]+/gm, " ").match("^.* (.*:.*) .* (.*:.*)$")
    const timeStart = timeMatch[1].split(":")
    const timeEnd = timeMatch[2].split(":")
    const minutes = (timeEnd[0] * 60 + parseInt(timeEnd[1])) - (timeStart[0] * 60 + parseInt(timeStart[1])) + "m"
    // TODO: move here?

    logButton.addEventListener("click", (e) => {
        e.stopImmediatePropagation()
        let logged = false
        for (const i of options.calendarTemplates) {
            const it = Object.assign({}, i)
            const regex = new RegExp(it.template, "i")
            if (regex.test(title)) {
                // TODO: support month view or fuck it?
                if (window.location.href.endsWith("day")) {
                    // 10. leden 2025
                    const dateString = document.getElementsByClassName("zytMo")[0].innerText.split(" ")
                    var date = new Date(Date.parse(`${dateString[0]} ${dateMapping[dateString[1]]} ${dateString[2]}`))
                } else if (window.location.href.endsWith("week")) {
                    const dateString = document.getElementsByClassName("zytMo")[0].innerText.split(" ")
                    let minDate
                    console.log(dateString)
                    if (dateString.length === 5) {
                        // 06. – 10. leden 2025
//                        const maxDate = new Date(Date.parse(`${dateString[2]} ${dateMapping[dateString[3]]} ${dateString[4]}`))
                        minDate = new Date(Date.parse(`${dateString[0]} ${dateMapping[dateString[3]]} ${dateString[4]}`))
                    } else if (dateString.length === 7) {
                        // 30. prosinec 2024 – 03. leden 2025
//                        const maxDate = new Date(Date.parse(`${dateString[4]} ${dateMapping[dateString[5]]} ${dateString[6]}`))
                        minDate = new Date(Date.parse(`${dateString[0]} ${dateMapping[dateString[1]]} ${dateString[2]}`))
                    } else {
                        // 31. březen – 04. duben 2025
//                        const maxDate = new Date(Date.parse(`${dateString[3]} ${dateMapping[dateString[4]]} ${dateString[5]}`))
                        minDate = new Date(Date.parse(`${dateString[0]} ${dateMapping[dateString[1]]} ${dateString[5]}`))
                    }
                    var date = new Date(minDate)
                    date.setDate(date.getDate() + dayIndex)
                }
                logWork(logButton, it.issue, date, minutes, title)
                logged = true
                break
            }
        }

        if (!logged) {
            displayModal(title)
        }
    })
}

const init = () => {
    options = new Options()
    options.load()
    const modalHtml = `
    <div id="modal" class="modal">
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2>Calendar settings</h2>
            <ul id="calendar-template-list" class="task-list"></ul>
            <div class="mapping-group">
                <div class="form-group">
                    <label for="event-template">Event name template:</label>
                    <input type="text" id="event-template">
                </div>
                <div class="form-group">
                    <label for="calendar-issue-number">Jira task:</label>
                    <input type="text" id="calendar-issue-number" autocomplete="off">
                    <div class="datalist" id="calendar-jira-tasks"></div>
                </div>
            </div>
            <button id="add-calendar-template" class="blue-back">Add template</button><br>
        </div>
    </div>
    `.trim()

    const modalContainer = document.createElement("div")
    modalContainer.innerHTML = modalHtml

    document.getElementsByTagName("body")[0].appendChild(modalContainer)

    waitFor('#MainModule').then((main) => {
        const mainObserver = new MutationObserver(mutations => {
            // TODO: get rid of 0(n^3)
            mutations.forEach((m) => {
                m.addedNodes.forEach((n) => {
                    n.querySelectorAll(".X2DO9").forEach((it) => {
                        addTableLogButton(it)
                    })
                })
            })

            if (peek?.isConnected) {
                return
            } else {
                handleEventPeek()
            }
        })

        mainObserver.observe(main, {childList: true, subtree: true})
    })
}

init()

// TODO: test valid regex syntax before template save
// TODO: add one-time loging