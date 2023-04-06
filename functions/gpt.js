import fetch from 'node-fetch';
global.fetch = fetch;

exports.handler = async (event, context) => {
  try {
    const body = JSON.parse(event.body);
    console.log(event.body);

    return import('chatgpt')
      .then((gpt) => {
        const api = new gpt.ChatGPTAPI({
          apiKey: process.env.OPENAI_API_KEY
        });
  
        console.log(body);
  
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
  } catch(e) {
    return {
      statusCode: 400,
      body: 'Malformed Payload ' + e,
    };
  }

};
