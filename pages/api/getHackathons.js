import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const dataPath = path.join(process.cwd(), "data.json");
    if (!fs.existsSync(dataPath)) {
      return res.status(200).json({ hackathons: [] });
    }

    const fileContent = fs.readFileSync(dataPath, "utf8");
    const data = JSON.parse(fileContent);

    return res.status(200).json({
      hackathons: data.hackathons || [],
      totalHackathons: (data.hackathons || []).length,
    });
  } catch (error) {
    console.error("Error reading hackathons:", error);
    return res.status(500).json({ error: "Failed to read hackathon ledger" });
  }
}
