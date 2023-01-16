const {JS_COMMON_PRESET, JavaScriptOptions, IndentationTypes} = require('@asyncapi/modelina');
/** @type {JavaScriptOptions} */
module.exports = {
  indentation: {
    size: 10,
    type: IndentationTypes.SPACES
  },
  moduleSystem: 'CJS',
  constraints: {
    modelName: (context) => {
      return `Custom${context.modelName}`;
    },
    propertyKey: (context) => {
      return `custom_prop_${context.objectPropertyModel.propertyName}`;
    }
  },
  presets: [
    {
      preset: JS_COMMON_PRESET,
      options: {
        example: true
      }
    }
  ]
}
