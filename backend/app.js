const express=require('express');
const mongoose=require('mongoose');
const session = require('express-session');
const passport = require('passport');
const path = require('path');
const deleteRouter=require('./routes/deleteRouter');
const uploadRouter=require('./routes/uploadRouter');
const authRouter=require('./routes/authRouter');
const db=require("./config/db");
const cardModel=require('./models/card-model');
const { authenticateToken } = require('./middlewares/auth');
const cors = require('cors');

const app=express();


app.use(cors());
app.use(express.json());



app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production', 
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

app.use(passport.initialize());
app.use(passport.session());


app.use("/api/auth", authRouter);


app.use("/api/delete", authenticateToken, deleteRouter);
app.use("/upload", authenticateToken, uploadRouter);


app.get("/api/users", authenticateToken, async function(req,res){
    try {
        const users = await cardModel.find({ userId: req.user.userId });
        res.json(users);
    } catch (err) {
        console.error('Error fetching files:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
})


if (process.env.NODE_ENV === 'production') {
  const path = require('path');

  const frontendPath = path.join(__dirname, '../frontend/dist');
  app.use(express.static(frontendPath));

  app.get('/*', (req, res) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/upload')) {
      return res.status(404).json({ error: 'API route not found' });
    }
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    if (process.env.NODE_ENV === 'production') {
      console.log(`Frontend served from: ${path.join(__dirname, '../frontend/dist')}`);
    }
});