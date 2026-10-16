/* eslint-disable no-unused-expressions */
import cp from 'child_process';
import fs from 'fs';
import path from 'path';
import { expect } from 'chai';
import sinon from 'sinon';
import { logger, stream } from '../../../src/utils/logger';

describe('logger utility', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('logger', () => {
    it('should export a configured winston logger instance', () => {
      expect(logger).to.exist;
      expect(logger.info).to.be.a('function');
      expect(logger.warn).to.be.a('function');
      expect(logger.error).to.be.a('function');
    });

    it('should not create an unused logs directory at module path', () => {
      const logsPathInSrc = path.join(__dirname, '../../../src/utils/logs');
      const logsPathInLib = path.join(__dirname, '../../../lib/utils/logs');
      expect(fs.existsSync(logsPathInSrc)).to.be.false;
      expect(fs.existsSync(logsPathInLib)).to.be.false;
    });

    it('should not emit node-config warnings on stderr in production without NODE_CONFIG_DIR', () => {
      const result = cp.spawnSync(
        process.execPath,
        [
          '-e',
          'process.env.NODE_ENV = \'production\'; delete process.env.NODE_CONFIG_DIR; require(\'./lib/utils/logger\');',
        ],
        {
          cwd: path.resolve(__dirname, '../../../'),
          encoding: 'utf8',
        },
      );

      expect(result.stderr).to.not.include('WARNING: No configurations found in configuration directory');
      expect(result.stderr).to.not.include('WARNING: NODE_ENV value of \'production\' did not match');
      expect(result.stderr).to.equal('');
    });
  });

  describe('stream', () => {
    it('should forward written message to logger.info without trailing newline', () => {
      const infoSpy = sinon.spy(logger, 'info');
      stream.write('Sample log message\n');

      expect(infoSpy.calledOnce).to.be.true;
      expect(infoSpy.firstCall.args[0]).to.equal('Sample log message');
    });
  });
});
