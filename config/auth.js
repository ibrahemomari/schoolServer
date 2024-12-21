const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const Teacher = require('../models/Teacher');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/teacher/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      console.log('🚀 ~ profile:', profile);
      try {
        const email = profile.emails[0].value;
        const existingTeacher = await Teacher.findOne({ email });

        if (existingTeacher) {
          return done(null, existingTeacher);
        }

        const newTeacher = new Teacher({
          googleId: profile.id,
          email: profile.emails[0].value,
          firstName: profile.name.givenName,
          lastName: profile.name.familyName,
        });

        await newTeacher.save();
        return done(null, newTeacher);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const teacher = await Teacher.findById(id);
    done(null, teacher);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
