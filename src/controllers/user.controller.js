import { asyncHandler } from "../utils/asyncHandler.js"
import { apiError } from "../utils/apiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import { apiResponse } from "../utils/apiResponse.js"


const generateAccessandRefreshToken = async (userId) => {
    try {

        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        user.save({ validBeforeSave: false })
        return{accessToken,refreshToken}
        
    } catch (error) {
        throw new apiError(500, "Something went wrong",error)
    }
}






const registerUser =asyncHandler(async (req, res) => {
    //  res.status(200).json({
    //     message:"Suyog Dighe"
    // })

    /*
    1) Get the user data from the frontend
    2) Validate the user data
    3) check if the user already exists : username, email
    4) check for image, check for avatar
    5) upload the image to cloudinary,avatar
    6) create user object - create entry in db
    7) remove password and refresh token field from the response
    8) check for user creation
    9) send the response back to the frontend or return the response

    */

    const { fullname, email, username, password } = req.body
    console.log(fullname, email, username, password)

    if ([fullname, email, username, password].some((field) =>
        field?.trim() === "")) {
        throw new apiError(400,"All fields are mandatory")
    }

    const existedUser = await User.findOne({ $or: [{ email }, { username }] })
    
    if (existedUser) {
        throw new apiError(409, "User already exists")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0 ){
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if (!avatarLocalPath) {
        throw new apiError(400, "Avatar Image are mandatory")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!avatar) {
        throw new apiError(500, "Image upload failed")
    }

    const user = await User.create({
        fullname,
        email,
        username: username.toLowerCase(),
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
    })

    // if (!user) {
    //     throw new apiError(500, "User creation failed")
    // }

    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    if (!createdUser) {
        throw new apiError(500, "User creation failed")
    }

    return res
      .status(201)
      .json(new apiResponse(200, createdUser, "User created successfully"));

})

const loginUser = asyncHandler(async (req, res) => {
    //req body ->data
    //username or email 
    //find th user
    //password check
    //access and refresh token 
    //send cookie
    
    const { email, password, username } = req.body;
    if(!email && !username){
        throw new apiError(400, "Email or Username is required")
    }

    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if (!user) {
        throw new apiError(404, "User Not Found")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new apiError(404,"Invalid Password")
    }

    const { accessToken, refreshToken } = await generateAccessandRefreshToken(user._id);
    
    const loggedInUser = await User.findById(user._id).
        select("-password -refreshToken");
    
    const options = {
        httpOnly: true,
        secure:true
    }

    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken".refreshToken, options)
        .json(
            new apiResponse(
                200,
                {
                    user: loggedInUser, accessToken,refreshToken,
                },
                "User logged in successfully",
            )
        )

})

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken:undefined
            }
        },
        {
            new:true
        }

    )

    const options = {
      httpOnly: true,
      secure: true,
    };

    return res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new apiResponse(200, {} ,"User Logged Out"))
})



export {
    registerUser,
    loginUser,
    logoutUser
}