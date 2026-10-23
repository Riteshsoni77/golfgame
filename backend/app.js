
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import userRouter from "./src/routes/UserRoute.js";
import subscriptionRoute from "./src/routes/SubscriptionRoute.js";
import charityRoutes from "./src/routes/CharityRoute.js";
import golfScoreRoutes from "./src/routes/GolfScoreRoutes.js";
import drawRoutes from "./src/routes/DrawRoutes.js";
import winnerRoutes from "./src/routes/WinnerRoutes.js";
import adminRoutes from "./src/routes/AdminRoutes.js";





const app = express();


app.use(express.json());
app.use(cors());


app.use("/api/user", userRouter);

app.use("/api/subscription", subscriptionRoute);

app.use("/api/charity", charityRoutes);


app.use("/api/golf-scores", golfScoreRoutes);



app.use("/api/draws", drawRoutes);


app.use("/api/winners", winnerRoutes);



app.use("/api/admin", adminRoutes);


app.get("/", (req, res) => {
  res.send("Hello, World!");
});

 const start = async () => {
    app.set("mongo_user")
    const connectionDb = await mongoose.connect("mongodb+srv://riteshsoni1138_db_user:lGTSy1yKtO9n4cp7@cluster0.xeb6dtx.mongodb.net/");

    console.log(`MONGO Connected DB HOst: ${connectionDb.connection.host}`)
    app.listen(3000, () => {
        console.log("LISTENIN ON PORT 3000")
    });


    

}

start();

