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
import EmailService from "../../../domain/services/email.service";


//TODO separate auth calls into separate component: auth
@autoInjectable()
export default class UserController {
    private _router: Router

    constructor(private userService: UserService, private authService: AuthService, private redisService: RedisService, private emailService: EmailService) {
        this._router = Router()
        this.defineRoutes()
    }


    private defineRoutes(): void {


        //Register User
        this._router.post("/register", this.registerUser.bind(this))

        //Update User
        this._router.post("/update", authenticateJWT, this.updateUser.bind(this))

        //User login
        this._router.post("/login", this.login.bind(this))

        //User Logout
        this._router.get("/logout", authenticateJWT, this.logout.bind(this))

        //Check email availability
        this._router.post("/email-available", this.checkEmailAvailability.bind(this))
        //Get User via ID
        this._router.get("/:userId", authenticateJWT, this.getUser.bind(this))
    }

    private async getUser(req: Request<GetUserParams>, res: Response<UserDto | ErrorResponse>): Promise<void> {
        const { userId } = req.params
        if (!userId) {
            res.status(400).send({ message: "Bad Request" })
            return
        }
        const user = await this.userService.getUserById(userId)
        if (user === null) {
            res.status(404).send({ message: "User not found" })
            return
        }
        res.status(200).send(user)
    }

    private async registerUser(req: Request<{}, {}, CreateUserBody>, res: Response<CreateUserResponse | ErrorResponse>): Promise<void> {
        const { email, password } = req.body

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

        const passwordValidationResult = validatePasswordDetailed(password)
        if (passwordValidationResult.errors.length > 0) {
            res.status(400).send({ message: "Invalid password.", details: passwordValidationResult.errors })
            return
        }

        const createdUser = await this.userService.createUser(email, password)
        const token = generateToken(createdUser.id)

        await this.redisService.set(createdUser.id, { userId: createdUser.id, token: token })
        
        this.emailService.sendWelcomeEmail(email)
            .catch(error => {
                console.log("🚀 ~ UserController ~ registerUser ~ error:", error)
            })
        
        res.status(200).send({ token: token, userId: createdUser.id })
    }

    private async login(req: Request<{}, {}, LoginRequest>, res: Response<LoginResponse | ErrorResponse>): Promise<void> {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).send({ message: "Bad Request" })
            return
        }
        const loginResult = await this.authService.loginUser(email, password);
        if (!loginResult) {
            res.status(401).send({ message: 'Invalid credentials' });
            return;
        }

        res.status(200).send({ token: loginResult.token, userId: loginResult.userId });
    }

    async logout(req: Request, res: Response<LogoutResponse | ErrorResponse>): Promise<void> {
        try {
            const userId = (req as ValidatedRequest).userId;
            await this.authService.logoutUser(userId);
            res.status(200).send({ message: 'Logout successful' });
        } catch (error) {
            res.status(500).send({ message: "Something went wrong" })
        }
    }

    private async updateUser(req: Request<{}, {}, UpdateUserBody>, res: Response<UserDto | ErrorResponse>): Promise<void> {
        const { userId, email } = req.body
        if (!userId || !email) {
            res.status(400).send({ message: "Bad Request" })
            return
        }
        const requestingUserId = (req as ValidatedRequest).userId
        if (userId !== requestingUserId) {
            res.status(401).send({ message: "Not allowed to change another user's information" })
            return
        }
        const user = await this.userService.getUserById(userId)
        if (user === null) {
            res.status(400).send({ message: "User with specified id doesn't exist" })
            return
        }

        const emailValidationResult = validateEmail(email)
        if (emailValidationResult.errors.length > 0) {
            res.status(400).send({ message: emailValidationResult.errors[0] })
            return
        }
        const userToUpdate = { ...user, email: email }
        const updatedUser = await this.userService.updateUser(userToUpdate)
        res.status(200).send(updatedUser)
    }

    private async checkEmailAvailability(req: Request<{}, {}, CheckEmailAvailabilityRequest>, res: Response<ErrorResponse>) {
        const { email } = req.body
        const result = await this.userService.checkEmailAvailability(email)
        if (result) {
            res.status(200).send()
        } else {
            res.status(400).send({ message: "Email already in use" })
        }
    }


    public get routes(): Router {
        return this._router
    }
}