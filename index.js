const fs = require('fs');

fs.readdirSync(__dirname).forEach(function (file) {
    if (file.endsWith('.js') && file !== 'index.js')
        exports[file.substr(0, file.length - 3)] = require('./' + file);
});
