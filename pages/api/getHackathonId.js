import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { hackathonName } = req.body;

    // Read data.json
    const dataPath = path.join(process.cwd(), "data.json");
    const fileContent = fs.readFileSync(dataPath, "utf8");
    const data = JSON.parse(fileContent);

    // Find the hackathon by name
    const hackathon = data.hackathons.find((h) => h.name === hackathonName);

    if (!hackathon) {
      // If hackathon doesn't exist, return the next available ID
      const nextId =
        data.hackathons.length > 0
          ? Math.max(...data.hackathons.map((h) => h.id)) + 1
          : 0;
      return res.status(200).json({ hackathonId: nextId });
    }

    return res.status(200).json({ hackathonId: hackathon.id });
  } catch (error) {
    console.error("Error getting hackathon ID:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
