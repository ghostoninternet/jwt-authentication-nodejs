// Author: TrungQuanDev: https://youtube.com/@trungquandev
import { StatusCodes } from 'http-status-codes'
import ms from 'ms'
import { 
  JwtProvider,
  ACCESS_TOKEN_SECRET_SIGNATURE,
  REFRESH_TOKEN_SECRET_SIGNATURE
} from '~/providers/JwtProvider'
/**
 * Mock nhanh thông tin user thay vì phải tạo Database rồi query.
 * Nếu muốn học kỹ và chuẩn chỉnh đầy đủ hơn thì xem Playlist này nhé:
 * https://www.youtube.com/playlist?list=PLP6tw4Zpj-RIMgUPYxhLBVCpaBs94D73V
 */
const MOCK_DATABASE = {
  USER: {
    ID: 'trungquandev-sample-id-12345678',
    EMAIL: 'trungquandev.official@gmail.com',
    PASSWORD: 'trungquandev@123'
  }
}

/**
 * 2 cái chữ ký bí mật quan trọng trong dự án. Dành cho JWT - Jsonwebtokens
 * Lưu ý phải lưu vào biến môi trường ENV trong thực tế cho bảo mật.
 * Ở đây mình làm Demo thôi nên mới đặt biến const và giá trị random ngẫu nhiên trong code nhé.
 * Xem thêm về biến môi trường: https://youtu.be/Vgr3MWb7aOw
 */

const login = async (req, res) => {
  try {
    if (req.body.email !== MOCK_DATABASE.USER.EMAIL || req.body.password !== MOCK_DATABASE.USER.PASSWORD) {
      res.status(StatusCodes.FORBIDDEN).json({ message: 'Your email or password is incorrect!' })
      return
    }
    
    // Create payload to attach to token
    const userInfo = {
      id: MOCK_DATABASE.USER.ID,
      email: MOCK_DATABASE.USER.EMAIL,
    }

    // Create 2 token: accessToken and refreshToken to push to FE
    const accessToken = await JwtProvider.generateToken(
      userInfo, 
      ACCESS_TOKEN_SECRET_SIGNATURE,
      '1h'
    )
    const refreshToken = await JwtProvider.generateToken(
      userInfo, 
      REFRESH_TOKEN_SECRET_SIGNATURE,
      '14 days'
    )

    /**
     * Handle return HTTP only cookie for client
     * About maxAge and ms package: https://expressjs.com/en/api.html
     * maxAge - Cookie lifetime will be set 14 days for this project
     * Note that: cookie lifetime different from token lifetime.
     */

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: ms('14 days')
    })

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: ms('14 days')
    })

    // Return user information and token in case that FE need to save token in Local Storage
    res.status(StatusCodes.OK).json({
      ...userInfo,
      accessToken,
      refreshToken,
    })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error)
  }
}

const logout = async (req, res) => {
  try {
    // Delete cookie
    res.clearCookie('accessToken')
    res.clearCookie('refreshToken')

    res.status(StatusCodes.OK).json({ message: 'Logout API success!' })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error)
  }
}

const refreshToken = async (req, res) => {
  try {
    // Approach 1: Get from cookie that was attached to request
    const refreshTokenFromCookie = req.cookies?.refreshToken

    // Approach 2: Get from local storage that FE will pass to request body when call API
    const refreshTokenFromBody = req.body?.refreshToken

    // Verify refreshToken
    const refreshTokenDecoded = await JwtProvider.verifyToken(
      // refreshTokenFromCookie, // use token from cookie
      refreshTokenFromBody, // use token from body
      REFRESH_TOKEN_SECRET_SIGNATURE
    )
    // Get user information from decoded data
    const userInfo = {
      id: refreshTokenDecoded.id,
      email: refreshTokenDecoded.email,
    }
    // Create new accessToken
    const accessToken = await JwtProvider.generateToken(
      userInfo, 
      ACCESS_TOKEN_SECRET_SIGNATURE,
      '1h'
    )
    // Attach new accessToken to cookie in case using httpOnly cookie
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: ms('14 days')
    })
    // Return new accessToken in case FE need to update in localStorage 
    res.status(StatusCodes.OK).json({ accessToken })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Refresh Token API failed!" })
  }
}

export const userController = {
  login,
  logout,
  refreshToken
}
