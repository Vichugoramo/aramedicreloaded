const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET;


const unauthorizedMessage = { message: "Unauthorized" };

module.exports = (req, res, next) => {

    const authorizationToken = req.headers.authorization;
    if(!authorizationToken){
        return res.status(401).json();
    }

    const token = authorizationToken.split(' ')[1];
    try{
        const { type, userId } = jwt.verify(token, secret);
        req.user = { type, userId };
        next();
    }catch(error){
        return res.status(401).json(unauthorizedMessage);
    }
};