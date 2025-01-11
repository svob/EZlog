const IS_DEBUG = false

chrome.webNavigation.onHistoryStateUpdated.addListener(details => {
    const parsedUrl = new URL(details.url)
    if (
//        details.url.match("https://.*.atlassian.net/.*") ||
//        details.url.match("https://outlook.office.com/calendar/.*") ||
        details.url.match("https://bitbucket.org/.*/pull-requests/.*")
    ) {
        chrome.tabs.sendMessage(details.tabId, {type: "page-rendered"})
    }
})


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log(message)
    if (message.type === 'logWork') {
        getLocalData().then((items) => {
            const url = items.jiraUrl + "rest/api/3/issue/" + message.issue + "/worklog"
console.log(items)
            const body = {
                comment: {
                    content: [
                        {
                            content: [
                                {
                                    type: "text",
                                    text: message.description
                                }
                            ],
                            type: "paragraph"
                        }
                    ],
                    type: "doc",
                    version: 1
                },
                started: new Date(message.date).toISOString().replace("Z", "+0000"),
                timeSpent: message.duration
            }


            if (!IS_DEBUG) {
                fetch(url, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Basic ${btoa(`${items.jiraUsername}:${items.jiraToken}`)}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(body)
                })
                    .then(response => {
                        console.log(response)
                        if (response.ok) {
                            sendResponse({data: response.json()})
                        } else {
                            sendResponse({error: true})
                        }
                    })
                    .catch(error => sendResponse({error}));
            } else {
                console.log(url)
                console.log(JSON.stringify(body))
            }

        })
        return true;
    } else if (message.type === 'getTaskDetail') {
        getLocalData().then((items) => {
            console.log(items)
            const url = items.jiraUrl + "rest/api/3/issue/" + message.issue

            fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Basic ${btoa(`${items.jiraUsername}:${items.jiraToken}`)}`,
                    'Content-Type': 'application/json'
                }
            })
                .then(response => {
                    console.log(Response)
                    return response.json()
                })
                .then(data => sendResponse({data}))
                .catch(error => sendResponse({error}));

        })
        return true;
    }
});

function getLocalData() {
    return new Promise((resolve) => {
        chrome.storage.sync.get("options", (items) => {
            resolve(items.options)
        })
    })
}