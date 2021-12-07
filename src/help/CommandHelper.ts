import CommandHelp from '@oclif/plugin-help/lib/command';
import * as Config from '@oclif/config';
import { renderList } from '@oclif/plugin-help/lib/list';
import chalk from 'chalk';
import indent from 'indent-string';

const {
  underline,
  bold,
  dim
} = chalk;

export default class CommandHelper extends CommandHelp {
  /* eslint-disable sonarjs/cognitive-complexity */
  flags(flags: Config.Command.Flag[]): string | undefined { // NOSONAR
    if (flags.length === 0) { return; }
    const body = renderList(flags.map(flag => {
      let left = flag.helpLabel;

      if (!left) {
        const label = [];
        if (flag.char) { label.push(`-${flag.char[0]}`); }
        if (flag.name) {
          if (flag.type === 'boolean' && flag.allowNo) {
            label.push(`--[no-]${flag.name.trim()}`);
          } else {
            label.push(`--${flag.name.trim()}`);
          }
        }
        left = label.join(', ');
      }

      if (flag.type === 'option') {
        let value = flag.helpValue || flag.name;
        if (!flag.helpValue && flag.options) {
          value = flag.options.join('|');
        }
        if (!value.includes('|')) { value = underline(value); }
        left += `=${value}`;
      }

      let right = flag.description || '';
      // `flag.default` is not always a string (typing bug), hence `toString()`
      if (flag.type === 'option' && (flag.default || flag.default?.toString() === '0')) {
        right = `[default: ${flag.default}] ${right}`;
      }
      if (flag.required) { right = `(required) ${right}`; }

      return [left, dim(right.trim())];
    }), { stripAnsi: this.opts.stripAnsi, maxWidth: this.opts.maxWidth - 2 });
    return [
      bold('FLAGS'),
      indent(body, 2),
    ].join('\n');
  }
}

