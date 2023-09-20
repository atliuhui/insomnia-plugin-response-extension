// For help writing plugins, visit the documentation to get started:
//   https://docs.insomnia.rest/insomnia/introduction-to-plugins

const insomnia_plugin_response = require('insomnia-plugin-response').templateTags[0];
const _ = require('lodash');
const moment = require('moment');

module.exports.templateTags = [{
    name: 'responseExt',
    displayName: 'Response Extension',
    description: insomnia_plugin_response.description,
    args: insomnia_plugin_response.args.concat([
        {
            displayName: 'Expression',
            type: 'string',
            description: 'standard for expressions "{func}:arg1,arg2..." => "func(input,arg1,arg2...)"'
        }
    ]),
    async run(context, field, id, filter, resendBehavior, maxAgeSeconds, expression) {
        let input = await insomnia_plugin_response.run(context, field, id, filter, resendBehavior, maxAgeSeconds);
        console.debug(input, expression);

        if (!expression) {
            return input;
        }

        let index = expression.indexOf(':');
        let func = expression.substring(0, index);
        let args = _.map(expression.substring(index + 1, expression.length).split(','), (item) => _.trim(item));
        console.debug(func, args);

        switch (func.toLowerCase()) {
            case "moment":
                return moment(input).format(_.first(args));
            default:
                return _.trim(input);
        }
    }
}];
