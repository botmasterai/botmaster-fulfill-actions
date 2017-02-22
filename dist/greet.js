'use strict';var Moment=require('moment-timezone'),R=require('ramda'),debug=require('debug')('botmaster:actions:greet'),DEFAULT_TIMEZONE='Europe/London',GREETINGS={en:[{start:4,end:12,greetings:['Good morning']},{start:12,end:17,greetings:['Good afternoon']},{start:17,end:4,greetings:['Good evening']}],es:[{start:4,end:12,greetings:['Buenos dias']},{start:12,end:20,greetings:['Buenas tardes']},{start:20,end:4,greetings:['Buenas noches']}]},controller=function(a){return getTimezone(a).then(function(b){var c=getHour(b),d=getGreetings(a),e=getGreetingFromHour(d,c);return debug(b+' - hour '+c+' = '+e),e})},spec={controller:controller},lensImplementsTimezone=R.lensPath(['bot','implements','userInfo','timezone']),getTimezone=function(a){var b=getUserId(a);return a.attributes.tz?Promise.resolve(a.attributes.tz):b&&R.view(lensImplementsTimezone,a)?a.bot.getUserInfo(b).then(R.view(R.lensProp('timezone'))).catch(function(c){return debug('Error getting user timezone from bot',c),Promise.resolve(DEFAULT_TIMEZONE)}):Promise.resolve(DEFAULT_TIMEZONE)},getUserId=R.view(R.lensPath(['update','recipient','id'])),getHour=function(a){return new Moment().tz(a).hour()},getGreetings=function(a){var b=a.attributes.lang?a.attributes.lang:process.env.LANG.split('_').shift();return GREETINGS[b]||GREETINGS.en},getGreetingFromHour=function(a,b){return R.compose(randomGreeting,R.prop('greetings'),R.defaultTo({}),findGreetings(a))(b)},findGreetings=function(a){return function(b){return R.find(R.allPass([gteStart(b),ltEnd(b)]),a)}},gteStart=function(a){return function(b){return b.start<=a}},ltEnd=function(a){return function(b){return 0<b.end-b.start?b.end>a:b.end>a-24}},randomGreeting=function(a){return a[Math.floor(Math.random()*a.length)]};module.exports=spec;