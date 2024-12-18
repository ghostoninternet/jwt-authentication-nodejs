// Author: TrungQuanDev: https://youtube.com/@trungquandev
import axios from 'axios'
import { toast } from 'react-toastify'
import { handleLogoutAPI, refreshTokenAPI } from '~/apis'

// Initialize a Axios instance (authorizedAxiosInstance) for customizing and global configuration
let authorizedAxiosInstance = axios.create()

// Request timeout: 10 minutes
authorizedAxiosInstance.defaults.timeout = 1000 * 60 * 10

// Allow axios to attach cookie for each request
authorizedAxiosInstance.defaults.withCredentials = true

/**
 * Config interceptors
 */

// Add a request interceptor
authorizedAxiosInstance.interceptors.request.use((config) => {
  // Get accessToken from localStorage and attach to header
  const accessToken = localStorage.getItem('accessToken')
  if (accessToken) {
    // Bearer: OAuth2.0 standard in identifying which token is being used
    // Bearer is a token that is used in authentication and authorization
    // Another token: Basic token, Digest token, OAuth token, v.v
    config.headers.Authorization = `Bearer ${accessToken}`
  }

  return config
}, (error) => {
  // Do something with request error
  return Promise.reject(error)
})

// Initialize a promise for calling API refreshToken
// The purpose of this promise is for when getting the first refresh token request, we will wait for this API
// until we get new accessToken, then we will retry all error APIs instead of calling immediately refreshToken for each error API
let refreshTokenPromise = null

// Add a response interceptor
authorizedAxiosInstance.interceptors.response.use((response) => {
  // Any status code that lie within the range of 2xx cause this function to trigger
  // Do something with response data
  return response
}, (error) => {
  // Handle unauthorized error
  if (error.response?.status === 401) {
    handleLogoutAPI()
      .then(() => {
        // If using cookie, remember to delete user info in localStorage
        localStorage.removeItem('userInfo')

        // Navigate to login after successfully logout
        location.href = '/login'
      })
  }

  // Handle refresh token
  // Get all request API that is error by using error.config
  const originalRequest = error.config
  console.log(originalRequest)
  if (error.response?.status === 410 && originalRequest) {
    if (!refreshTokenPromise) {
      // Get refresh token from localstorage if using approach saving token in localstorage
      const refreshToken = localStorage.getItem('refreshToken')

      // Call API refreshToken
      refreshTokenPromise = refreshTokenAPI(refreshToken)
        .then((res) => {
          // Get accessToken and assign to localStorage if using approach saving token in localstorage
          const { accessToken } = res.data
          localStorage.setItem('accessToken', accessToken)
          authorizedAxiosInstance.defaults.headers.Authorization = `Bearer ${accessToken}`

          // At this point, accessToken is already updated in cookie if using approach saving token in cookie
        })
        .catch((_error) => {
          // Whatever the error is, logout!
          handleLogoutAPI()
            .then(() => {
              // If using cookie, remember to delete user info in localStorage
              localStorage.removeItem('userInfo')

              // Navigate to login after successfully logout
              location.href = '/login'
            })
          return Promise.reject(_error)
        })
        .finally(() => {
          // Success or Error, we still assign refreshTokenPromise = null
          refreshTokenPromise = null
        })
    }

    // Return refreshTokenPromise in case success
    return refreshTokenPromise.then(() => {
      // Return axios instance combine with originalRequest to call all error api
      return authorizedAxiosInstance(originalRequest)
    })
  }

  // Handle error at one place, display error toast for every error API (Clean code)
  // Use console.log(error) to see error structure
  // Use toastify to display every error on screen. Except for 410 - GONE since this error status is used in refresh token
  console.log(error)
  if (error.response?.status !== 410) {
    toast.error(error.response?.data?.message || error?.message)
  }

  return Promise.reject(error)
})

export default authorizedAxiosInstance