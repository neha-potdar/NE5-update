const passport = require('passport');
const sequelize = require('../../database/connection');
const LocalStrategy = require('passport-local').Strategy;
const { User } = require('../../models/user')(sequelize);

passport.use(
  new LocalStrategy(async (ne5_member_id, password, done) => {
    try {
      const user = await User.findOne({ where: { ne5_member_id } });
      if (!user) {
        return done(null, false, { message: 'Incorrect username or password' });
      }

      const isValidPassword = await user.validPassword(password);
      if (!isValidPassword) {
        return done(null, false, { message: 'Incorrect username or password' });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

module.exports = passport;
