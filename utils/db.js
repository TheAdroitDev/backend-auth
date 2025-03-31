import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config()

// export a function that connects to db
const db = () => {
    mongoose
        .connect(process.env.MONGO_URL)
        .then(() => {
            console.log("Connection to MongoDB Successfully!")
        })
        .catch((error) => {
            console.log("Connection to MongoDB failed!", error)
        })
}
export default db