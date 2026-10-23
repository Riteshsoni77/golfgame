import User from "../models/UserModel.js";


const isLoggedIn = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                message: "Unauthorized"
            });
        }

        const [scheme, token] = authHeader.trim().split(/\s+/);

        if (scheme?.toLowerCase() !== "bearer" || !token) {
            return res.status(401).json({
                message: "Authorization header must use the Bearer scheme"
            });
        }

        const user = await User.findOne({ token }).select("+token");

        if (!user) {
            return res.status(401).json({
                message: "Invalid token"
            });
        }

        req.user = user;
        req.userId = user._id;

        next();

    } catch (error) {
        console.log("Auth error:", error.message);

        return res.status(500).json({
            message: "Server error"
        });
    }
};

export default isLoggedIn;