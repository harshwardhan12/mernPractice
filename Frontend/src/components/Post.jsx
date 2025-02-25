import React, { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import {
  Bookmark,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Send,
} from "lucide-react";
import { Button } from "./ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";

const Post = () => {
  const [saved, setSaved] = useState(false);
  const [liked, setLiked] = useState(false);
  const [showBigHeart, setShowBigHeart] = useState(false);

  const [comment, setComment] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [comment]);

  // Handles double-tap like
  const handleDoubleTap = () => {
    setLiked(true);
    setShowBigHeart(true);

    // Hide big heart after 1 second
    setTimeout(() => setShowBigHeart(false), 1000);
  };

  const handleChange = (e) => {
    setComment(e.target.value);
    setIsEditing(e.target.value.length > 0);
  };

  return (
    <TooltipProvider>
      <div className="my-8 w-full max-w-sm mx-auto flex flex-col items-center relative">
        <div className="Dialog flex w-full items-center justify-between">
          <div className="Avatar flex w-full items-center space-x-2">
            <Avatar className="cursor-pointer">
              <AvatarImage src="" alt="post_image" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <h1 className="cursor-pointer">Username</h1>
          </div>

          <Dialog>
            <Tooltip>
              <TooltipTrigger asChild>
                <DialogTrigger>
                  <MoreHorizontal className="cursor-pointer" />
                </DialogTrigger>
              </TooltipTrigger>
              <TooltipContent>More Options</TooltipContent>
            </Tooltip>

            <DialogContent className="flex flex-col gap-0 justify-center p-0 rounded-xl">
              <Button
                variant="ghost"
                className="cursor-pointer p-4 w-full h-full border-b border-gray-300 rounded-none text-[#ED4956] font-bold hover:text-[#ED4956]"
              >
                Unfollow
              </Button>
              <Button
                variant="ghost"
                className="cursor-pointer p-4 w-full h-full border-b border-gray-300 rounded-none"
              >
                Add to favorites
              </Button>
              <Button
                variant="ghost"
                className="cursor-pointer p-4 w-full h-full border-b border-gray-300 rounded-none"
              >
                Cancel
              </Button>
            </DialogContent>
          </Dialog>
        </div>

        {/* Double Tap Like */}
        <div className="LikeAnimation relative w-full">
          <img
            onDoubleClick={handleDoubleTap}
            className="w-full rounded-sm mt-2 aspect-square object-cover"
            src="https://plus.unsplash.com/premium_photo-1690406382383-3827c1397c48?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="post_img"
          />

          {/* Big Animated Heart on Double Tap */}
          <AnimatePresence>
            {showBigHeart && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1.5 }}
                exit={{ opacity: 0, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <Heart
                  className="text-red-500"
                  size={100}
                  strokeWidth={0}
                  fill="currentColor"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="Main-Container w-full flex items-center justify-between">
          <div className="Icon-Container flex pt-3 pb-3 space-x-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <div onClick={() => setLiked(!liked)}>
                  <Heart
                    className={`Heart cursor-pointer transition-colors ${
                      liked
                        ? "text-red-500"
                        : "hover:text-gray-600 dark:hover:text-gray-400"
                    }`}
                    size={24}
                    strokeWidth={liked ? 0 : 2}
                    fill={liked ? "currentColor" : "none"}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>{liked ? "Unlike" : "Like"}</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <MessageCircle className="Message cursor-pointer hover:text-gray-600 dark:hover:text-gray-400" />
              </TooltipTrigger>
              <TooltipContent>Comment</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Send className="Send rotate-[20deg] cursor-pointer hover:text-gray-600 dark:hover:text-gray-400" />
              </TooltipTrigger>
              <TooltipContent>Share</TooltipContent>
            </Tooltip>
          </div>

          <Tooltip>
            <TooltipTrigger asChild>
              <div className="Bookmark" onClick={() => setSaved(!saved)}>
                <Bookmark
                  className={`cursor-pointer transition-all duration-300 ${
                    saved
                      ? "text-black dark:text-white"
                      : "hover:text-gray-600 dark:hover:text-gray-400"
                  }`}
                  size={24}
                  strokeWidth={saved ? 0 : 2}
                  fill={saved ? "currentColor" : "none"}
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>{saved ? "Remove" : "Save"}</TooltipContent>
          </Tooltip>
        </div>

        <div className="w-full flex flex-col">
          <span className="NumberOfLikes w-full font-medium block mb-2">
            1k likes
          </span>
          <p className="Caption w-full">
            <span className="font-medium mr-2 cursor-pointer">username</span>
            caption
          </p>
          <span className="text-gray-500 dark:text-gray-800 cursor-pointer">
            View all 10 comments
          </span>

          <div className={"flex items-center justify-between"}>
            <textarea
              ref={textareaRef}
              value={comment}
              onChange={handleChange}
              className="w-full placeholder-gray-500 bg-transparent outline-none resize-none"
              placeholder="Add a comment..."
              rows={1} // Initially one line
              style={{ minHeight: "1.5rem", maxHeight: "6rem", width: "100%" }} // Adjust height dynamically
            />
            {isEditing && (
              <button className="ml-2 text-blue-500 font-bold">Post</button>
            )}
          </div>
        </div>

        {/* Line Between Posts */}
        <hr className="w-full border-t border-gray-300 dark:border-gray-300 my-4" />
      </div>
    </TooltipProvider>
  );
};

export default Post;
