const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";
const SPOTIFY_API = "https://api.spotify.com/v1";

async function getAccessToken() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error("Missing Spotify environment variables");
  }

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken
  });

  const res = await fetch(SPOTIFY_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Spotify token refresh failed: ${err}`);
  }

  const data = await res.json();
  return data.access_token;
}

function trackPayload(item, isPlaying = false) {
  if (!item) return null;

  const artists = (item.artists ?? []).map(a => a.name).join(", ");
  const album = item.album?.name ?? "";
  const images = item.album?.images ?? [];
  const albumImage = images.length ? images[images.length - 1].url : "";

  return {
    isPlaying,
    track: item.name,
    artist: artists,
    album,
    albumImage,
    url: item.external_urls?.spotify ?? null
  };
}

async function fetchCurrentlyPlaying(token) {
  const res = await fetch(`${SPOTIFY_API}/me/player/currently-playing`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (res.status === 204) return null;
  if (!res.ok) return null;

  const data = await res.json();
  if (!data?.item) return null;

  return trackPayload(data.item, Boolean(data.is_playing));
}

async function fetchRecentlyPlayed(token) {
  const res = await fetch(`${SPOTIFY_API}/me/player/recently-played?limit=1`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) return null;

  const data = await res.json();
  const item = data?.items?.[0]?.track;
  return trackPayload(item, false);
}

async function getNowPlaying() {
  const token = await getAccessToken();
  const current = await fetchCurrentlyPlaying(token);
  if (current) return current;
  return fetchRecentlyPlayed(token);
}

module.exports = { getNowPlaying };
