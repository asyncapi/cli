import Help from '@oclif/plugin-help';

export default class CustomHelpCLass extends Help {
    showHelp(args: string[]): void {
        this.showRootHelp();
    }
}