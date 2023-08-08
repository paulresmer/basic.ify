const clientId = "e7b06f17219943c8adb37d1abf9de6c2"; // replace if running locally
const params = new URLSearchParams(window.location.search);
const code = params.get("code");

/* if auth code not included within url (window.location.search), redirect to prompt
user for authentication credentials */
if (!code) {
  redirectToAuthCodeFlow(clientId);
} else {
  const accessToken = await getAccessToken(clientId, code);
  const profile = await fetchProfile(accessToken);
  const top = await fetchTop(accessToken);
  populateProfileUI(profile);
  const artistIDs = populateTopUI(top, 10);
  const artists = await fetchArtists(accessToken, artistIDs);
  const artistArray = Array.from(Object.values(artists)[0]);
  generateScore(artistArray);
}

/* redirect function; prompts user authentication. only runs if auth code is not 
present within url */
export async function redirectToAuthCodeFlow(clientId) {
  const verifier = generateRandomVerifier(128);
  const challenge = await generateChall(verifier);

  localStorage.setItem("verifier", verifier);

  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("response_type", "code");
  params.append("redirect_uri", "https://paulresmer.github.io/basic.ify/results.html"); // redirect for successful auth
  params.append("scope", "user-read-private user-top-read"); // access token scope params
  params.append("code_challenge_method", "S256");
  params.append("code_challenge", challenge);

  document.location = `https://accounts.spotify.com/authorize?${params.toString()}`;
}

function generateRandomVerifier(length) {
  let text = '';
  let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

async function generateChall(codeVerifier) {
  const data = new TextEncoder().encode(codeVerifier);
  const digest = await window.crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// generates api access token for specified scope 
export async function getAccessToken(clientId, code) {
  const verifier = localStorage.getItem("verifier");

  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("grant_type", "authorization_code");
  params.append("code", code);
  params.append("redirect_uri", "https://paulresmer.github.io/basic.ify/results.html"); // redirect for successful auth
  params.append("code_verifier", verifier);

  const result = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params
  });

  const { access_token } = await result.json();
  return access_token;
}

// basic fetch functions

async function fetchProfile(token) {
  const result = await fetch("https://api.spotify.com/v1/me/", {
    method: "GET", headers: { Authorization: `Bearer ${token}` }
  });
  return await result.json();
}

async function fetchTop(token) {
  const result = await fetch("https://api.spotify.com/v1/me/top/artists", {
    method: "GET", headers: { Authorization: `Bearer ${token}` }
  });

  return await result.json();
}

async function fetchArtists(token, ids) {
  const result = await fetch("https://api.spotify.com/v1/artists?ids=" + ids, {
    method: "GET", headers: { Authorization: `Bearer ${token}` }
  });

  return await result.json();
}

function populateProfileUI(profile) {
  document.getElementById("displayName").innerText = profile.display_name;
  document.getElementById("date").innerText = (new Date()).toDateString();
}

function populateTopUI(top, n) {
  let topArtistsIDs = ""
  for (let i = 0; i < n; i++) { // top n=5 artists
    document.getElementById("a" + String(i)).innerText = top.items[i].name
    topArtistsIDs += top.items[i].id + ",";
  }
  topArtistsIDs = topArtistsIDs.slice(0, topArtistsIDs.length - 1);

  return topArtistsIDs
}

function generateScore(artists) {
  let score = 0;
  for (let i = 0; i < artists.length; i++) {
    document.getElementById("g" + String(i)).innerText = artists[i].popularity;
    score += artists[i].popularity;
  }
  score /= artists.length;
  score = (score).toFixed(2);
  document.getElementById("ug-score").innerText = String(score);
}
