import * as Config from '@oclif/config';
import Help from '@oclif/plugin-help';
import * as chalk from 'chalk';

const {
    bold
} = chalk

function indentString(string:any, count=1, options: any={}) {
    const {
		indent = ' ',
		includeEmptyLines = false
	} = options;

	if (typeof string !== 'string') {
		throw new TypeError(
			`Expected \`input\` to be a \`string\`, got \`${typeof string}\``
		);
	}

	if (typeof count !== 'number') {
		throw new TypeError(
			`Expected \`count\` to be a \`number\`, got \`${typeof count}\``
		);
	}

	if (count < 0) {
		throw new RangeError(
			`Expected \`count\` to be at least 0, got \`${count}\``
		);
	}

	if (typeof indent !== 'string') {
		throw new TypeError(
			`Expected \`options.indent\` to be a \`string\`, got \`${typeof indent}\``
		);
	}

	if (count === 0) {
		return string;
	}

	const regex = includeEmptyLines ? /^/gm : /^(?!\s*$)/gm;

	return string.replace(regex, indent.repeat(count));
}

export default class CustomHelpCLass extends Help {    

    // formatRoot(): string {
    //     const description = this.config.pjson.oclif.description || this.config.pjson.description || ''
    //     return [
    //         description,
    //         '\b',
    //         bold(chalk.yellowBright('VERSION')),
    //         indentString(this.config.userAgent, 2),
    //         '\b',
    //         bold(chalk.greenBright('USAGE')),
    //         indentString(`$ ${this.config.bin} [COMMAND]`, 2)
    //     ].join('\n')
    // }

    // formatTopics(topics: Config.Topic[]): string {
    //     if(topics.length === 0) return '';

    //     const body = topics.map(c => `${c.name} ${c.description}`).join('\n')
        
    //     return [
    //         bold(chalk.cyanBright('TOPICS')),
    //         indentString(body, 2)
    //     ].join('\n');
    // }

    // formatCommands(commands: Config.Command[]): string {
    //     if (commands.length === 0) return '';

    //     const body = commands.map(c => `${c.id} ${c.description}`).join('\n');
        
    //     return [
    //         bold(chalk.blueBright('COMMAND')),
    //         indentString(body, 2)
    //     ].join('\n');
    // }
}