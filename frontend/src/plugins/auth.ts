import { createAuth, AuthDriver } from 'vue-auth3'
import axios from 'axios'

const driverAuthBearer: AuthDriver = {
  request(auth, options, token) {
    options.headers.Authorization = 'Bearer ' + token

    return options
  },

  response(auth, res) {
    const token = res.data.accessToken

    if (token) {
      return token
    }

    return null
  },
}

export default createAuth({
  fetchData: {
    enabled: true, // send a request to `/api/user` if the user information stored in the cookie is not visible
    cache: true, // save user information to localStorage for use
    enabledInBackground: true, // refresh user information in the background
    url: '/api/auth/user',
    method: 'GET',
  },
  refreshToken: {
    enabled: false, // refresh token in goto page
    enabledInBackground: true, // refresh token in background
  },
  loginData: {
    url: '/api/auth/signin',
    method: 'POST',
    staySignedIn: false,
  },
  drivers: {
    http: {
      request: axios,
    },
    auth: driverAuthBearer,
  },
})
