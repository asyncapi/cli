const fs = require('fs');
const path = require('path');

function bumpActionVersion() {
  const packageJsonPath = path.join(__dirname, '../../', 'package.json');
  const packageJsonVersion = require(packageJsonPath).version;

  const templatePath = path.join(__dirname, '../../', 'action-template.yml');
  const outputPath = path.join(__dirname, '../../', 'action.yml');

  const templateContent = fs.readFileSync(templatePath, 'utf8');
  const updatedContent = templateContent.replace(/\${ version }/g, packageJsonVersion);

  fs.writeFileSync(outputPath, updatedContent, 'utf8');
  console.log(`Updated action.yml with version ${packageJsonVersion}`);
}

bumpActionVersion();
