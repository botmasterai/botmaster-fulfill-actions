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
const lensImplementsTyping = R.lensPath(['bot', 'implements', 'typing']);
const lensId = R.lensPath(['update', 'recipient', 'id']);

const spec = {
    series: true,
    evaluate: 'step',
    replace: 'before',
    controller: (params, cb) => {
        const newMessage = R.clone(params.update);
        newMessage.message.text = params.before;
        params.bot.sendMessage(newMessage);
        if (R.view(lensImplementsTyping, params) && R.view(lensId, params)) {
            params.bot.sendIsTypingMessageTo(R.view(lensId, params), {ignoreMiddleware: true});
        }
        const wait = R.isNil(params.attributes.wait) ? DEFAULT_WAIT : Number(params.attributes.wait);
        setTimeout(() => cb(null, ''), wait);
    }
};

module.exports = spec;
