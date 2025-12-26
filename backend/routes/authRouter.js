const express = require('express');
const router = express.Router();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');



const userSchema = new mongoose.Schema({
  googleId: String,
  email: String,
  name: String,
  picture: String
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);


const callbackURL = "/api/auth/google/callback";

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: callbackURL
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ googleId: profile.id });
    
    if (!user) {
      user = await User.create({
        googleId: profile.id,
        email: profile.emails[0].value,
        name: profile.displayName,
        picture: profile.photos[0].value
      });
    } else {
      // Update user info if needed
      user.email = profile.emails[0].value;
      user.name = profile.displayName;
      user.picture = profile.photos[0].value;
      await user.save();
    }
    
    return done(null, user);
  } catch (error) {
    return done(error, null);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});


router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  async (req, res) => {
    try {
      const user = req.user;
      const token = jwt.sign(
        { 
          userId: user._id, 
          email: user.email,
          name: user.name 
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );
      
 
      const frontendUrl = process.env.FRONTEND_URL || (process.env.NODE_ENV === 'production' ? '/' : 'http://localhost:5173');
      const redirectUrl = process.env.NODE_ENV === 'production' && !process.env.FRONTEND_URL
        ? `/?token=${token}` 
        : `${frontendUrl}?token=${token}`;
      res.redirect(redirectUrl);
    } catch (error) {
      console.error('Auth callback error:', error);
      const frontendUrl = process.env.FRONTEND_URL || (process.env.NODE_ENV === 'production' ? '/' : 'http://localhost:5173');
      const errorUrl = process.env.NODE_ENV === 'production' && !process.env.FRONTEND_URL
        ? `/?error=auth_failed`
        : `${frontendUrl}?error=auth_failed`;
      res.redirect(errorUrl);
    }
  }
);


router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        picture: user.picture
      }
    });
  } catch (error) {
    res.status(403).json({ message: 'Invalid token' });
  }
});

module.exports = router;

