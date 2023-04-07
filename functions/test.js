exports.handler = async (event, context) => {
  return {
    statusCode: 200,
    body: process.env.AWS_LAMBDA_JS_RUNTIME,
  };
};
