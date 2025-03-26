import 'reflect-metadata'
import express from 'express'
import loaders from './libraries/loaders'
import dotenv from "dotenv"
import config from "./config"

dotenv.config()

const startApp = async () => {
    const app = express()
    loaders(app)
    console.log("🚀 ~ drawstory ~ : App is running on port:", config.port)
}
    
startApp()