// rename this file to config.js

const config = {
    secretKey: 'secret-key',
    mongoDbUri: '',//Enter mongo db url here,
    api_key: '',//send grid api key (https://sendgrid.com/),
    from: '',//email address from where the email should be sent(set in send grid),
    recaptcha_secretKey: '',//google recaptcha key(https://www.google.com/recaptcha/about/),
    google_client_id: '',//google oAuth2 client Id(https://console.cloud.google.com/)
}

module.exports = config;