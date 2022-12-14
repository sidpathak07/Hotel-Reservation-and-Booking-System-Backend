const cookieToken = (user, res, isEmailVerificationMailSent) => {
  const token = user.getJwtToken();
  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIE_TIME * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  res.status(201).cookie("token", token, options).json({
    success: true,
    user,
    token,
    isEmailVerificationMailSent,
  });
};

module.exports = cookieToken;
