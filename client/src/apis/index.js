import authorizedAxiosInstance from "~/utils/authorizedAxios"
import { API_ROOT } from "~/utils/constants"

export const handleLogoutAPI = async () => {
  // Approach 1: Use local storage
  // Delete user information in local storage
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('userInfo')

  // Approach 2: Use httpOnly cookie
  // Call API to remove cookie
  return await authorizedAxiosInstance.delete(`${API_ROOT}/v1/users/logout`)
}

export const refreshTokenAPI = async (refreshToken) => {
  return await authorizedAxiosInstance.put(`${API_ROOT}/v1/users/refresh_token`, { refreshToken })
}