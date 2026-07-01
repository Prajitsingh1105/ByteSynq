const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/User');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID || 'dummy_client_id',
    clientSecret: process.env.GITHUB_CLIENT_SECRET || 'dummy_client_secret',
    callbackURL: process.env.GITHUB_CALLBACK_URL || "http://localhost:3001/api/v1/auth/github/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ oauthId: profile.id, provider: 'github' });
      
      if (!user) {
        const email = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : `${profile.username}@github.local`;
        
        user = await User.findOne({ email });
        
        if (user) {
          user.oauthId = profile.id;
          user.provider = 'github';
          await user.save();
        } else {
          user = await User.create({
            email,
            oauthId: profile.id,
            provider: 'github'
          });
        }
      }
      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));
