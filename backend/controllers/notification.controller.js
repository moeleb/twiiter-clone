import Notification from "../models/notificaiton.model.js";


const getNotifications = async (req, res) =>{
    try {
        const userId = req.user._id
        const notifications = await Notification.find({
            to : userId,
        }).populate({
            path : "from",
            select : "username profileImg"
        })
        await Notification.updateMany({to : userId}, {read :true})
        return res.status(200).json(notifications)
    }
    catch(error) {
        res.status(500).json({error : "Internal Sever Error" })
    }
}

const deleteNotifications = async (req, res) => {
    try {
        const userId = req.user._id;

        const result = await Notification.deleteMany({ to: userId });

        return res.status(200).json({ message: "Notifications deleted successfully", deletedCount: result.deletedCount });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

const deleteNotification = async (req,res) => {
    try{
        const notificationId = req.params.id ;
        const userId = req.user._id
        const notification  = await Notification.findById(notificationId)
        if(!notification){
            return res.status(404).json({error : "Notification was not found!"})
        }
        if(notification.to.toString()!==userId.toString()){
            return res.status(403).json({error : "You cannot delete this notification"})
        }
        await Notification.findByIdAndDelete(notificationId)
        return res.status(200).json({message : "Notifcation was deleted Sucessfully"})
    }
    catch(error){
        res.status(500).json({error : "Internal Sever Error" })
    }
}

export {
    getNotifications,
    deleteNotifications,
    deleteNotification
};