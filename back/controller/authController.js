
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt=require("jsonwebtoken")
const crypto=require("crypto")



const generateAccessToken=(userId)=>
{
    return jwt.sign(
        {userId},
        process.env.ACCESS_TOKEN_SECRET,
        {expiresIn:"15m"}
    );
};
const generateRefreshToken=(userId)=>
{
    return jwt.sign(
        {userId},
        process.env.REFRESH_TOKEN_SECRET,
        {expiresIn:"7d"}
    )
}
const hashToken=(token)=>{
    return crypto.createHash("sha256").update(token).digest("hex");
}
const cookieOptions={
    httpOnly:true,
    secure:process.env.NODE_ENV==="production",
    sameSite:"lax",
    path:"/api/users"
};
// const cookieOptions = {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === "production",
//     sameSite: "lax",
//     path: "/api/users"
// };
const registerUser = async (req, res) => {
    try {
        const { name, email, contact, password } = req.body;

        // Check existing email
         if (!name || !email || !contact || !password) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }
         if (!/^\d{10}$/.test(contact)) {
            return res.status(400).json({
                message: "Enter a valid 10-digit contact number"
            });
        }

          if (password.length < 8) {
            return res.status(400).json({
                message: "Password must contain at least 8 characters"
            });
        }
        
        const normalizedEmail = email.trim().toLowerCase();
        const existingUser = await User.findOne({ 
            $or:[
                {email:normalizedEmail,},
                {contact}
            ]});

        if (existingUser) {
            return res.status(409).json({
                message: "User already registered, please login"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        // const newUser = new User({
        //     name,
        //     email,
        //     contact,
        //     password: hashedPassword
        // });

        const user=await User.create({
            name:name.trim(),
            email:normalizedEmail,
            contact,
            password:hashedPassword,
            role:"user"
        });


        // await newUser.save();

    //     return res.status(201).json(
    //         {
    //         message: "Registration successful"
    //     }
    // );
       return res.status(201).json({
            message: "Registration successful. Please login.",
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });


    } catch (error) {
        console.error("REGISTER ERROR:", error);

        if (error.code === 11000) {
            return res.status(409).json({
                message: "Email or Contact already exists"
            });
        }

        return res.status(500).json({
            message: error.message
        });
    }
};


//login
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
        return res.status(400).json({
            message: "Email and password are required"
        });
}
        const normalizedEmail = email.trim().toLowerCase();
        const user = await User.findOne({
            email: normalizedEmail
        });
        
        // const user = await User.findOne({
        //     email: email.trim().toLowerCase()
        // });

        if (!user) {
            return res.status(400).json({
                message: "User not found"
            });
        }

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid password"
            });
        }

        // Generate Tokens
        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        // Hash Refresh Token
        user.refreshTokenHash = hashToken(refreshToken);

        await user.save();

        console.log("LOGIN USER ID:", user._id);
console.log(
    "REFRESH HASH SAVED:",
    !!user.refreshTokenHash
);

        // Store Refresh Token in Cookie
        res.cookie("refreshToken", refreshToken, {
            ...cookieOptions,
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.status(200).json({
            message: "Login successful",
            accessToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role:user.role,
            }
        });

    } catch (error) {
        console.log("LOGIN ERROR:", error.message);

        return res.status(500).json({
            message: error.message
        });
    }
};
//refersh Token
// const refreshAccessToken = async (req, res) => {
//     try {
//         console.log(
//             "COOKIE NAMES:",
//             Object.keys(req.cookies || {})
//         );

//         const refreshToken = req.cookies?.refreshToken;
//           console.log(
//             "REFRESH TOKEN RECEIVED:",
//             !!refreshToken
//         );

//         if (!refreshToken) {
//             return res.status(401).json({
//                 message: "Refresh token not found. Please login."
//             });
//         }

//         // Verify Refresh Token
//         const decoded = jwt.verify(
//             refreshToken,
//             process.env.REFRESH_TOKEN_SECRET
//         );

//         const user = await User.findById(decoded.userId);

//         if (!user || !user.refreshTokenHash) {
//             return res.status(401).json({
//                 message: "Invalid refresh token."
//             });
//         }

//         // Compare Token Hash
//         if (user.refreshTokenHash !== hashToken(refreshToken)) {
//             return res.status(401).json({
//                 message: "Refresh token mismatch."
//             });
//         }

//         // Generate New Tokens
//         const newAccessToken = generateAccessToken(user._id);
//         const newRefreshToken = generateRefreshToken(user._id);

//         // Update Refresh Token Hash
//         user.refreshTokenHash = hashToken(newRefreshToken);
//         await user.save();

//         // Update Cookie
//         res.cookie("refreshToken", newRefreshToken, {
//             ...cookieOptions,
//             maxAge: 7 * 24 * 60 * 60 * 1000
//         });

//         return res.status(200).json({
//             message: "Token refreshed successfully",
//             accessToken: newAccessToken
//         });

//     } catch (error) {
//         console.log("REFRESH ERROR:", error.message);

//         res.clearCookie("refreshToken", cookieOptions);

//         return res.status(401).json({
//             message: "Refresh token expired or invalid."
//         });
//     }
// };


const refreshAccessToken = async (req, res) => {
    try {
        const refreshToken = req.cookies?.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({
                message: "Refresh token not found. Please login."
            });
        }

        const decoded = jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        const user = await User.findById(decoded.userId);

        if (!user || !user.refreshTokenHash) {
            return res.status(401).json({
                message: "Invalid refresh token."
            });
        }

        const tokenHash = hashToken(refreshToken);

        if (user.refreshTokenHash !== tokenHash) {
            return res.status(401).json({
                message: "Refresh token mismatch."
            });
        }

        const newAccessToken = generateAccessToken(user._id);
        const newRefreshToken = generateRefreshToken(user._id);

        user.refreshTokenHash = hashToken(newRefreshToken);
        await user.save();

        res.cookie("refreshToken", newRefreshToken, {
            ...cookieOptions,
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.status(200).json({
            message: "Token refreshed successfully",
            accessToken: newAccessToken
        });

    } catch (error) {
        console.log("REFRESH ERROR:", error.message);

        return res.status(401).json({
            message: "Refresh token expired or invalid."
        });
    }
};

//logout
const logout = async (req, res) => {
    try {
        const refreshToken = req.cookies?.refreshToken;

        if (refreshToken) {
            try {
                const decoded = jwt.verify(
                    refreshToken,
                    process.env.REFRESH_TOKEN_SECRET
                );

                const user = await User.findById(decoded.userId);

                if (
                    user &&
                    user.refreshTokenHash === hashToken(refreshToken)
                ) {
                    user.refreshTokenHash = null;
                    await user.save();
                }

            } catch (error) {
                console.log("Invalid refresh token during logout");
            }
        }

        res.clearCookie("refreshToken", cookieOptions);

        return res.status(200).json({
            message: "Logout successful"
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({ role: "user" })
            .select("-password -refreshTokenHash")
            .sort({ createdAt: -1 });

        return res.status(200).json({ users });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};

// GET CURRENT USER PROFILE
const getProfile = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Unauthorized"
            });
        }

        return res.status(200).json({
            message: "Profile fetched successfully",
            user: req.user
        });

    } catch (error) {
        return res.status(500).json({
            message: "Could not fetch profile"
        });
    }
};
module.exports = { registerUser,loginUser,refreshAccessToken,logout,getProfile,getAllUsers};
