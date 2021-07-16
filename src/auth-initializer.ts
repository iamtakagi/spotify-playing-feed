import SpotifyWebApi from 'spotify-web-api-node'
import env from './env'
import fs from 'fs'

export default (store) => {
  const storedCredential = JSON.parse(
    fs.readFileSync('./data/credential.json', 'utf8')
  )

  const { accessToken, refreshToken } = storedCredential

  if (accessToken == null || refreshToken == null) return

  if (accessToken != null && refreshToken != null) {
    store.setCredential({ accessToken, refreshToken })
  }

  const spotify = new SpotifyWebApi({
    clientId: env.SPOTIFY_CLIENT_ID,
    clientSecret: env.SPOTIFY_CLIENT_SECRET,
    redirectUri: env.SPOTIFY_REDIRECT_URI,
    accessToken: store.credential.accessToken,
    refreshToken: store.credential.refreshToken,
  })

  spotify
    .getMe()
    .then((data) => {
      return data.body
    })
    .catch(async (e) => {
      const ref = (await spotify.refreshAccessToken()).body
      const accessToken = ref.access_token
      const refreshToken = ref.refresh_token
      if (accessToken) {
        store.setAccessToken(accessToken)
        spotify.setAccessToken(accessToken)
      }
      if (refreshToken) {
        store.setRefreshToken(refreshToken)
        spotify.setRefreshToken(refreshToken)
      }
      const data = await spotify.getMe()
      return data.body
    })
    .then((me) => {
      const message = `Logged-In as ${me.display_name || me.id}`
      console.log(message)
    })
}
