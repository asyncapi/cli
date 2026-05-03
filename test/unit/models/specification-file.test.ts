import { expect } from 'chai';
import { promises as fs } from 'fs';
import path from 'path';
import { Specification, load } from '../../../src/domains/models/SpecificationFile';
import { ErrorLoadingSpec } from '../../../src/errors/specification-file';

const { writeFile, unlink, mkdir } = fs;

const TMP_DIR = path.join(__dirname, '../../fixtures/tmp');

describe('SpecificationFile', () => {
  before(async () => {
    await mkdir(TMP_DIR, { recursive: true });
  });

  after(async () => {
    try {
      await unlink(path.join(TMP_DIR, 'empty.yaml'));
    } catch {
      // ignore
    }
    try {
      await unlink(path.join(TMP_DIR, 'empty.json'));
    } catch {
      // ignore
    }
    try {
      await unlink(path.join(TMP_DIR, 'whitespace-only.yaml'));
    } catch {
      // ignore
    }
  });

  describe('fromFile', () => {
    it('should throw ErrorLoadingSpec for empty YAML file', async () => {
      const emptyFile = path.join(TMP_DIR, 'empty.yaml');
      await writeFile(emptyFile, '', 'utf8');

      try {
        await Specification.fromFile(emptyFile);
        expect.fail('Should have thrown ErrorLoadingSpec');
      } catch (error) {
        expect(error).to.be.instanceOf(ErrorLoadingSpec);
        expect(error.message).to.include('empty');
      }
    });

    it('should throw ErrorLoadingSpec for empty JSON file', async () => {
      const emptyFile = path.join(TMP_DIR, 'empty.json');
      await writeFile(emptyFile, '', 'utf8');

      try {
        await Specification.fromFile(emptyFile);
        expect.fail('Should have thrown ErrorLoadingSpec');
      } catch (error) {
        expect(error).to.be.instanceOf(ErrorLoadingSpec);
        expect(error.message).to.include('empty');
      }
    });

    it('should throw ErrorLoadingSpec for whitespace-only file', async () => {
      const whitespaceFile = path.join(TMP_DIR, 'whitespace-only.yaml');
      await writeFile(whitespaceFile, '   \n  \n  ', 'utf8');

      try {
        await Specification.fromFile(whitespaceFile);
        expect.fail('Should have thrown ErrorLoadingSpec');
      } catch (error) {
        expect(error).to.be.instanceOf(ErrorLoadingSpec);
        expect(error.message).to.include('empty');
      }
    });

    it('should load valid YAML file successfully', async () => {
      const validFile = path.join(__dirname, '../../fixtures/specification.yml');
      const spec = await Specification.fromFile(validFile);
      expect(spec).to.be.instanceOf(Specification);
      expect(spec.text()).to.include('asyncapi');
    });
  });
});
