// require('dotenv').config({path:'./env'})

import dotenv from 'dotenv'
// import mongoose from 'mongoose'
// import {DB_NAME} from './constants'
import connectDB from './db/db.js'

dotenv.config({
    path:'./env'
})

connectDB()










/*
import express from 'express'
const app=express()


;( async () =>{
    try{
       await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
       app.on("Error", (error) =>{
        console.log('error :',error);
        throw error
       })

       app.listen(process.env.PORT, () =>{
        console.log(`App is Listening on port ${process.env.PORT}`)
       })

    }catch(error){
        console.log("ERROR",error)
        throw error
    }
})()
*/