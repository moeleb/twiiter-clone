import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import postRoutes from './routes/post.routes.js';
import notificationsRoutes from './routes/notification.routes.js';
import connectMongoDb from './db/connecetMongoDb.js';
import cookieParser from 'cookie-parser';
import  {v2 as cloudinary} from 'cloudinary';


dotenv.config();
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});



const app = express();
app.use(express.json());
app.use(cookieParser());
dotenv.config();
const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


connectMongoDb();

app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/posts", postRoutes)
app.use("/api/notification", notificationsRoutes)




app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});