class Options {
    constructor() {
        this.key = "options"
        this.jiraUrl = ""
        this.jiraUsername = ""
        this.jiraToken = ""
        this.calendarTemplates = [] // []Template
        this.favoriteTasks = [] // []Task
        this.reviewDefaultValue = "30m"
        this.reviewDescription = "Code review"
    }

    save() {
        return new Promise(resolve => {
            const obj = {}
            obj[this.key] = this
            chrome.storage.sync.set(obj, () => {
                resolve()
            })
        })
    }

    load() {
        return new Promise(resolve => {
            chrome.storage.sync.get(this.key, (result) => {
                const obj = result[this.key]
                console.log(obj)
                this.jiraUrl = obj?.jiraUrl || ""
                this.jiraUsername = obj?.jiraUsername || ""
                this.jiraToken = obj?.jiraToken || ""
                this.calendarTemplates = obj?.calendarTemplates || []
                this.favoriteTasks = obj?.favoriteTasks || []
                this.reviewDefaultValue = obj?.reviewDefaultValue || "30m"
                resolve(obj)
            })
        })
    }
}

class Template {
    template = ""
    issue = ""

    constructor(template, issue) {
        this.template = template
        this.issue = issue
    }
}

class Task {
    id = ""
    name = ""

    constructor(id, name) {
        this.id = id
        this.name = name
    }
}