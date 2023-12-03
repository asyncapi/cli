// const inputArray = [
//   {
//     payload: { type: "string", "x-parser-schema-id": "<anonymous-schema-1>" },
//     "x-parser-message-name": "hello",
//   },
// ];

export const convertToJSONSchema = (inputArray) => {
  const jsonSchemaDraft7 = {
    type: "object",
    properties: {},
  };

  inputArray.forEach((item) => {
    const propertyName = item["x-parser-message-name"];
    const payload = item.payload;

    if (propertyName && payload) {
      jsonSchemaDraft7.properties[propertyName] = {
        type: payload.type,
      };
    }
  });

  return jsonSchemaDraft7;
};

// const result = convertToJSONSchema(inputArray);
