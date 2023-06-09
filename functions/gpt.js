const axios = require("axios");
const OPENAI_API_URL = `https://api.openai.com/v1/completions`;

function createResponse(statusCode, error, res) {
  return {
    statusCode,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
      "Access-Control-Allow-Headers": "Content-Type",
      'Access-Control-Allow-Methods': 'POST, OPTIONS'
    },
    body: JSON.stringify({ payload: res, error }),
  };
}

const defaultModelOptions = {
  model: "text-davinci-002",
  max_tokens: 1024,
  temperature: 0,
  top_p: 1,
  n: 1,
  stream: false,
  logprobs: null,
}

const STOP_TOKEN = "<text_end>";

exports.handler = async (event) => {
  if(event.httpMethod === 'OPTIONS') {
    return createResponse(200, 'ok');
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch (e) {
    return createResponse(400, "Invalid input");
  }
  console.log('test log', body);

  const field = body.field;
  const payload = body.payload;
  const multi = body.multi || false;

  if (field === undefined || payload == undefined) {
    return createResponse(400, "Payload missing");
  }

  // const prompt = `You're a powerful auto-completion AI in the process of filling in a form field labelled '${field}' on a website; you write: ${payload} `;
  const prompt = `You are an auto-completion AI generating output for a form field named '${field}', only when you have completely finished generating field text, output the stop token '${STOP_TOKEN}': ${payload}`.trim();
  console.log('the prompt', prompt);

  let gptParams = {
    ...defaultModelOptions,
    ...body.modelOptions,
    model: body.model || defaultModelOptions.model,
    stop: STOP_TOKEN,
    prompt,
  };
  console.log('the params', gptParams);

  let gptResponse;

  try {
    gptResponse = await axios.post(OPENAI_API_URL, gptParams, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
    });
  } catch (e) {
    return createResponse(503, e);
  }

  const gptPayload = gptResponse.data;
  console.log('the payload', gptPayload);

  if (gptPayload.choices === undefined) {
    return createResponse(503, gptPayload);
  }

  const completion = multi ? gptPayload.choices.map((choice) => choice.text.trim()) : gptPayload.choices[0].text.trim();
  const response = {
    text: completion,
    model: gptPayload.model,
    usage: gptPayload.usage,
  };

  return createResponse(200, null, response);
};
