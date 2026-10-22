
exports.handler = async function () {
  const token = process.env.GIVENERGY_API_TOKEN;

  if (!token) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "API token not configured"
      })
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

    if (!response.ok) {
      throw new Error(`GivEnergy returned ${response.status}`);
    }

    const result = await response.json();

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        connected: true,
        inverterCount: result.data?.length ?? 0
      })
    };
  } catch (error) {
    return {
      statusCode: 502,
      body: JSON.stringify({
        error: "Unable to retrieve GivEnergy data"
      })
    };
  }
};
