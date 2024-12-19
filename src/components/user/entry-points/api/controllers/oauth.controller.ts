import { Router, Request, Response } from "express";
import { CheckEmailAvailabilityRequest, CreateUserBody, CreateUserResponse, ErrorResponse, GetUserParams, LoginRequest, LoginResponse, LogoutRequest, LogoutResponse, UpdateUserBody, UpdateUserResponse, ValidatedRequest } from "../dtos/userCrud.dto"
import { autoInjectable } from "tsyringe";
import UserService from "../../../domain/services/user.service";
import { UserDto } from "../../../domain/dtos/user.dto";
import { validateEmail } from "../../../../../libraries/auth/validators/email.validator";
import { validatePasswordDetailed } from "../../../../../libraries/auth/validators/password.validator";
import AuthService from "../../../domain/services/auth.service";
import RedisService from "../../../../../libraries/loaders/redis.loader";
import { generateToken } from "../../../../../libraries/auth/jwt/jwt.service";
import authenticateJWT from "../../../../../libraries/auth/middlewares/jwt.middleware";
import { GoogleOAuthRequest } from "../dtos/oauth.dto";
import { OAuth2Client } from "google-auth-library";
import config from "../../../../../config";
import EmailService from "../../../domain/services/email.service";


//TODO separate auth calls into separate component: auth
@autoInjectable()
export default class OAuthController {
    private _router: Router
    private _googleClient: OAuth2Client

    constructor(private userService: UserService, private authService: AuthService, private redisService: RedisService, private emailService: EmailService) {
        this._router = Router()
        const googleClientId = config.googleClientId
        const googleClientSecret = config.googleClientSecret
        if (!googleClientId) {
            throw new Error("Google Client id is missing");
        }

        if(!googleClientSecret) {
            throw new Error("Google Client secret is missing");
            
        }
        this._googleClient = new OAuth2Client(googleClientId, googleClientSecret, "postmessage")
        this.defineRoutes()
    }


    private defineRoutes(): void {

        //Google OAuth
        this._router.post("/google", this.validateGoogleUser.bind(this))

        //Google OAuth login
        this._router.post("/google/login", this.login.bind(this))
    }

    private async validateGoogleUser(req: Request<{}, {}, GoogleOAuthRequest>, res: Response<CreateUserResponse | ErrorResponse>): Promise<void> {
        try {
            const { code } = req.body
            const { tokens } = await this._googleClient.getToken(code)
            const idToken = tokens.id_token
            if(!idToken) {
                res.status(400).send({ message: "Unable to get token from google" })
                return
            }
            const ticket = await this._googleClient.verifyIdToken({
                idToken: idToken,
                audience: config.googleClientId
            })
            const payload = ticket.getPayload()
            const email = payload?.email ?? ""
            const socialId = payload?.sub ?? ""

            const emailValidationResult = validateEmail(email)
            if (emailValidationResult.errors.length > 0) {
                res.status(400).send({ message: emailValidationResult.errors[0] })
                return
            }

            const existingUser = await this.userService.getUserByEmail(email)
            if (existingUser) {
                res.status(400).send({ message: "Email is already in use" })
                return
            }

            const createdUser = await this.userService.createSocialUser(email, socialId, "google")
            const token = generateToken(createdUser.id)

            await this.redisService.set(createdUser.id, { userId: createdUser.id, token: token })
            
            this.emailService.sendMarketingEmail(email)
                .catch(error => {
                    console.log("🚀 ~ UserController ~ registerUser ~ error:", error)
                })

            res.status(200).send({ token: token, userId: createdUser.id })
        } catch (error) {
            console.log("🚀 ~ OAuthController ~ validateGoogleUser ~ error:", error)
            res.status(500).send({message: "Failed Google Authentication"})
        }
    }

    private async login(req: Request<{}, {}, GoogleOAuthRequest>, res: Response<LoginResponse | ErrorResponse>): Promise<void> {
        try {
            const { code } = req.body
            const { tokens } = await this._googleClient.getToken(code)
            const idToken = tokens.id_token
            if (!idToken) {
                res.status(400).send({ message: "Unable to get token from google" })
                return
            }
            const ticket = await this._googleClient.verifyIdToken({
                idToken: idToken,
                audience: config.googleClientId
            })
            const payload = ticket.getPayload()
            const email = payload?.email ?? ""

            const loginResult = await this.authService.loginSocialUser(email);
            if (!loginResult) {
                res.status(401).send({ message: 'Invalid credentials' });
                return;
            }

            res.status(200).send({ token: loginResult.token, userId: loginResult.userId });

        } catch (error) {
            console.log("🚀 ~ OAuthController ~ login ~ error:", error)
            res.status(500).send({ message: "Failed Google Authentication" })
        }
    }

    public get routes(): Router {
        return this._router
    }
}