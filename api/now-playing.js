const { getNowPlaying } = require("./spotify");

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Cache-Control", "no-store, max-age=0");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const track = await getNowPlaying();
    if (!track) {
      return res.status(200).json({ track: null });
    }
    return res.status(200).json(track);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch Spotify data" });
  }
};
