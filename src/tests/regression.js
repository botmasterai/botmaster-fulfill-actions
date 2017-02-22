const R = require('ramda');
const {fulfillOutgoingWare} = require('botmaster-fulfill');
const {
    botmaster,
    telegramMock,
    respond
} = require('botmaster-test');
const standardActions = require('../');

const myActions = {
    hi: {
        controller: () => 'hi there!'
    }
};
const actions = R.merge(standardActions, myActions);


describe('standard actions combined with custom actions', () => {
    let myBotmaster;
    let myTelegramMock;

    beforeEach(() => botmaster().then(botmaster => {
        myTelegramMock = telegramMock(botmaster);
        myBotmaster = botmaster;
    }));

    it('should pass a complex three action test mixing sync and async', function(done) {
        myBotmaster.use('outgoing', fulfillOutgoingWare({actions}));
        this.timeout(2000 * 4);
        respond(myBotmaster)('<hi /><pause />hello<pause />there<pause /><greet tz="Europe/London" />');
        myBotmaster.on('error', (bot, error) => done(new Error(`botmaster error: ${error}`)));
        myTelegramMock
            .expect([
                'hi there!',
                'hello',
                'there',
                'Good morning'
            ], done)
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
