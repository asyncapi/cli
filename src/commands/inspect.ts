import { Args } from '@oclif/core';
import Command from '../core/base';
import { parse } from '../core/parser';
import { load } from '../core/models/SpecificationFile';
import { inspectFlags } from '../core/flags/inspect.flags';
import { proxyFlags } from '../core/flags/proxy.flags';
import { numberOfChannels } from '../core/utils/numberOfChannels';
import { numberOfServers } from '../core/utils/numberOfServers';
import { ValidationError } from '../core/errors/validation-error';
import { numberOfComponents } from '../core/utils/numberOfComponents';

export default class Inspect extends Command {
    static readonly description = 'Show the number of servers, channels, and components in AsyncAPI files';

    static readonly flags = {
        ...inspectFlags(),
        ...proxyFlags(), // Merge proxyFlags with validateFlags
    };

    static readonly args = {
        'spec-file': Args.string({ description: 'spec path, url, or context-name', required: false }),
        proxyHost: Args.string({ description: 'Name of the Proxy Host', required: false }),
        proxyPort: Args.string({ description: 'Name of the Port of the ProxyHost', required: false }),
    };

    async run() {
        const { args, flags } = await this.parse(Inspect);
        let filePath = args['spec-file'];
        const proxyHost = flags['proxyHost'];
        const proxyPort = flags['proxyPort'];
        if (proxyHost && proxyPort) {
            const proxyUrl = `http://${proxyHost}:${proxyPort}`;
            filePath = `${filePath}+${proxyUrl}`; // Update filePath with proxyUrl
        }
        try {
            this.specFile = await load(filePath);
        } catch (err: any) {
            if (err.message.includes('Failed to download')) {
                throw new Error('Proxy Connection Error: Unable to establish a connection to the proxy check hostName or PortNumber.');
            } else {
                this.error(
                    new ValidationError({
                        type: 'invalid-file',
                        filepath: filePath,
                    })
                );
            }
        }
        let { document } = await parse(this, this.specFile);
        const channels = await numberOfChannels(document);
        const servers = await numberOfServers(document);
        const components = await numberOfComponents(document);
        this.log(`The total number of Servers in asyncapi document is ${servers}`);
        this.log(`The total number of Channels in asyncapi document is ${channels}`);
        this.log(`The total number of Components in asyncapi document is ${components}`);
    }
}
