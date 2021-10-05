import { injectable, container } from 'tsyringe';
import React, { FunctionComponent } from 'react';
import { Text, Newline } from 'ink';
const CommandList = ['validate', 'context'] as const;

export type CommandName = typeof CommandList[number]

export type Command = {
  [name in CommandName]: {
    usage: {
      command?: string,
      options?: string
    };
    shortDescription: string;
    longDescription?: string;
    flags: string[];
    subCommands?: string[];
  };
};

@injectable()
export class HelpMessage {
  private helpFlag = '-h, --help  display help for command';

  readonly usage: string = 'asyncapi [options] [command]';

  readonly flags = [
    this.helpFlag,
    '-v, --version output version number'
  ];

  readonly commands: Command = {
    validate: {
      usage: {
        command: '<spec-file-path | context-name>'
      },
      shortDescription: 'Validate asyncapi file',
      flags: [
        this.helpFlag,
        '-w, --watch  Enable watch mode (not implemented yet)'
      ]
    },
    context: {
      usage: {},
      shortDescription: 'Manage context',
      longDescription: 'Context is what makes it easier for you to work with multiple AsyncAPI files.\nYou can add multiple different files to a context.\nThis way you do not have to pass --file flag with path to the file every time but just --context flag with reference name.\nYou can also set a default context, so neither --file nor --context flags are needed',
      flags: [this.helpFlag],
      subCommands: [
        'list  list all saved contexts',
        'current  see current context',
        'use <context-name>  set given context as default/current',
        'add <context-name> <spec-file-path>  add/update context',
        'remove <context-name>  remove a context'
      ]
    }
  }
}

export class HelpMessageBuilder {
  private helpMessage: HelpMessage = container.resolve(HelpMessage);

  HelpComponent: FunctionComponent<{ command?: CommandName }> = ({ command }) => {
    if (command) {
      if (!CommandList.includes(command)) { return <Text color="red">❌{' '} {command} is not a vaild command</Text>; }
      const HelpComp = this.showCommandHelp;
      return <HelpComp command={command} />;
    }
    const RootHelp = this.showHelp;
    return <RootHelp />;
  }

  showHelp: FunctionComponent = () => {
    return <>
      <Text backgroundColor="greenBright" bold color="blackBright"> USAGE </Text>
      <Newline />
      <Text>
        <Text color="greenBright">{this.helpMessage.usage.split(' ')[0]}</Text>{' '}
        <Text color="yellowBright">{this.helpMessage.usage.split(' ')[1]}</Text>{' '}
        <Text color="blueBright">{this.helpMessage.usage.split(' ')[2]}</Text>
      </Text>
      <Newline />

      <Text backgroundColor="yellowBright" bold color="blackBright"> OPTIONS </Text>
      <Newline />
      {this.helpMessage.flags.map(flag => {
        const [alias, ...rest] = flag.split(',');
        const flg = rest[0]?.split(' ')[1];
        const msg = rest[0]?.split(' ').splice(2, rest[0].length).join(' ');
        return <Text key={flag}>
          <Text color="yellowBright" bold>{alias}</Text>,<Text color='yellowBright'>{flg}</Text> {msg}
        </Text>;
      })}
      <Newline />

      <Text backgroundColor="blueBright" bold color="blackBright"> COMMANDS </Text>
      <Newline />
      {Object.keys(this.helpMessage.commands).map(command => <Text key={command}>
        <Text color="blueBright" bold>{command}</Text>{' '} <Text>{this.helpMessage.commands[command as CommandName].shortDescription}</Text>
      </Text>)}
      <Newline />
    </>;
  }

  showCommandHelp: FunctionComponent<{ command: CommandName }> = ({ command }) => {
    const commandHelpObject = this.helpMessage.commands[command as CommandName];
    return <>
      <Text backgroundColor="greenBright" bold color="blackBright"> USAGE </Text>
      <Newline />
      <Text>
        <Text color="greenBright">asyncapi</Text>{' '}
        <Text>{command}</Text>{' '}
        <Text color="blueBright">{commandHelpObject.usage.command || '[command]'}</Text>{' '}
        <Text color="yellowBright">{commandHelpObject.usage.options || '[options]'}</Text>
      </Text>
      <Newline />

      {commandHelpObject.longDescription ? <Text color="cyan">{commandHelpObject.longDescription}<Newline /></Text> : null}

      <Text backgroundColor="yellowBright" bold color="blackBright"> OPTIONS </Text>
      <Newline />
      {commandHelpObject.flags.map(flag => {
        const [alias, ...rest] = flag.split(',');
        const flg = rest[0]?.split(' ')[1];
        const msg = rest[0]?.split(' ').splice(2, rest[0].length).join(' ');
        return <Text key={flag}>
          <Text bold color="yellowBright">{alias}</Text>, <Text color="yellowBright">{flg}</Text> {msg}
        </Text>;
      })}
      <Newline />

      {commandHelpObject.subCommands ? <>
        <Text backgroundColor="blueBright" bold color="blackBright"> COMMAND </Text>
        <Newline />
        {commandHelpObject.subCommands.map(cmd => {
          const [cmdName, ...rest] = cmd.split(' ');
          return <Text key={cmd}>
            <Text color='blueBright'>{cmdName}</Text>{' '} {rest.map(el => <Text key={el}>{el} </Text>)}
          </Text>;
        })}
      </> : null}

    </>;
  }
}
