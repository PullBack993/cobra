module.exports = () => (req, res, next) => {
  const corsWhitelist = [
    "http://localhost:3001",
    "https://oen2hero.netlify.app",
    "http://localhost:5173",
    "https://www.one2hero.com",
    "https://one2hero.com",
    "https://www.one2hero.com",
  ];
  if (corsWhitelist.indexOf(req.headers.origin) !== -1) {
    res.setHeader("Access-Control-Allow-Origin", req.headers.origin),
      res.setHeader("Access-Control-Allow-Credentials", true),
      res.setHeader("Access-Control-Allow-Methods", "HEAD, OPTIONS, GET, POST, PUT, DELETE"),
      res.setHeader(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
      );
  }
  next();
};
