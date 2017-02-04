/**
 *  Break text up with a separate messages pausing before each one
 *  ```xml
 *  <pause wait=2000 />
 *  ```
 *  evaluated in series
 *  after evaluating all text / xml before removed
 *  controller sends text before and then waits before allowing rest of text/xml to be evaluated
 *  @param wait {String} how long to wait in ms between each defaults to 1000
 *  @module pause
 */

const R = require('ramda');

const DEFAULT_WAIT = 1000;

const spec = {
    series: true,
    evaluate: 'step',
    replace: 'before',
    controller: (params, cb) => {
        const newMessage = R.clone(params.update);
        newMessage.message.text = params.before;
        params.bot.sendMessage(newMessage);
        const wait = R.isNil(params.attributes.wait) ? DEFAULT_WAIT : Number(params.attributes.wait);
        setTimeout(() => cb(null, ''), wait);
    }
};

module.exports = spec;
