import { Handler } from "@netlify/functions";

const handler: Handler = async (event, context) => {
  try {
    const response = await fetch("https://yatrarp.com/api/streams/live", {
      headers: {
        'User-Agent': 'Mozilla/5.0 (NetlifyProxy/1.0)'
      }
    });

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: "Upstream error" }),
      };
    }

    const data = await response.json();

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=60",
      },
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch live streams" }),
    };
  }
};

export { handler };
