const MockDate = require('mockdate');
const MockTimezone = require('timezone-mock');

const {fulfillOutgoingWare} = require('botmaster-fulfill');
const {
    botmaster,
    telegramMock,
    respond
} = require('botmaster-test');
const actions = require('../');

const GMT_4PM = 1480608000000;
const GMT_9PM = 1480626000000;
const GMT_8AM = 1480579200000;

describe('greet', () => {
    let myBotmaster;
    let myTelegramMock;

    beforeEach(() => botmaster().then(botmaster => {
        myTelegramMock = telegramMock(botmaster);
        myBotmaster = botmaster;
    }));

    describe('System time US/Pacific', () => {
        before(() => {
            MockTimezone.register('US/Pacific');
            MockDate.set(0);
        });

        describe('8 AM UTC', () => {

            before( () => {
                MockDate.set(GMT_8AM);
            });


            it('should greet when tz is passed', function(done) {
                myBotmaster.use('outgoing', fulfillOutgoingWare({actions}));
                respond(myBotmaster)('<greet tz="Europe/London" />');
                myBotmaster.on('error', (bot, error) => done(new Error(`botmaster error: ${error}`)));
                myTelegramMock
                    .expect(['Good morning'], err  => {
                        done(err);
                    })
                    .sendUpdate('hi bob', err => {
                        if (err) done(new Error('supertest error: ' + err));
                    });
            });

            after(() => {
                MockDate.reset();
            });

        });

        after( () => {
            MockTimezone.unregister();
            MockDate.reset();
        });
    });

    describe('System time UTC', () => {
        before( () => {
            MockTimezone.register('UTC');
            MockDate.set(0);
        });

        describe('4 PM UTC', () => {

            before( () => {
                MockDate.set(GMT_4PM);
            });


            it('should greet when no params are passed', function(done) {
                myBotmaster.use('outgoing', fulfillOutgoingWare({actions}));
                respond(myBotmaster)('<greet />');
                myBotmaster.on('error', (bot, error) => done(new Error(`botmaster error: ${error}`)));
                myTelegramMock
                .expect(['Good afternoon'], err  => {
                    done(err);
                })
                .sendUpdate('hi bob', err => {
                    if (err) done(new Error('supertest error: ' + err));
                });
            });

            it('should greet when lang is passed', function(done) {
                myBotmaster.use('outgoing', fulfillOutgoingWare({actions}));
                respond(myBotmaster)('<greet lang="es" />');
                myBotmaster.on('error', (bot, error) => done(new Error(`botmaster error: ${error}`)));
                myTelegramMock
                .expect(['Buenas tardes'], err  => {
                    done(err);
                })
                .sendUpdate('hi bob', err => {
                    if (err) done(new Error('supertest error: ' + err));
                });
            });

            after(() => {
                MockDate.reset();
            });
        });

        after( () => {
            MockTimezone.unregister();
            MockDate.reset();
        });
    });


    afterEach(function(done) {
        this.retries(4);
        process.nextTick(() => {
            myTelegramMock.cleanAll();
            myBotmaster.server.close(done);
        });
    });

});
