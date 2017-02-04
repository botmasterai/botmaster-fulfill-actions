const MockDate = require('mockdate');
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


    it('should greet when no params are passed', function(done) {
        MockDate.set(GMT_4PM);
        myBotmaster.use('outgoing', fulfillOutgoingWare({actions}));
        respond(myBotmaster)('<greet tz="Europe/London" />');
        //respond(myBotmaster)('<greet />');
        myBotmaster.on('error', (bot, error) => done(new Error(`botmaster error: ${error}`)));
        myTelegramMock
            .expect(['Good afternoon'], err  => {
                console.log('hi')
                MockDate.reset();
                done(err);
            })
            .sendUpdate('hi bob', err => {
                if (err) done(new Error('supertest error: ' + err));
            });
    });

    it('should greet when lang is passed', function(done) {
        MockDate.set(GMT_4PM);
        myBotmaster.use('outgoing', fulfillOutgoingWare({actions}));
        respond(myBotmaster)('<greet lang="es" />');
        myBotmaster.on('error', (bot, error) => done(new Error(`botmaster error: ${error}`)));
        myTelegramMock
            .expect(['Buenas tardes'], err  => {
                MockDate.reset();
                done(err);
            })
            .sendUpdate('hi bob', err => {
                if (err) done(new Error('supertest error: ' + err));
            });
    });

    it('should greet when tz is passed', function(done) {
        MockDate.set(GMT_8AM);
        myBotmaster.use('outgoing', fulfillOutgoingWare({actions}));
        respond(myBotmaster)('<greet tz="Europe/London" />');
        myBotmaster.on('error', (bot, error) => done(new Error(`botmaster error: ${error}`)));
        myTelegramMock
            .expect(['Good morning'], err  => {
                done(err);
                MockDate.reset();
            })
            .sendUpdate('hi bob', err => {
                if (err) done(new Error('supertest error: ' + err));
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
