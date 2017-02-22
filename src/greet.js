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

const Moment = require('moment-timezone');
const R = require('ramda');
const debug = require('debug')('botmaster:actions:greet');

const DEFAULT_TIMEZONE ='Europe/London';

const GREETINGS = {
    en: [
        {start: 4, end: 12, greetings: ['Good morning']},
        {start: 12, end: 17, greetings: ['Good afternoon']},
        {start: 17, end: 4, greetings: ['Good evening']}
    ],
    es: [
        {start: 4, end: 12, greetings: ['Buenos dias']},
        {start: 12, end: 20, greetings: ['Buenas tardes']},
        {start: 20, end: 4, greetings: ['Buenas noches']}
    ]
};


const controller = params => {
    return getTimezone(params).then( timezone => {
        const hour = getHour(timezone);
        const greetings = getGreetings(params);
        const greeting = getGreetingFromHour(greetings, hour);
        debug(`${timezone} - hour ${hour} = ${greeting}`);
        return greeting;
    });
};

const spec = {
    controller
};

const lensImplementsTimezone = R.lensPath(['bot', 'implements', 'userInfo', 'timezone']);

const getTimezone = params => {
    const userId = getUserId(params);
    if (params.attributes.tz)
        return Promise.resolve(params.attributes.tz);
    else if (userId && R.view(lensImplementsTimezone, params))
        return params.bot.getUserInfo(userId)
            .then(R.view(R.lensProp('timezone')))
            .catch( err => {
                debug('Error getting user timezone from bot', err);
                return Promise.resolve(DEFAULT_TIMEZONE);
            });
    else
        return Promise.resolve(DEFAULT_TIMEZONE);
};

const getUserId = R.view(R.lensPath(['update', 'recipient', 'id']));

const getHour = timezone => new Moment().tz(timezone).hour();

const getGreetings = params => {
    const lang = params.attributes.lang ? params.attributes.lang : process.env.LANG.split('_').shift();
    return GREETINGS[lang] || GREETINGS['en'];
};

const getGreetingFromHour = (greetings, hour) => R.compose(
    randomGreeting,
    R.prop('greetings'),
    R.defaultTo({}),
    findGreetings(greetings)
)(hour);

const findGreetings = greetings => hour => R.find(R.allPass([gteStart(hour), ltEnd(hour)]), greetings);
const gteStart = hour => greeting => greeting.start <= hour;
const ltEnd = hour => greeting => {
    if (greeting.end - greeting.start > 0)
        return greeting.end > hour;
    else
        return greeting.end > hour - 24;
};

const randomGreeting = greetings => greetings[Math.floor(Math.random() * greetings.length)];

module.exports = spec;
