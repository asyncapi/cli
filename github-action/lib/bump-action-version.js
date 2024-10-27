const fs = require('fs');
const path = require('path');

module.exports = {
  prepare: async (pluginConfig, context) => {
    const { nextRelease } = context;
    const version = nextRelease.version;

    const templatePath = path.resolve(__dirname, '../../', 'action-template.yml');
    const outputPath = path.resolve(__dirname, '../../', 'action.yml');

    try {
      const templateContent = fs.readFileSync(templatePath, 'utf8');
      const updatedContent = templateContent.replace(/\${ version }/g, version);
      fs.writeFileSync(outputPath, updatedContent, 'utf8');
      console.log(`Updated action.yml with version ${version}`);
    } catch (error) {
      console.error('Error updating action.yml:', error);
      throw error;
    }
  }
};
