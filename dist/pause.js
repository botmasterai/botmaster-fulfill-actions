'use strict';

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

var R = require('ramda');

var DEFAULT_WAIT = 1000;
var lensImplementsTyping = R.lensPath(['implements', 'typing']);
var lensId = R.lensPath(['sender', 'id']);

var spec = {
    series: true,
    evaluate: 'step',
    replace: 'before',
    controller: function controller(_ref, cb) {
        var before = _ref.before,
            bot = _ref.bot,
            attributes = _ref.attributes,
            update = _ref.update;

        var wait = R.isNil(attributes.wait) ? DEFAULT_WAIT : Number(attributes.wait);
        var sendNext = function sendNext() {
            if (R.view(lensImplementsTyping, bot) && R.view(lensId, update)) {
                bot.sendIsTypingMessageTo(R.view(lensId, update), { ignoreMiddleware: true });
            }
            setTimeout(function () {
                return cb(null, '');
            }, wait);
        };
        if (before === '') {
            sendNext();
        } else {
            bot.reply(update, before, { __update: update }).then(function () {
                sendNext();
            }).catch(function () {
                sendNext();
            });
        }
    }
};

module.exports = spec;