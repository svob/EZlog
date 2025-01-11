function waitFor(selector) {
    return new Promise(resolve => {
        if (document.querySelector(selector)) {
            resolve(document.querySelector(selector))
        }

        const observer = new MutationObserver(mutations => {
            if (document.querySelector(selector)) {
                observer.disconnect()
                observerConnected = false
                resolve(document.querySelector(selector))
            }
        })

        if (!observerConnected) {
            observer.observe(document.body, {
                childList: true,
                subtree: true
            })
            observerConnected = true
        }
    })
}

function setOk(button) {
    button.innerText = "✅"
}

function setNok(button) {
    button.innerText = "❌"
}