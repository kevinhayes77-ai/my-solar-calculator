
export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  const token = process.env.GIVENERGY_API_TOKEN;

  if (!token) {
    return res.status(500).json({
      connected: false,
      error: "API token not configured"
    });
  }

  try {
    const response = await fetch(
      "https://api.givenergy.cloud/v1/communication-device",
      {
        headers: {
      Authorization: "Bearer " + token,
          Accept: "application/json"
        }
      }
    );

    if (!response.ok) {
      return res.status(502).json({
        connected: false,
        error: "GivEnergy request failed",
        status: response.status
      });
    }

    const result = await response.json();

    return res.status(200).json({
      connected: true,
      inverterCount: result.data?.length ?? 0,
      inverter:result.data?.[0} ?? null
    });
  } catch (error) {
    return res.status(502).json({
      connected: false,
      error: "Unable to contact GivEnergy"
    });
  }
}
