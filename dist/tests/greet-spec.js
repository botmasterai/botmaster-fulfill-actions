'use strict';

var MockDate = require('mockdate');
var MockTimezone = require('timezone-mock');

var _require = require('botmaster-fulfill'),
    fulfillOutgoingWare = _require.fulfillOutgoingWare;

var _require2 = require('botmaster-test'),
    botmaster = _require2.botmaster,
    telegramMock = _require2.telegramMock,
    respond = _require2.respond;

var actions = require('../');

var GMT_4PM = 1480608000000;
var GMT_9PM = 1480626000000;
var GMT_8AM = 1480579200000;

describe('greet', function () {
    var myBotmaster = void 0;
    var myTelegramMock = void 0;

    beforeEach(function () {
        return botmaster().then(function (botmaster) {
            myTelegramMock = telegramMock(botmaster);
            myBotmaster = botmaster;
        });
    });

    describe('System time US/Pacific', function () {
        before(function () {
            MockTimezone.register('US/Pacific');
            MockDate.set(0);
        });

        describe('8 AM UTC', function () {

            before(function () {
                MockDate.set(GMT_8AM);
            });

            it('should greet when tz is passed', function (done) {
                myBotmaster.use('outgoing', fulfillOutgoingWare({ actions: actions }));
                respond(myBotmaster)('<greet tz="Europe/London" />');
                myBotmaster.on('error', function (bot, error) {
                    return done(new Error('botmaster error: ' + error));
                });
                myTelegramMock.expect(['Good morning'], function (err) {
                    done(err);
                }).sendUpdate('hi bob', function (err) {
                    if (err) done(new Error('supertest error: ' + err));
                });
            });

            after(function () {
                MockDate.reset();
            });
        });

        after(function () {
            MockTimezone.unregister();
            MockDate.reset();
        });
    });

    describe('System time UTC', function () {
        before(function () {
            MockTimezone.register('UTC');
            MockDate.set(0);
        });

        describe('4 PM UTC', function () {

            before(function () {
                MockDate.set(GMT_4PM);
            });

            it('should greet when no params are passed', function (done) {
                myBotmaster.use('outgoing', fulfillOutgoingWare({ actions: actions }));
                respond(myBotmaster)('<greet />');
                myBotmaster.on('error', function (bot, error) {
                    return done(new Error('botmaster error: ' + error));
                });
                myTelegramMock.expect(['Good afternoon'], function (err) {
                    done(err);
                }).sendUpdate('hi bob', function (err) {
                    if (err) done(new Error('supertest error: ' + err));
                });
            });

            it('should greet when lang is passed', function (done) {
                myBotmaster.use('outgoing', fulfillOutgoingWare({ actions: actions }));
                respond(myBotmaster)('<greet lang="es" />');
                myBotmaster.on('error', function (bot, error) {
                    return done(new Error('botmaster error: ' + error));
                });
                myTelegramMock.expect(['Buenas tardes'], function (err) {
                    done(err);
                }).sendUpdate('hi bob', function (err) {
                    if (err) done(new Error('supertest error: ' + err));
                });
            });

            after(function () {
                MockDate.reset();
            });
        });

        after(function () {
            MockTimezone.unregister();
            MockDate.reset();
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