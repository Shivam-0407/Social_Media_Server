const mongoose = require('mongoose');
const { MongoClient, ServerApiVersion } = require('mongodb');
const dotenv = require('dotenv');
dotenv.config('./.env');

module.exports = async ()=>{
    const mongoURI = "mongodb+srv://shivamt0407:cM9BZY0voO8GgG0c@cluster0.c4vyvhu.mongodb.net/?retryWrites=true&w=majority";

    async function dbConnect(){
        try{
            const connect = await mongoose.connect(mongoURI,{
                // serverApi: {
                //   version: ServerApiVersion.v1,
                //   strict: true,
                //   deprecationErrors: true,
                // }
                }); 

                console.log('Connection to database is established 😎 ✌'+connect.connection.host);
        }catch(e){
            console.log(e);
            process.exit(1);
        }
    }

    dbConnect();
}