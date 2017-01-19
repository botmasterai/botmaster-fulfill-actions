const {outgoing} = require('botmaster-fulfill');
const {
    botmaster,
    telegramMock,
    respond
} = require('botmaster-test');
const actions = require('../lib');

describe('pause', () => {
    let myBotmaster;
    let myTelegramMock;

    beforeEach(() => botmaster().then(botmaster => {
        myTelegramMock = telegramMock(botmaster);
        myBotmaster = botmaster;
    }));

    it('should pass a simple 5 message test case', function(done) {
        const messages = [
            'one',
            'two',
            'three',
            'four',
            'five'
        ];
        this.timeout(messages.length * 1000 + 100);
        myBotmaster.use('outgoing', outgoing({actions}));
        respond(myBotmaster)(messages.join('<pause />'));
        myBotmaster.on('error', (bot, error) => done(new Error(`botmaster error: ${error}`)));
        myTelegramMock
            .expect(messages, done)
            .sendUpdate('hi bob', err => {
                if (err) done(new Error('supertest error: ' + err));
            });

    });

    it('should pass a complex 5 message test case', function(done) {
        const messages = [
            'It will cost £2.55.',
            'You can pay (we hope so!) over Wi-Fi.',
            'You can use an app (Download it <a href=\"http:www.site.com\">HERE</a>).',
            'To find out more click <a href=\"http:www.site.com\">HERE</a>!',
            'Till later!'
        ];
        this.timeout(messages.length * 1000 + 100);
        myBotmaster.use('outgoing', outgoing({actions}));
        respond(myBotmaster)(messages.join('<pause />'));
        myBotmaster.on('error', (bot, error) => done(new Error(`botmaster error: ${error}`)));
        myTelegramMock
            .expect(messages, done)
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
