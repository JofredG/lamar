import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import helmet from "helmet";
import morgan from "morgan";
import path from "path"; //native package (comes with node already) 
import { fileURLToPath } from "url"; // allows us to properly set the path when we configure directories later on
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js"; 
import postRoutes from "./routes/posts.js";
import { register } from "./controllers/auth.js";
import { createPost } from "./controllers/posts.js";
import { verifyToken } from "./middleware/auth.js";

/* CONFIGURATIONS */ // middleware is something that runs between requests
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename);
dotenv.config();
const app = express();
app.use(express.json);
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({policy: "cross-origin"}));
app.use(morgan("common"));
app.use(bodyParser.json({limit: "30mb", extended: true}));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true}));
app.use(cors());
app.use("/assets", express.static(path.join(__dirname, 'public/assets'))); // in a real application we would store our assets in an actual cloud storage

/* FILE STORAGE */ //from multer github repo. Anytime a user sends a file to the site it will be saved in this folder
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/assets");
  },
  filename: function(req, file, cb){
    cb(null, file.originalname);
  }
})
// anytime we need to upload a file we'll be using this variable
const upload = multer({ storage }); 

/* ROUTES WITH FILES */
app.post("/auth/register", upload.single("picture"), register); // this is what is called middleware because it's in between and occurs between our actual logic
app.post("/posts", verifyToken, upload.single("picture"), createPost);

/* ROUTES */
app.use("/auth", authRoutes);
app.use("/user", userRoutes)
app.use("/posts", postRoutes);




/**********************NEED TO FINISH SETTING UP MONGO DB for the below ~6.25 into video *******************/
/* MONGOOS DB SETUP */
const PORT = process.env.PORT || 6001;
//require('dotenv').config({path:'../server/.env'})
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB');
  app.listen(PORT, () => console.log(`Server Port: ${PORT}`));
})
.catch((error) => console.log(`${error} did not connect`));
