import fetch from "node-fetch";
global.fetch = fetch;

exports.handler = async (event, context) => {
  let body;

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method Not Allowed",
    };
  }

  if (!event.body || event.headers["content-type"] !== "application/json") {
    return {
      statusCode: 400,
      body: "Bad Request",
    };
  }

  console.log('parsing event body', event.body);
  try {
    body = JSON.parse(event.body);
  } catch (e) {
    console.log("bady body json", event.body);
    return {
      statusCode: 400,
      body: "Malformed Payload" + e,
    };
  }

  console.log(body.payload);
  if (body.payload === undefined) {
    return {
      statusCode: 400,
      body: "Payload Missing",
    };
  }

  console.log('importing chatgpt');
  return import("chatgpt").then((gpt) => {
    const api = new gpt.ChatGPTAPI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    return api.sendMessage(body.payload).then((response) => {
      return {
        statusCode: 200,
        body: response.text,
      };
    });
  });
};
