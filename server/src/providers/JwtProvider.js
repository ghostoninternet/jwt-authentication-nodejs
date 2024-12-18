// Author: TrungQuanDev: https://youtube.com/@trungquandev
import JWT from 'jsonwebtoken'

export const ACCESS_TOKEN_SECRET_SIGNATURE = 'KBgJwUETt4HeVD05WaXXI9V3JnwCVP'
export const REFRESH_TOKEN_SECRET_SIGNATURE = 'fcCjhnpeopVn2Hg1jG75MUi62051yL'
/**
 * Function the will create a token - need 3 parameters
 * userInfo: User information that will be attached to token
 * secretSignature: A secret signature (string format) 
 * tokenLife: Time to live of token
 */
const generateToken = async (userInfo, secretSignature, tokenLife) => {
  try {
    return JWT.sign(userInfo, secretSignature, { algorithm: 'HS256', expiresIn: tokenLife })
  } catch (error) {
    throw new Error(error)
  }
}

/**
 * Function to check if a token is valid or not
 * Valid mean is the token created by using secretSignature or not
 */
const verifyToken = async (token, secretSignature) => {
  try {
    return JWT.verify(token, secretSignature)
  } catch (error) {
    throw new Error(error)
  }
}

export const JwtProvider = {
  generateToken,
  verifyToken
}