import express from "express"
import dotenv from "dotenv";
import cors from "cors";
import db from "./utils/db.js"
// import all routes
import userRoutes from "./route/user.route.js"
// config dotenv before app
dotenv.config()

const app = express();
const port = process.env.PORT || 4000

app.use(
    cors({
        origin: process.env.BASE_URL,
        credentials: true,
        methods: ["GET", "POST", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"]
    })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }))

app.get('/', (req, res) => {
    res.send('Good Evening ya Phir khae Good Afternoon, Agent Twilight!')
})
app.get('/strix', (req, res) => {
    res.send('Code GO006!')
})

// call and connect database
db();

// config route
app.use("/api/v1/users/", userRoutes)

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})