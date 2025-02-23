import React from "react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import {
  Bookmark,
  BookMarked,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Send,
  SendHorizonal,
  SendIcon,
  Share,
  Share2,
  Share2Icon,
  ShareIcon,
} from "lucide-react";
import { Button } from "./ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

const Post = () => {
  const [saved, setSaved] = useState(false);

  return (
    <TooltipProvider>
      <div className="my-8 w-full max-w-sm mx-auto flex flex-col items-center  ">
        <div className="flex w-full items-center justify-between ">
          <div className="flex w-full items-center space-x-2 ">
            <Avatar>
              <AvatarImage src="" alt="post_image" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <h1>Username</h1>
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
                className="cursor-pointer p-4 w-full h-full border-b border-gray-300"
              >
                Cancel
              </Button>
            </DialogContent>
          </Dialog>
        </div>

        <img
          className="w-full rounded-sm my-2 aspect-square object-cover"
          src="https://plus.unsplash.com/premium_photo-1690406382383-3827c1397c48?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="post_img"
        />

        <div className="w-full flex items-center justify-between">
          <div className="flex pt-3 pb-3 space-x-4">
            <Heart className="cursor-pointer" />
            <MessageCircle className="cursor-pointer" />
            <Send className="cursor-pointer" />
          </div>

          <div onClick={() => setSaved(!saved)}>
            <Bookmark
              className={`cursor-pointer transition-all duration-300 ${
                saved ? "text-black dark:text-white" : "text-black"
              }`}
              size={24}
              strokeWidth={saved ? 0 : 2} // Hide stroke when saved
              fill={saved ? "currentColor" : "none"} // Match text color (black/white)
            />{" "}
          </div>
        </div>

        <hr className="w-full border-t border-gray-300 my-4" />
      </div>
    </TooltipProvider>
  );
};

export default Post;
