function logWork(button, issue, date, duration, description) {
    chrome.runtime.sendMessage(
        {
            type: 'logWork',
            issue: issue,
            date: date,
            duration: duration,
            description : description
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