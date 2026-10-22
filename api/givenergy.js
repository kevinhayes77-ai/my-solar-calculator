// Vercel serverless endpoint for GivEnergy readings.
// Keep GIVENERGY_API_TOKEN in Vercel environment variables, never in browser code.
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const token = process.env.GIVENERGY_API_TOKEN;
  if (!token) return res.status(500).json({ connected: false, error: 'API token not configured' });

  const headers = { Authorization: `Bearer ${token}`, Accept: 'application/json' };
  try {
    const devicesResponse = await fetch('https://api.givenergy.cloud/v1/communication-device', { headers });
    if (!devicesResponse.ok) return res.status(502).json({ connected: false, error: 'Device lookup failed', status: devicesResponse.status });
    const devices = await devicesResponse.json();
    const device = devices.data?.[0];
    const serial = device?.inverter?.serial_number ?? device?.serial_number;
    if (!serial) return res.status(404).json({ connected: false, error: 'No inverter serial number found' });

    const response = await fetch(`https://api.givenergy.cloud/v1/inverter/${encodeURIComponent(serial)}/system-data/latest`, { headers });
    if (!response.ok) return res.status(502).json({ connected: true, error: 'Live readings request failed', status: response.status });
    const result = await response.json();
    const data = result.data ?? result;
    const power = data.power ?? {};
    const battery = data.battery ?? {};
    const solar = power.solar?.power ?? power.solar ?? null;
    const consumption = power.consumption?.power ?? power.consumption ?? null;
    const percentage = battery.percent ?? battery.soc ?? data.soc ?? null;
    return res.status(200).json({
      connected: true,
      inverterCount: devices.data?.length ?? 1,
      inverter: device,
      readings: data,
      solarGenerationKw: typeof solar === 'number' ? solar / 1000 : null,
      householdUseKw: typeof consumption === 'number' ? consumption / 1000 : null,
      batteryChargePercent: typeof percentage === 'number' ? percentage : null
    });
  } catch (error) {
    return res.status(502).json({ connected: false, error: 'Request failed' });
  }
}
