import { Request, Response, Router } from "express";
import { OAuth2Client } from "google-auth-library";
import { autoInjectable } from "tsyringe";
import config from "../../../../../config";
import { generateToken } from "../../../../../libraries/auth/jwt/jwt.service";
import { validateEmail } from "../../../../../libraries/auth/validators/email.validator";
import RedisService from "../../../../../libraries/loaders/redis.loader";
import { logOAuthError } from "../../../../../libraries/logging/logger";
import AuthService from "../../../domain/services/auth.service";
import EmailService from "../../../domain/services/email.service";
import UserService from "../../../domain/services/user.service";
import { GoogleOAuthRequest } from "../dtos/oauth.dto";
import { CreateUserResponse, ErrorResponse, LoginResponse } from "../dtos/userCrud.dto";


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
            const fullname = payload?.name

            const emailValidationResult = validateEmail(email)
            if (emailValidationResult.errors.length > 0) {
                res.status(400).send({ message: emailValidationResult.errors[0] })
                return
            }

            const existingUser = await this.userService.getUserByEmail(email)
            if (existingUser) {
                if(existingUser.provider === "google") {
                    const loginResult = await this.authService.loginSocialUser(email, fullname);
                    if (!loginResult) {
                        res.status(401).send({ message: 'Invalid credentials' });
                        return;
                    }
                    await this.userService.updateLastLogin(loginResult.userId);
                    res.status(200).send({ token: loginResult.token, userId: loginResult.userId, name: loginResult.name });
                } else {
                    res.status(400).send({ message: "Email is already in use" })
                }
                return
            }

            const createdUser = await this.userService.createSocialUser(email, socialId, "google", fullname)
            const token = generateToken(createdUser.id)

            await this.redisService.set(createdUser.id, { userId: createdUser.id, token: token })
            
            this.emailService.sendMarketingEmail(email, fullname)
                .catch(error => {
                    console.log("🚀 ~ UserController ~ registerUser ~ error:", error)
                })

            res.status(200).send({ token: token, userId: createdUser.id, name: createdUser.fullname })
        } catch (error) {
            console.log("🚀 ~ OAuthController ~ validateGoogleUser ~ error:", error)
            logOAuthError("Failed Google Authentication", error)
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
            const fullname = payload?.name
            
            const existingUser = await this.userService.getUserByEmail(email)
            if(existingUser && existingUser.provider !== "google") {
                if(existingUser.provider) {
                    res.status(400).send({ message: 'Please use correct provider to login' });
                    return;
                } else {
                    res.status(400).send({ message: 'Please use email and password to login' });
                    return;
                }
            }
            const loginResult = await this.authService.loginSocialUser(email, fullname);
            if (!loginResult) {
                res.status(401).send({ message: 'Invalid credentials' });
                return;
            }


            await this.userService.updateLastLogin(loginResult.userId)
            res.status(200).send({ token: loginResult.token, userId: loginResult.userId, name: loginResult.name });

        } catch (error) {
            console.log("🚀 ~ OAuthController ~ login ~ error:", error)
            logOAuthError("Failed Google Authentication", error)
            res.status(500).send({ message: "Failed Google Authentication" })
        }
    }

    public get routes(): Router {
        return this._router
    }
}