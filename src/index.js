// require('dotenv').config({path:'./env'})

import dotenv from 'dotenv'
// import mongoose from 'mongoose'
// import {DB_NAME} from './constants'
import connectDB from './db/db.js'
import app from './app.js'

dotenv.config()

connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000 , () => {
        console.log(`server is running on port ${process.env.PORT}`)
    })
})
.catch((err) =>{
    console.log("Mongo db connection failed !!!",err)
})










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