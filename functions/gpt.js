const axios = require("axios");
const OPENAI_API_URL = `https://api.openai.com/v1/completions`;

function createResponse(statusCode, error, res) {
  return {
    statusCode,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
    },
    body: JSON.stringify({ payload: res, error }),
  };
}

function createPrompt(payload, field = "textInput") {
  const prompt = `Continue the 'User input' for the given 'Form field. If you are given a word, complete the sentence. If you are given a sentence, complete the paragraph. DO NOT REPEAT ANY 'User input' IN YOUR RESPONSE.
Form field: ${field}
User input: ${payload}`;
  return prompt.trim();
}

const defaultModelOptions = {
  model: "text-davinci-002",
  max_tokens: 1024,
  temperature: 0.5,
  top_p: 1,
  n: 1,
  stream: false,
  logprobs: null,
};

const STOP_TOKEN = "<text_end>";

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return createResponse(200, "OK");
  }

  const debug = event.queryStringParameters.debug;
  debug && console.log("debugging activated", debug);

  let body;
  try {
    body = JSON.parse(event.body);
  } catch (e) {
    return createResponse(400, "Bad Request");
  }

  debug && console.log("request body", body);

  if (body.payload == undefined) {
    return createResponse(400, "Missing Payload");
  }

  const prompt = createPrompt(body.payload, body.field);
  debug && console.log("gpt prompt", prompt);

  let gptParams = {
    ...defaultModelOptions,
    ...(body.options || {}),
    model: body.model || defaultModelOptions.model,
    stop: STOP_TOKEN,
    prompt,
  };
  debug && console.log("OpenAI Params:", gptParams);

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
  debug && console.log("OpenAI Response Payload:", gptPayload);

  if (gptPayload.choices === undefined) {
    return createResponse(503, gptPayload);
  }

  const completion =
    gptPayload.n && gptPayload.n > 1
      ? gptPayload.choices.map((choice) => choice.text.trim())
      : gptPayload.choices[0].text.trim();
  const response = {
    text: completion,
    model: gptPayload.model,
    usage: gptPayload.usage,
  };

  return createResponse(200, null, response);
};
