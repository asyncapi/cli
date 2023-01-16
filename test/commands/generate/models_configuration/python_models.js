const {JavaOptions, IndentationTypes} = require('@asyncapi/modelina');
/** @type {JavaOptions} */
module.exports = {
  indentation: {
    size: 10,
    type: IndentationTypes.SPACES
  },
  constraints: {
    modelName: (context) => {
      return `Custom${context.modelName}`;
    },
    propertyKey: (context) => {
      return `custom_prop_${context.objectPropertyModel.propertyName}`;
    }
  },
  presets: [ ]
}
