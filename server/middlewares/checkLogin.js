const checkLogin = async (req, res, next) => {
  if (!req.session.user_id) {
    return res.status(401).send("your mom4");
  }
  try {
    next();
  } catch (error) {
    return res.status(401).send("your mom1");
  }
};

export { checkLogin };
