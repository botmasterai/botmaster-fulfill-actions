'use strict';

var _require = require('botmaster-fulfill'),
    fulfillOutgoingWare = _require.fulfillOutgoingWare;

var _require2 = require('botmaster-test'),
    botmaster = _require2.botmaster,
    telegramMock = _require2.telegramMock,
    respond = _require2.respond;

var actions = require('../');

describe('pause', function () {
    var myBotmaster = void 0;
    var myTelegramMock = void 0;

    beforeEach(function () {
        return botmaster().then(function (botmaster) {
            myTelegramMock = telegramMock(botmaster);
            myBotmaster = botmaster;
        });
    });

    it('should have a configurable wait time', function (done) {
        var messages = ['one', 'two'];
        this.timeout(500);
        myBotmaster.use('outgoing', fulfillOutgoingWare({ actions: actions }));
        respond(myBotmaster)(messages.join('<pause wait=100 />'));
        myBotmaster.on('error', function (bot, error) {
            return done(new Error('botmaster error: ' + error));
        });
        myTelegramMock.expect(messages, done).sendUpdate('hi bob', function (err) {
            if (err) done(new Error('supertest error: ' + err));
        });
    });

    it('should have a configurable wait time and forgive those who pass a string', function (done) {
        var messages = ['one', 'two'];
        this.timeout(500);
        myBotmaster.use('outgoing', fulfillOutgoingWare({ actions: actions }));
        respond(myBotmaster)(messages.join('<pause wait="100" />'));
        myBotmaster.on('error', function (bot, error) {
            return done(new Error('botmaster error: ' + error));
        });
        myTelegramMock.expect(messages, done).sendUpdate('hi bob', function (err) {
            if (err) done(new Error('supertest error: ' + err));
        });
    });

    it('should pass a simple 5 message test case', function (done) {
        var messages = ['one', 'two', 'three', 'four', 'five'];
        this.timeout(messages.length * 1000 + 100);
        myBotmaster.use('outgoing', fulfillOutgoingWare({ actions: actions }));
        respond(myBotmaster)(messages.join('<pause />'));
        myBotmaster.on('error', function (bot, error) {
            return done(new Error('botmaster error: ' + error));
        });
        myTelegramMock.expect(messages, done).sendUpdate('hi bob', function (err) {
            if (err) done(new Error('supertest error: ' + err));
        });
    });

    it('should pass a complex 5 message test case', function (done) {
        var messages = ['It will cost £2.55.', 'You can pay (we hope so!) over Wi-Fi.', 'You can use an app (Download it <a href=\"http:www.site.com\">HERE</a>).', 'To find out more click <a href=\"http:www.site.com\">HERE</a>!', 'Till later!'];
        this.timeout(messages.length * 1000 + 100);
        myBotmaster.use('outgoing', fulfillOutgoingWare({ actions: actions }));
        respond(myBotmaster)(messages.join('<pause />'));
        myBotmaster.on('error', function (bot, error) {
            return done(new Error('botmaster error: ' + error));
        });
        myTelegramMock.expect(messages, done).sendUpdate('hi bob', function (err) {
            if (err) done(new Error('supertest error: ' + err));
        });
    });

    it('should pass a complex 9 message test case', function (done) {
        var messages = ['Ok, heres what you should do', '1. Turn it on and off.', '2. Delete stuff', '3. Update your OS', '4. Try stuff', '5. Perform stuff <a href=\"http://site.come/ab\"> HERE</a>.', 'Please ensure you back up your data first', 'and do not forget important stuff <a href=\" http://site.com/a_FA_afc\">HERE</a>.', 'Have I resolved resolved your issues?'];
        this.timeout(messages.length * 1000 + 100);
        myBotmaster.use('outgoing', fulfillOutgoingWare({ actions: actions }));
        respond(myBotmaster)(messages.join('<pause />'));
        myBotmaster.on('error', function (bot, error) {
            return done(new Error('botmaster error: ' + error));
        });
        myTelegramMock.expect(messages, done).sendUpdate('hi bob', function (err) {
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