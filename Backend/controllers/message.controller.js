import { Conversation } from "../models/conversation.model.js";
import { Message } from "../models/message.model.js";

export const sendMessage = async (req, res) => {
    try {
        const senderId = req.id;
        const receiverId = req.params.id;
        const { message } = req.body;

        let conversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] } // Check if both users are in the conversation
        });

        if (!conversation){
            conversation = await Conversation.create({
                participants: [senderId, receiverId], // Store both user IDs as participants
            });
        }

        const newMessage = await Message.create({
            senderId,
            receiverId,
            message,
        });

        if (newMessage){
            conversation.messages.push(newMessage._id);
        }

        await Promise.all([newMessage.save(), conversation.save()]);

        return res.status(201).json({ newMessage, success: true, });

    } catch (error) {
        console.error('Error in sendMessage:', error);
        return res.status(500).json({ message: 'Internal Server Error', success: false, });
    }
};


export const getMessage = async (req, res) => {
    try {
        const senderId = req.id;
        const receiverId = req.params.id;

        const conversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] },
        })
        if (!conversation){
            return res.status(200).json({ messages: [], success: true, });
        }
        return res.status(200).json({ messages: conversation?.messages, success: true, });
        
    } catch (error) {
        console.error('Error in getMessage:', error);
        return res.status(500).json({ message: 'Internal Server Error', success });        
    }
};