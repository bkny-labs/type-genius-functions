import fetch from "node-fetch";

const OPENAI_API_URL = `https://api.openai.com/v1/chat/completions`;
const TYPE_GENIUS_SYSTEM_PROMPT =
  "You are TypeGenius, an AI that helps people fill in inputs and text areas on any website. You will complete the sentence sent by the User and include no other output to your response.";

exports.handler = async (event, context) => {
  if (!event.body || event.headers["content-type"] !== "application/json") {
    return {
      statusCode: 400,
      body: "Bad Request",
    };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch (e) {
    return {
      statusCode: 400,
      body: "Malformed Payload" + e,
    };
  }

  if (!body.payload) {
    return {
      statusCode: 400,
      body: "Payload Missing",
    };
  }

  let gptResponse;
  try {
    gptResponse = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: TYPE_GENIUS_SYSTEM_PROMPT,
          },
          {
            role: "user",
            content: body.payload,
          },
        ],
      }),
    });
  } catch (e) {
    return {
      statusCode: 500,
      body: "OpenAI API Error: " + e,
    };
  }

  if (gptResponse.status !== 200) {
    const body = await gptResponse.text();
    return {
      statusCode: 500,
      body: `Failed to send message. HTTP ${gptResponse.status} - ${body}`,
    };
  }

  const gptPayload = await gptResponse.json();
  const completion = gptPayload?.choices[0]?.message;

  if (!completion) {
    return {
      statusCode: 500,
      body: "Server Error: No reply from OpenAI",
    };
  }

  return {
    statusCode: 200,
    body: completion,
  };
};
