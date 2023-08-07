# underground.ify

A web app that allows users to examine the uniqueness of their music tastes. 

Viewable at https://paulresmer.github.io/underground.ify.

## Running the App Locally

This app runs on Node.js. You can find instructions on how to install it [here](http://www.nodejs.org/download/).

Once installed, clone this repository and install its dependencies using $npm install .

### Spotify for Developers Dashboard

To register your own app and generate unique client credentials (for requests to the Spotify API), visit your [Spotify for Developers Dashboard](https://developer.spotify.com/dashboard). Register your own client_id, client_secret, and Redirect URIs. In our development process, we registered:

- http://localhost:5173
- http://localhost:5173/callback

with the first being necessary to facilitate the authorization code flow. 

Once you have generated your client_id and redirect URIs, replace them in script.js: 1; script.js: 31; and script.js:66 as applicable.

Run $npm run dev in your local directory, and open your port in a browser window.



