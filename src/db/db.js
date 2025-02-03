import mongoose from 'mongoose'
import {DB_NAME} from '../constants.js'

const connectDB = async () =>{
    try{
        const connections = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`mongodb connected successfully...!! DB HOST ${connections.connection.host}`)
    }catch(error){
        console.log("mongodb connection error",error)
        process.exit(1)
    }
}

export default connectDB

