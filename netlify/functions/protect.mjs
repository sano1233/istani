import arcjet, { shield, detectBot } from "@arcjet/node";

const aj = arcjet({
  key: process.env.ARCJET_KEY,
  rules: [
    shield({
      mode: "LIVE",
    }),
    detectBot({
      mode: "LIVE",
      allow: ["CATEGORY:SEARCH_ENGINE"],
    }),
  ],
});

export async function handler(event) {
  const decision = await aj.protect({
    ip: event.headers["x-nf-client-connection-ip"] || "",
    method: event.httpMethod,
    url: event.rawUrl,
    headers: event.headers,
  });

  if (decision.isDenied()) {
    return {
      statusCode: 403,
      body: JSON.stringify({ message: "Forbidden" }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Hello world" }),
  };
}
