const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    const token = res.header("Authorization");

    if(!token) {
        return res.status(401).json({ msg: "No token, access denied"})
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();

    } catch {
        res.status(401).json({ msg: "Invalid token"});
    }
}