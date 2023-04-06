exports.handler = async (event, context) => {
  const body = event.body;

  return import('chatgpt')
    .then((gpt) => {
      const api = new gpt.ChatGPTAPI({
        apiKey: process.env.OPENAI_API_KEY
      })
      return api.sendMessage(body.payload)
    })
    .then((response) => {
      return {
        statusCode: 200,
        body: response.text,
      };
    });
};
