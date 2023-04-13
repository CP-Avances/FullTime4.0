"use strict";
const webpush = require('web-push');
webpush.setVapidDetails('mailto:kevincuray41@gmail.com', process.env.PUBLIC_VAPID_KEY, process.env.PRIVATE_VAPID_KEY);
