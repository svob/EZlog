let lang
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

const onOneTimeCalendarIssueInput = () => {
    const calendarDataList = document.getElementById("oneTime-jira-tasks")
    const calendarIssueInput = document.getElementById("oneTime-issue-number")

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

const displayModal = (eventTitle, duration, date) => {
    const modal = document.getElementById("modal")
    const closeBtn = modal.querySelector(".close")

    const templateTabBtn = modal.querySelector(".tab-link[data-tab='template']");
    const oneTimeTabBtn = modal.querySelector(".tab-link[data-tab='oneTime']");
    const templateTabContent = modal.querySelector("#template");
    const oneTimeTabContent = modal.querySelector("#oneTime");

    const setActiveTab = (tab) => {
        if (tab === 'template') {
          templateTabContent.style.display = "block";
          oneTimeTabContent.style.display = "none";
          templateTabBtn.classList.add("active");
          oneTimeTabBtn.classList.remove("active");
        } else if (tab === 'oneTime') {
          templateTabContent.style.display = "none";
          oneTimeTabContent.style.display = "block";
          templateTabBtn.classList.remove("active");
          oneTimeTabBtn.classList.add("active");
        }
      };

    templateTabBtn.addEventListener("click", () => setActiveTab('template'));
    oneTimeTabBtn.addEventListener("click", () => setActiveTab('oneTime'));
    setActiveTab('template');

    // Template tab
    const templateName = modal.querySelector("#event-template")
    const issue = modal.querySelector("#calendar-issue-number")
    const save = modal.querySelector("#add-calendar-template")
    const calendarDataList = modal.querySelector("#calendar-jira-tasks")

    issue.addEventListener("focus", onCalendarIssueInput)
    issue.addEventListener("input", onCalendarIssueInput)

    templateName.value = `^${eventTitle}$`

    document.querySelector("#modal .modal-content").addEventListener("click", (e) => {
        if (!issue.contains(e.target) && !calendarDataList.contains(e.target)) {
            calendarDataList.style.display = "none"
        }
    })

    save.addEventListener("click", () => {
        options.calendarTemplates.push(new Template(templateName.value, issue.value))
        options.save().then(() => {
            modal.style.display = "none"
        })
    })

    // One-time tab
    const oneTimeIssue = modal.querySelector("#oneTime-issue-number")
    const oneTimeDataList = modal.querySelector("#oneTime-jira-tasks")
    const oneTimeDuration = modal.querySelector("#oneTime-duration")
    const oneTimeLogBtn = modal.querySelector("#oneTime-logBtn")
    const oneTimeDesc = modal.querySelector("#oneTime-desc")

    oneTimeDuration.value = duration
    oneTimeDesc.value = eventTitle
    oneTimeIssue.addEventListener("focus", onOneTimeCalendarIssueInput)
    oneTimeIssue.addEventListener("input", onOneTimeCalendarIssueInput)

    document.querySelector("#modal .modal-content").addEventListener("click", (e) => {
        if (!issue.contains(e.target) && !oneTimeDataList.contains(e.target)) {
            oneTimeDataList.style.display = "none"
        }
    })

    oneTimeLogBtn.addEventListener("click", () => {
        logWork(oneTimeLogBtn, oneTimeIssue.value, date, oneTimeDuration.value, oneTimeDesc.value)
        modal.style.display = "none"
    })

    closeBtn.addEventListener("click", () => {
        modal.style.display = "none"
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
                        displayModal(title, minutes, date)
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

    const getEventDate = () => {
        // TODO: support month view or fuck it?
        let date
        if (window.location.href.endsWith("day")) {
            // 10. leden 2025
            // January 10, 2025
            const dateString = document.getElementsByClassName("zytMo")[0].innerText.split(" ")
            const month = dateMapping[dateString[1]] || dateString[1] // for cz or english lang
            date = new Date(Date.parse(`${dateString[0]} ${month} ${dateString[2]}`))
        } else if (window.location.href.endsWith("week")) {
            let minDate
            if (lang === "cs") {
                const dateString = document.getElementsByClassName("zytMo")[0].innerText.split(" ")
                if (dateString.length === 5) {
                    // 06. – 10. leden 2025
                    minDate = new Date(Date.parse(`${dateString[0]} ${dateMapping[dateString[3]]} ${dateString[4]}`))
                } else if (dateString.length === 7) {
                    // 30. prosinec 2024 – 03. leden 2025
                    minDate = new Date(Date.parse(`${dateString[0]} ${dateMapping[dateString[1]]} ${dateString[2]}`))
                } else {
                    // 31. březen – 04. duben 2025
                    minDate = new Date(Date.parse(`${dateString[0]} ${dateMapping[dateString[1]]} ${dateString[5]}`))
                }
            } else {
                // default to en
                const dateString = document.getElementsByClassName("zytMo")[0].innerText.split(" ")
                if (dateString.length === 3) {
                    // 2025, January 19–25
                    minDate = new Date(Date.parse(`${dateString[2].split("–")[0]} ${dateString[1]} ${dateString[0].slice(0, -1)}`))
                } else if (dateString.length === 7) {
                    // 2024, December 29 – 2025, January 04
                    minDate = new Date(Date.parse(`${dateString[2]} ${dateString[1]} ${dateString[0].slice(0, -1)}`))
                } else {
                    // 2025, January 26 – February 01
                    minDate = new Date(Date.parse(`${dateString[2]} ${dateString[1]} ${dateString[0].slice(0, -1)}`))
                }
            }
            date = new Date(minDate)
            date.setDate(date.getDate() + dayIndex)
        }
        return date
    }

    logButton.addEventListener("click", (e) => {
        e.stopImmediatePropagation()
        let logged = false
        for (const i of options.calendarTemplates) {
            const it = Object.assign({}, i)
            const regex = new RegExp(it.template, "i")
            if (regex.test(title)) {
                const date = getEventDate()
                logWork(logButton, it.issue, date, minutes, title)
                logged = true
                break
            }
        }

        if (!logged) {
            displayModal(title, minutes, getEventDate())
        }
    })
}

const init = () => {
    options = new Options()
    options.load()
    lang = document.getElementsByTagName("html")[0].getAttribute("lang")
    const modalHtml = `
    <div id="modal" class="modal">
        <div class="modal-content">
          <span class="close">&times;</span>
          <div class="tab-header">
            <button class="tab-link active" data-tab="template">Add Event Template</button>
            <button class="tab-link" data-tab="oneTime">One-Time Log</button>
          </div>
          <div class="tab-content" id="template">
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
          <div class="tab-content" id="oneTime" style="display:none;">
            <h2>One-Time Log</h2>
            <div class="mapping-group">
              <div class="form-group">
                <label for="oneTime-issue-number">Jira task:</label>
                <input type="text" id="oneTime-issue-number" autocomplete="off">
                <div class="datalist" id="oneTime-jira-tasks"></div>
              </div>
              <div class="form-group">
                <label for="oneTime-desc">Log description:</label>
                <input type="text" id="oneTime-desc">
              </div>
              <div class="form-group">
                <label for="oneTime-duration">Duration:</label>
                <input type="text" id="oneTime-duration">
              </div>
            </div>
            <button id="oneTime-logBtn" class="blue-back">Log work</button><br>
          </div>
        </div>
    </div>
`.trim();

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