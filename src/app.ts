import 'reflect-metadata'
import express from 'express'
import loaders from './libraries/loaders'

const startApp = async () => {
    const app = express()
    loaders(app)
}
    
startApp()