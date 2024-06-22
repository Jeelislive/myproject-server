import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';
import connectDB from './db/connectDB.js';
const app = express();
import mainRouter from './routes/routes.js'

app.use(express.json());
app.use(cors({
  origin: 'https://myproject-client-chi.vercel.app/',
  credentials: true
}));

connectDB();

app.use('/api', mainRouter);

const PORT = process.env.PORT|| 3000;

app.get("/", (req, res) => {
  res.send("App is workinggg");
});

app.listen(PORT, () => {
    console.log(`App is listening on ${PORT}`);
    
});
