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
            description: 'standard for expressions "func:arg1,arg2..." => "func(input,arg1,arg2...)"'
        }
    ]),
    async run(context, field, id, filter, resendBehavior, maxAgeSeconds, expression) {
        let input = await insomnia_plugin_response.run(context, field, id, filter, resendBehavior, maxAgeSeconds);
        console.debug(input, expression);

        let config = parse(expression);
        console.debug(config);

        switch (config.func) {
            case "moment":
                return moment(input).format(config.args.at(0));
            case "replace":
                return _.replace(input, config.args.at(0), config.args.at(1));
            case "replaceG":
                return _.replace(input, new RegExp(config.args.at(0), 'g'), config.args.at(1));
            case "replaceGI":
                return _.replace(input, new RegExp(config.args.at(0), 'gi'), config.args.at(1));
            case "trimStart":
                return _.trimStart(input, config.args.at(0));
            case "trimEnd":
                return _.trimEnd(input, config.args.at(0));
            default:
                return _.trim(input);
        }
    }
}];

function parse(filter) {
    let config = {
        func: null,
        args: []
    };

    if (!filter) {
        return config;
    }

    let func = _.first(_.split(filter, ':'));
    let args = _.trim(_.trimStart(_.replace(filter, func, ''), ':'));

    config.func = _.trim(func);
    if (args.length > 0) {
        config.args = _.map(_.split(args, ','), (item) => _.trim(item));
    }

    return config;
}
