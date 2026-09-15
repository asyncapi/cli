// eslint-disable-next-line @typescript-eslint/no-var-requires
const { Optimizer } = require('../lib/Optimizer')
const fs = require('fs')
const path = require('path')

// Construct absolute paths to input and output files
const inputFilePath = path.join(__dirname, 'input.yaml')
const outputFilePath = path.join(__dirname, 'output.yaml')

// Read input.yaml file synchronously and store it as a string
const input = fs.readFileSync(inputFilePath, 'utf8')
const optimizer = new Optimizer(input)

optimizer.getReport().then((report) => {
  console.log(report)
  const optimizedDocument = optimizer.getOptimizedDocument({
    output: 'YAML',
    rules: {
      reuseComponents: true,
      removeComponents: true,
      moveAllToComponents: true,
      moveDuplicatesToComponents: false,
    },
    disableOptimizationFor: {
      schema: false,
    },
  })

  // Store optimizedDocument to output.yaml
  fs.writeFileSync(outputFilePath, optimizedDocument)
})
