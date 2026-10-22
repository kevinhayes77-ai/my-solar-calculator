

exports.handler = async function () {
  const token = process.env.GIVENERGY_API_TOKEN;

  if (!token) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "API token not configured" })
    };
  }

  try {
    const response = await fetch(
      "https://api.givenergy.cloud/v1/inverter",
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json"
        }
      }
    );
