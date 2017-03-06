/**
 *  Break text up with a separate messages pausing before each one
 *  ```xml
 *  <pause wait=2000 />
 *  ```
 *  evaluated in series
 *  after evaluating all text / xml before removed
 *  controller sends text before and then waits before allowing rest of text/xml to be evaluated
 *  if the bot implements typing a typing status is sent between pauses.
 *  @param wait {String} how long to wait in ms between each defaults to 1000
 *  @module pause
 */

const R = require('ramda');

const DEFAULT_WAIT = 1000;
const lensImplementsTyping = R.lensPath(['implements', 'typing']);
const lensId = R.lensPath(['sender', 'id']);

const spec = {
    series: true,
    evaluate: 'step',
    replace: 'before',
    controller: ({before, bot, attributes, update}, cb) => {
        const wait = R.isNil(attributes.wait) ? DEFAULT_WAIT : Number(attributes.wait);
        const sendNext = () => {
            if (R.view(lensImplementsTyping, bot) && R.view(lensId, update)) {
                bot.sendIsTypingMessageTo(R.view(lensId, update), {ignoreMiddleware: true});
            }
            setTimeout(() => cb(null, ''), wait);
        };
        if (before === '') {
            sendNext();
        } else {
            bot.reply(update, before, {__update: update}).then( () => {
                sendNext();
            }).catch(() => {
                sendNext();
            });
        }
    }
};

module.exports = spec;
