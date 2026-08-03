import { test } from '@oclif/test';
import { expect } from '@oclif/test';
import inquirer from 'inquirer';
import { Optimizations, Outputs } from '../../src/apps/cli/commands/optimize';

const unoptimizedYamlFile = './test/fixtures/dummyspec/unoptimizedSpec.yml';

describe('optimize - additional interactive tests', () => {
  describe('interactive terminal - different optimization combinations', () => {
    test
      .stub(inquirer, 'prompt', (stub: any) =>
        stub.resolves({
          optimization: [Optimizations.REUSE_COMPONENTS],
          output: Outputs.TERMINAL,
        })
      )
      .stderr()
      .stdout()
      .command(['optimize', unoptimizedYamlFile])
      .it('interactive: reuse components and output to terminal', (ctx, done) => {
        expect(ctx.stdout).to.contain('asyncapi');
        expect(ctx.stderr).to.equal('');
        done();
      });

    test
      .stub(inquirer, 'prompt', (stub: any) =>
        stub.resolves({
          optimization: [Optimizations.MOVE_DUPLICATES_TO_COMPONENTS],
          output: Outputs.TERMINAL,
        })
      )
      .stderr()
      .stdout()
      .command(['optimize', unoptimizedYamlFile])
      .it('interactive: move duplicates to components and output to terminal', (ctx, done) => {
        expect(ctx.stdout).to.contain('asyncapi');
        expect(ctx.stderr).to.equal('');
        done();
      });

    test
      .stub(inquirer, 'prompt', (stub: any) =>
        stub.resolves({
          optimization: [
            Optimizations.REMOVE_COMPONENTS,
            Optimizations.REUSE_COMPONENTS,
            Optimizations.MOVE_DUPLICATES_TO_COMPONENTS,
          ],
          output: Outputs.TERMINAL,
        })
      )
      .stderr()
      .stdout()
      .command(['optimize', unoptimizedYamlFile])
      .it('interactive: all optimizations and output to terminal', (ctx, done) => {
        expect(ctx.stdout).to.contain('asyncapi');
        expect(ctx.stderr).to.equal('');
        done();
      });
  });

  describe('non-interactive with specific optimizations', () => {
    test
      .stderr()
      .stdout()
      .command(['optimize', unoptimizedYamlFile, '--no-tty', '--optimization=remove-components'])
      .it('non-interactive with remove-components optimization', (ctx, done) => {
        expect(ctx.stdout).to.contain('asyncapi');
        expect(ctx.stderr).to.equal('');
        done();
      });
  });
});
