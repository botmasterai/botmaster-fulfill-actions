const Moment = require('moment-timezone');
const R = require('ramda');

const DEFAULT_TIMEZONE ='Europe/London';
const GREETINGS_EN = [
    {start: 4, end: 12, greetings: ['Good morning']},
    {start: 12, end: 17, greetings: ['Good afternoon']},
    {start: 17, end: 4, greetings: ['Good evening']}
];

const getHour = timezone => new Moment().tz(timezone).hour();

const getHourFromUserInfo = R.compose(
    getHour,
    R.defaultTo(DEFAULT_TIMEZONE),
    R.view(R.lensProp('timezone')),
    R.defaultTo({})
);

const gteStart = hour => greeting => greeting.start >= hour;
const ltEnd = hour => greeting => greeting.end < hour;
const findGreetings = greetings => hour => R.find(R.passAll(gteStart(hour), ltEnd(hour)), greetings);
const getUserId = R.view(R.lensPath(['update', 'recipient', 'id']));
const randomGreeting = greetings => greetings[Math.floor(Math.random() * greetings.length)];
const getGreetingFromHour = R.compose(
    randomGreeting,
    findGreetings(GREETINGS_EN)
);

const controller = params => {
    const userId = getUserId(params);
    if (userId)
        return params.bot.getUserInfo(userId).then(getHourFromUserInfo).then(getGreetingFromHour);
    else
        return R.compose(
            getGreetingFromHour,
            getHour,
            R.defaultTo(DEFAULT_TIMEZONE)
        )(params.attributes.tz);
};

module.exports = { controller };
