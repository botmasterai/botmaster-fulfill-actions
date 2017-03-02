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
        bot.reply(update, before, {__update: update}).then( () => {
            if (R.view(lensImplementsTyping, update) && R.view(lensId, bot)) {
                bot.sendIsTypingMessageTo(R.view(lensId, update), {ignoreMiddleware: true});
            }
            const wait = R.isNil(attributes.wait) ? DEFAULT_WAIT : Number(attributes.wait);
            setTimeout(() => cb(null, ''), wait);
        });
    }
};

module.exports = spec;
