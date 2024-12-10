import 'reflect-metadata'
import express from 'express'
import loaders from './libraries/loaders'
import dotenv from "dotenv"

dotenv.config()

const startApp = async () => {
    const app = express()
    loaders(app)
}
    
startApp()