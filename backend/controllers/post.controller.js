import User from "../models/user.model.js"
import Post from "../models/post.models.js"
import Notification from "../models/notificaiton.model.js"
import { v2 as cloudinary } from "cloudinary";

const createPost = async (req, res) => {
  try {
    const { text } = req.body;
    let { img } = req.body;
    const userId = req.user._id.toString();

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!text && !img) {
      return res.status(400).json({ error: "Post must have text or image" });
    }

    if (img) {
      const uploadedResponse = await cloudinary.uploader.upload(img, {
        folder: "posts",
      });
      img = uploadedResponse.secure_url;
    }

    const newPost = new Post({ user: userId, text, img });
    await newPost.save();

    res.status(201).json(newPost);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const likeUnlikePost = async (req, res) => {
        try {
            const userId= req.user._id
            const {id :postId} = req.params

            const post = await Post.findById(postId)

            const userLikedPost = post.likes.includes(userId)
            if(userLikedPost){
                await Post.updateOne(
                    {_id : postId},
                    {$pull : {
                        likes : userId
                    }},
                )
                await User.updateOne(
                    {_id : userId},
                    {$pull : {likedPosts : postId}}
                )
                const updatedLikes = post.likes.filter((id)=>id.toString()!==userId.toString())
                res.status(200).json(updatedLikes)
            }
            else {
                post.likes.push(userId)
                await post.save()

                await User.updateOne(
                    {_id : userId},
                    {$push : {likedPosts : postId}}
                )
                const notificaiton = new Notification({
                    from : userId,
                    to : post.user,
                    type : "like"
                })
               await  notificaiton.save()

               res.status(200).json(post.likes)
            }   
        }
        catch(error){
           res.status(500).json({error  : error.message})
         
        }

}

const commentOnPost = async (req, res) => {
    try {
        const {text} = req.body
        const postId = req.params.id
        const userId = req.user._id.toString()

        if(!text){
            return res.status(400).json({error : "Text Field is required"})
        }
        const post = await Post.findById(postId)
        if(!post){
            return res.status(404).json({error : "Post Not Found"})
        }
        const comment  = {
            user : userId,
            text
        }
        post.comments.push(comment)
        await post.save()
        return res.status(200).json(post)
    }
    catch(error) {  
        res.status(500).json({error  : error.message})

    }
}

const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)

        if(post.user.toString() !== req.user._id.toString()){
            return res.status(401).json({error : "You are not allowed to delete this post"})
        }
        if(post.img){
            const imgId = post.img.split("/").pop().split(".")[0]
            await cloudinary.uploader.destroy(imgId)
        }
        await Post.findByIdAndDelete(req.params.id)
        res.status(200).json({message : "Post deleted Successfully"})
    }
    catch(e){
        res.status(500).json({error  : err.message})
    }
}
const getAllPosts = async (req,res)=>{
    try {
        const posts = await Post.find().sort({createdAt : -1}).populate({
            path : "user",
            select : "-password"
        })
        .populate({
            path : "comments.user",
            select : ("-password"),
        })
        if(posts.length===0){
            return res.status(200).json([])
        }
        res.status(200).json(posts)
    }
    catch(error){
        res.status(500).json({error  : error.message})
    }
}


const getLikedPosts = async (req,res) =>{
    try{
        const userId = req.params.id 
        const user = await User.findById(userId)
        const likedPosts = await Post.find({
            _id : {$in : user.likedPosts}
        }).populate({
            path : "user",
            select : "-password"
        }).populate({
            path : "comments.user",
            select : "-password"
        })
        res.status(200).json(likedPosts)
    }
    catch(err){
        console.log(err);
        return res.status(500).send('Server error');    
    }
}


const getFollowingPosts = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId); // ✅ fixed

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const following = user.followings; // ✅ usually plural
    const feedPosts = await Post.find({ user: { $in: following } })
      .sort({ createdAt: -1 }) // ✅ sort after find
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });

    res.status(200).json(feedPosts);
  } catch (error) {
    console.log(error);
    return res.status(500).send("Server error");
  }
};

const getUserPosts = async (req,res) => {
    try {
            const {username} = req.params
            const user = await User.findOne({username})
            if (!user) {
            return res.status(404).json({ message: "User not found" });
            }   
            
            const posts = await Post.find({user : user._id}).sort({createdAt : -1}).populate({
                path : "user",
                select : "-password",
            }).populate({
                path : "comments.user",
                select : "-password"
            })

            res.status(200).json(posts)

        }
    catch (error) {
    console.log(error);
    return res.status(500).send("Server error");
  }
}



export {
    createPost,
    likeUnlikePost,
    commentOnPost,
    deletePost,
    getAllPosts,
    getLikedPosts,
    getFollowingPosts,
    getUserPosts
}