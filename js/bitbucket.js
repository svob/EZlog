let observerConnected = false
let options

const init = () => {
    options = new Options()
    options.load()

    // TODO: Try to change this wait for "webRequest.onCompleted" event from background worker.
    // TODO: For this I need to find the right BB request to listen to.
    // TODO: Maybe theres a way to get the JIRA issue prom the req. directly? 🤔
    if (/pull-requests\/.+$/.test(window.location.href)) {
        waitFor('[data-qa="pr-header-actions-drop-down-menu-styles"]').then((menuButton) => {
            const jiraIssue = document.querySelector('a[data-module-key="dvcs-connector-issue-key-linker"]')
            if (jiraIssue == null) return

            if (document.getElementById("logButton")) return

            const logButton = document.createElement("button")
            logButton.classList.add("icon-button-small")
            logButton.classList.add("blue-back")
            logButton.id = "logButton"
            logButton.textContent = "⏱️"

            const logValue = document.createElement("input")
            logValue.setAttribute("type", "text")
            logValue.setAttribute("value", options.reviewDefaultValue)
            logValue.classList.add("log-value-input")

            const description = document.createElement("input")
            description.setAttribute("type", "text")
            description.setAttribute("value", options.reviewDescription)
            description.classList.add("log-description-input")

            logButton.addEventListener("click", () => {
                logWork(logButton, jiraIssue.href.split("/").slice(-1)[0], new Date(), logValue.value, description.value)
            })

            menuButton.parentElement.insertBefore(logValue, menuButton)
            menuButton.parentElement.insertBefore(description, menuButton)
            menuButton.parentElement.insertBefore(logButton, menuButton)
        })
    } else if (/pull-requests\/$/.test(window.location.href)) {
        waitFor("tr.e1qqs37812").then(() => {
            const table = document.querySelector("table.edylmxf0")
            const rows = table.getElementsByTagName("tr")
            const headCells = rows[0].getElementsByTagName("th")
            const clone = headCells[4].cloneNode(true)
            clone.getElementsByTagName("span")[0].textContent = "Worklog"
            headCells[4].after(clone)

            const branchRegex = /(?:.+\/)?(.+-[0-9]+)(?:-|_)?.*/
            for (const it of rows) {
                const branchName = it.querySelector("span.evx2nil0")?.textContent
                const match = branchName?.match(branchRegex)

                if (match?.length === 2) {
                    const taskId = match[1]
                    const logButton = document.createElement("button")
                    logButton.classList.add("icon-button-small")
                    logButton.classList.add("blue-back")
                    logButton.id = "logButton"
                    logButton.textContent = "⏱️"

                    const logValue = document.createElement("input")
                    logValue.setAttribute("type", "text")
                    logValue.setAttribute("value", options.reviewDefaultValue)
                    logValue.classList.add("log-value-input")

                    logButton.addEventListener("click", () => {
                        logWork(logButton, taskId, new Date(), logValue.value, options.reviewDescription)
                    })

                    const cells = it.getElementsByTagName("td")
                    const clone = cells[4].cloneNode(false)
                    const wrapper = document.createElement("div")
                    wrapper.classList.add("css-1l4w6pd")
                    wrapper.classList.add("e1qqs3786")
                    wrapper.appendChild(logButton)
                    clone.appendChild(wrapper)
                    cells[4].after(clone)
                }
            }
        })
    }
}

chrome.runtime.onMessage.addListener((request) => {
    if (request && request.type === "page-rendered") {
        init()
    }
})

init()

// TODO: add possibility to select date?