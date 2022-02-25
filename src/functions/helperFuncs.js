const fetch = require('node-fetch');

exports.sendPushNotifications = (messages) => {
    /* Sends push notifications */
    fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(messages)

    });
}