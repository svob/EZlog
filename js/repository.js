function logWork(button, issue, date, duration, description) {
    chrome.runtime.sendMessage(
        {
            type: 'logWork',
            issue: issue,
            date: date,
            duration: duration,
            description: description
        },
        (response) => {
            if (response.error) {
                setNok(button)
                console.log(response.error);
            } else {
                setOk(button)
                console.log(response.data);
            }
        }
    )
}

function getRecentTasks() {
    const opts = new Options()
    return opts.load().then(options => {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage(
                {
                    type: "search",
                    jql: `issueKey IN updatedBy("${options.jiraUsername}", "-7d")`
                },
                (response) => {
                    if (response.error) {
                        console.log(response.error)
                        reject(response.error)
                    } else {
                        console.log(response)
                        resolve(response.data)
                    }
                }
            )
        })
    })
}

function getWorklog(startDate, endDate) {
    const opts = new Options()
    return opts.load().then(options => {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage(
                {
                    type: "search",
                    jql: `worklogAuthor = currentUser() AND worklogDate >= ${startDate} AND worklogDate <= ${endDate}`
                },
                (response) => {
                    if (response.error) {
                        console.log(response.error)
                        reject(response.error)
                    } else {
                        console.log(response)
                        resolve(response.data)
                    }
                }
            )
        })
    })
}

function getWorklogForIssue(issue) {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(
            {
                type: 'getWorklog',
                issue: issue,
            },
            (response) => {
                if (response.error) {
                    console.log(response.error);
                    reject(response.error)
                } else {
                    console.log(response.data);
                    resolve(response.data)
                }
            }
        )
    })
}