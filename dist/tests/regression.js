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

    it('should pass a complex three action test mixing sync and async', function (done) {
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

    afterEach(function (done) {
        this.retries(4);
        process.nextTick(function () {
            myTelegramMock.cleanAll();
            myBotmaster.server.close(done);
        });
    });
});