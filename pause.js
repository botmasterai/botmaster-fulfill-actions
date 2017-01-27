/**
 *  Break action handler
 */

const R = require('ramda');

const DEFAULT_WAIT = 1000;

module.exports = {
    // this action should only be evaluated one at a time
    series: true,
    // use the last output of this action as the value for the remaining text
    replace: 'before',
    controller: function(params, cb) {
        const newMessage = R.clone(params.update);
        newMessage.message.text = params.before;
        params.bot.sendMessage(newMessage);
        setTimeout(() => cb(null, ''), params.attributes.wait || DEFAULT_WAIT);
    }
};
