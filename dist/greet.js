'use strict';

/**
 * Greet users with a greeting that reflects the time of day
 *
 * ```xml
 * <greet />
 * <greet tz='America/New_York' lang='es' />
 * ```
 *
 * Outputs based on the system language, or set attribute, default is english if none of these are found.
 * Timezone is based on the users timezone on bots that implement getUserInfo, the set attribute, default is UTC if noen of these are found.
 *
 * **English (en)**
 * * between 4 am and 12 pm say "Good morning"
 * * between 12 pm and 5pm  say "Good afternoon"
 * * between 5 pm and 4am  say "Good evening"
 *
 * **Spanish (es)**
 * * between 4 am and 12 pm say "Buenos dias"
 * * between 12 pm and 8pm  say "Buenas tardes"
 * * between 8 pm and 4am  say "Buenas noches"
 *
 * @param {String} tz Which timezone to use for the time-based greeting. Defaults to GMT. To see available options see http://momentjs.com/timezone/
 * @param {String} lang Which language to use. Defaults to system locale setting
 * @module greet
 */

var Moment = require('moment-timezone');
var R = require('ramda');
var debug = require('debug')('botmaster:actions:greet');

var DEFAULT_TIMEZONE = 'Europe/London';

var GREETINGS = {
    en: [{ start: 4, end: 12, greetings: ['Good morning'] }, { start: 12, end: 17, greetings: ['Good afternoon'] }, { start: 17, end: 4, greetings: ['Good evening'] }],
    es: [{ start: 4, end: 12, greetings: ['Buenos dias'] }, { start: 12, end: 20, greetings: ['Buenas tardes'] }, { start: 20, end: 4, greetings: ['Buenas noches'] }]
};

var controller = function controller(params) {
    return getTimezone(params).then(function (timezone) {
        var hour = getHour(timezone);
        var greetings = getGreetings(params);
        var greeting = getGreetingFromHour(greetings, hour);
        debug(timezone + ' - hour ' + hour + ' = ' + greeting);
        return greeting;
    });
};

var spec = {
    controller: controller
};

var lensImplementsTimezone = R.lensPath(['bot', 'implements', 'userInfo', 'timezone']);

var getTimezone = function getTimezone(params) {
    var userId = getUserId(params);
    if (params.attributes.tz) return Promise.resolve(params.attributes.tz);else if (userId && R.view(lensImplementsTimezone, params)) return params.bot.getUserInfo(userId).then(function (response) {
        return debug('got userinfo ' + response);
    }).then(R.compose(R.defaultTo(DEFAULT_TIMEZONE), R.view(R.lensProp('timezone')))).catch(function (err) {
        debug('Error getting user timezone from bot', err);
        return Promise.resolve(DEFAULT_TIMEZONE);
    });else return Promise.resolve(DEFAULT_TIMEZONE);
};

var getUserId = R.view(R.lensPath(['update', 'sender', 'id']));

var getHour = function getHour(timezone) {
    return new Moment().tz(timezone).hour();
};

var getGreetings = function getGreetings(params) {
    var lang = params.attributes.lang ? params.attributes.lang : process.env.LANG.split('_').shift();
    return GREETINGS[lang] || GREETINGS['en'];
};

var getGreetingFromHour = function getGreetingFromHour(greetings, hour) {
    return R.compose(randomGreeting, R.prop('greetings'), R.defaultTo({
        greetings: ['Hi', 'Ciao']
    }), findGreetings(greetings))(hour);
};

var findGreetings = function findGreetings(greetings) {
    return function (hour) {
        return R.find(R.allPass([gteStart(hour), ltEnd(hour)]), greetings);
    };
};
var gteStart = function gteStart(hour) {
    return function (greeting) {
        if (greeting.end - greeting.start > 0) return greeting.start <= hour;else return greeting.start - 24 <= hour;
    };
};
var ltEnd = function ltEnd(hour) {
    return function (greeting) {
        if (greeting.end - greeting.start > 0) return greeting.end > hour;else return greeting.end > hour - 24;
    };
};

var randomGreeting = function randomGreeting(greetings) {
    return greetings[Math.floor(Math.random() * greetings.length)];
};

module.exports = spec;