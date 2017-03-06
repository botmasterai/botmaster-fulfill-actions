'use strict';

var R = require('ramda');

var _require = require('botmaster-fulfill'),
    fulfillOutgoingWare = _require.fulfillOutgoingWare;

var _require2 = require('botmaster-test'),
    botmaster = _require2.botmaster,
    telegramMock = _require2.telegramMock,
    respond = _require2.respond;

var standardActions = require('../');

var myActions = {
    hi: {
        controller: function controller() {
            return 'hi there!';
        }
    },
    empty: {
        controller: function controller() {
            return '';
        }
    },
    async: {
        controller: function controller(params, next) {
            next(null, '').then(function () {
                params.bot.reply(params.update, 'async message', { ignoreMiddleware: true });
            });
        }
    }
};
var actions = R.merge(standardActions, myActions);

describe('standard actions combined with custom actions', function () {
    var myBotmaster = void 0;
    var myTelegramMock = void 0;

    beforeEach(function () {
        return botmaster().then(function (botmaster) {
            myTelegramMock = telegramMock(botmaster);
            myBotmaster = botmaster;
        });
    });

    it('should pass a complex three action test mixing sync and promise', function (done) {
        myBotmaster.use('outgoing', fulfillOutgoingWare({ actions: actions }));
        this.timeout(2000 * 4);
        respond(myBotmaster)('<hi /><pause />hello<pause />there<pause /><greet tz="Europe/London" />');
        myBotmaster.on('error', function (bot, error) {
            return done(new Error('botmaster error: ' + error));
        });
        myTelegramMock.expect(['hi there!', 'hello', 'there', 'Good morning'], done).sendUpdate('hi bob', function (err) {
            if (err) done(new Error('supertest error: ' + err));
        });
    });

    it('pause tag should work with actions returning empty responses', function (done) {
        myBotmaster.use('outgoing', fulfillOutgoingWare({ actions: actions }));
        this.timeout(2000 * 4);
        respond(myBotmaster)('<empty /><pause />hello<empty />there<pause /><empty />');
        myBotmaster.on('error', function (bot, error) {
            return done(new Error('botmaster error: ' + error));
        });
        myTelegramMock.expect(['hellothere'], done).sendUpdate('hi bob', function (err) {
            if (err) done(new Error('supertest error: ' + err));
        });
    });

    it('should pass a complex three action test mixing pause tag and async with next', function (done) {
        myBotmaster.use('outgoing', fulfillOutgoingWare({ actions: actions }));
        this.timeout(2000 * 4);
        respond(myBotmaster)('<async /><pause />hello<async />there<pause /><async />');
        myBotmaster.on('error', function (bot, error) {
            return done(new Error('botmaster error: ' + error));
        });
        myTelegramMock.expect(['async message', 'hellothere', 'async message'], done).sendUpdate('hi bob', function (err) {
            if (err) done(new Error('supertest error: ' + err));
        });
    });

    afterEach(function (done) {
        this.retries(4);
        process.nextTick(function () {
            myTelegramMock.cleanAll();
            myBotmaster.server.close(done);
        });
    });
});