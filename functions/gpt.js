exports.handler = async (event, context) => {
  const body = event.body;

  return import('chatgpt')
    .then((gpt) => {
      const api = new gpt.ChatGPTAPI({
        apiKey: process.env.OPENAI_API_KEY
      });

      if (body.payload !== undefined) {
        return api.sendMessage(body.payload)
          .then((response) => {
            return {
              statusCode: 200,
              body: response.text,
            };
          });
      } else {
        return {
          statusCode: 400,
          body: 'Payload missing',
        };
      }
    });
};
