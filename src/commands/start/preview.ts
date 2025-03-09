import { Command } from '@oclif/core';
import chokidar from 'chokidar';
import { bundle } from '../bundler'; 
import { startStudio } from '../studio'; 
import path from 'path';
import fs from 'fs';

export default class StartPreview extends Command {
  static description = 'Start a live preview of your AsyncAPI document with references resolved.';
  
  static args = [
    { name: 'file', required: true, description: 'Path to the AsyncAPI file' },
  ];

  async run() {
    const { args } = await this.parse(StartPreview);

    const filePath = path.resolve(args.file);
    if (!fs.existsSync(filePath)) {
      this.error(`File not found: ${filePath}`);
    }

    const bundleAndPreview = async () => {
      try {
        this.log('Bundling AsyncAPI file...');
        const bundledDocument = await bundle(filePath); 
        this.log('Starting Studio in preview mode...');
        await startStudio(bundledDocument, { readOnly: true }); 
      } catch (error) {
        this.error(`Error bundling AsyncAPI file: ${error.message}`);
      }
    };

    await bundleAndPreview();

    const watcher = chokidar.watch(filePath, { ignoreInitial: true });
    watcher.on('change', async () => {
      this.log('File changed. Reloading preview...');
      await bundleAndPreview();
    });

    this.log('Watching for file changes. Press Ctrl+C to stop.');
  }
}
