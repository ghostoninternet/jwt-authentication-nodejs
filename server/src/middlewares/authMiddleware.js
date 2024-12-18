import { StatusCodes } from 'http-status-codes'
import { 
  JwtProvider,
  ACCESS_TOKEN_SECRET_SIGNATURE,
  REFRESH_TOKEN_SECRET_SIGNATURE
} from '~/providers/JwtProvider'
const ACCESS_TOKEN_SECRET_SIGNATURE = 'KBgJwUETt4HeVD05WaXXI9V3JnwCVP'
// This middleware will get and verify the JWT accessToken received from FE
const isAuthorized = async (req, res, next) => {
  // Approach 1: Get accessToken in cookie
  const accessTokenFromCookie = req.cookies?.accessToken
  if (!accessTokenFromCookie) {
    res.status(StatusCodes.UNAUTHORIZED).json({
      message: "Unauthorized! (Token not found)"
    })
    return
  }

  // Approach 2: Get accessToken in header
  const accessTokenFromHeader = req.headers.authorization
  if (!accessTokenFromHeader) {
    res.status(StatusCodes.UNAUTHORIZED).json({
      message: "Unauthorized! (Token not found)"
    })
    return
  }

  try {
    // Step 1: Decode token to verify it
    const accessTokenDecoded = await JwtProvider.verifyToken(
      // accessTokenFromCookie, // use token from cookie
      accessTokenFromHeader.substring('Bearer '.length), // use token from header
      ACCESS_TOKEN_SECRET_SIGNATURE
    )
    // Step 2: If token is valid, save decoded information in req.jwtDecode
    req.jwtDecoded = accessTokenDecoded
    // Step 3: Allow request to continue
    next()
  } catch (error) {
    console.log("Error from authMiddleware: ", error)
    // If accessToken is expired then return error status 410 to let FE know to call API refreshToken
    if (error.message?.includes('jwt expired')) {
      res.status(StatusCodes.GONE).json({
        message: "Need to refresh token"
      })
      return
    }
    // If accessToken is invalid for whatever reason except for expired, return error status 401
    // to let FE logout and call logout API
    res.status(StatusCodes.UNAUTHORIZED).json({
      message: "Unauthorized! Please login!"
    })
  }
}

export const authMiddleware = {
  isAuthorized
}