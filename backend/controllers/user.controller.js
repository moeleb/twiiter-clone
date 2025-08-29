import User from "../models/user.model.js";
import Notification from "../models/notificaiton.model.js";
import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";

const getUserProfile =  async (req, res) => {
    const { username } = req.params;
    try{
    const user = await User.findOne({username}).select('-password');
    if(!user){
        return res.status(404).send('User not found');
    }
    return res.status(200).send(user);
}
    catch(err){
        console.log(err);
        return res.status(500).send('Server error');
    }
}

const followOrUnfollowUser = async (req, res) => {
    try{
        const {id} = req.params;
        console.log(id);
        
        const userToModify = await User.findById(id);
        const currentUser = await User.findById(req.user._id);

        if(id === req.user._id.toString()){
            return res.status(400).json({error : 'You cannot follow/unfollow yourself'});
        }
        if(!userToModify || !currentUser){
            return res.status(404).json({error : 'User not found'});
        }

        const isFollowing = currentUser.followings.includes(id);

        if (isFollowing) {
        // Unfollow
        await User.findByIdAndUpdate(id, {
            $pull: { followers: req.user._id } 
        }, { new: true });  

        await User.findByIdAndUpdate(req.user._id, {
            $pull: { followings: id } 
        }, { new: true }); 
        
        return res.status(200).json({ message: 'User unfollowed successfully' });
        } else {
        // Follow
        await User.findByIdAndUpdate(id, {
            $push: { followers: req.user._id } 
        }, { new: true });

        await User.findByIdAndUpdate(req.user._id, {
            $push: { followings: id } 
        }, { new: true });

        const newNotification = new Notification({
            type: 'follow',
            from : req.user._id,
            to : userToModify,
        });
        
        await newNotification.save();
        /// return the id of the response
        return res.status(200).json({ message: 'User followed successfully' }); // ✅
        }


    }
    catch(err){
        console.log(err);
        return res.status(500).send('Server error');    
    }
}

const getSuggestedUsers = async (req, res) => {
  try {
    const userId = req.user._id;

    // get the current user so we know who they're following
    const currentUser = await User.findById(userId).select("followings");

    if (!currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // aggregation pipeline: exclude me + random 10
    const suggestedUsers = await User.aggregate([
      {
        $match: {
          _id: { $ne: userId }
        }
      },
      { $sample: { size: 10 } }
    ]);

    // filter out users I already follow
    const filteredUsers = suggestedUsers.filter(
      (user) => !currentUser.followings.includes(user._id.toString())
    );

    // limit to 4 suggestions
    const finalSuggestions = filteredUsers.slice(0, 4);

    // remove password field if it exists
    finalSuggestions.forEach((user) => {
      if (user.password) delete user.password;
    });

    res.status(200).json(finalSuggestions);
  } catch (err) {
    console.error(err);
    return res.status(500).send("Server error");
  }
};

const updateUser = async (req, res) => {
        const {fullName, email, username, currentPassword , newPassword, bio,link} = req.body;
        let {profileImg, coverImg} = req.body;

        const userId = req.user._id;
        try{
            let user  = await User.findById(userId);
            if(!user){
                return res.status(404).json({error : 'User not found'});
            }

            if((!newPassword && currentPassword) || (!currentPassword && newPassword)){
                return res.status(400).json({error : 'Both current and new password are required to change password'});
            }
            if(newPassword && currentPassword){
                const isMatch = await bcrypt.compare(currentPassword, user.password);
                if(!isMatch){
                    return res.status(400).json({error : 'Current password is incorrect'});
                }
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(newPassword, salt);
                user.password = hashedPassword;
            }


            if(profileImg){

                if(user.profileImg){
                    await cloudinary.uploader.destroy(user.profileImg.split('/').pop().split('.')[0]);
                }
               const uploadedResponse=  await cloudinary.uploader(profileImg)
                profileImg = uploadedResponse.secure_url;
            }

            if(coverImg){
            const uploadedResponse=  await cloudinary.uploader(coverImg.split('/').pop().split('.')[0])
            const coverImg=  uploadedResponse.secure_url

            }

            user.fullname = fullName || user.fullname;
            user.email = email || user.email;
            user.username = username || user.username;
            user.bio = bio || user.bio;
            user.link = link || user.link;
            user.profileImg = profileImg || user.profileImg;
            user.coverImg = coverImg || user.coverImg;
            user.coverImg = coverImg || user.coverImg;

            user = await user.save();

            user.password = undefined;

            return res.status(200).json(user);    
    }
    catch(err){
        console.log(err);
        return res.status(500).send('Server error');    
    }
}




export  { getUserProfile ,followOrUnfollowUser,getSuggestedUsers, updateUser};