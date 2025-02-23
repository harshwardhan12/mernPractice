import axios from "axios";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
// import { Avatar } from "@radix-ui/react-avatar";
import {
  Heart,
  Home,
  LogOut,
  MessageCircleMore,
  PlusSquareIcon,
  Search,
  TrendingUp,
} from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer, Bounce } from "react-toastify";

const sideBarItems = [
  { icon: <Home size={30}/>, text: "Home" },
  { icon: <Search size={30}/>, text: "Search" },
  { icon: <TrendingUp size={30}/>, text: "Explore" },
  { icon: <MessageCircleMore size={30}/>, text: "Messages" },
  { icon: <Heart size={30}/>, text: "Notifications" },
  { icon: <PlusSquareIcon size={30}/>, text: "Create" },
  {
    icon: (
      <Avatar className="w-8 h-8">
        <AvatarImage src="https://github.com/shadcn.png" />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
    ),
    text: "Profile",
  },
  { icon: <LogOut size={30}/>, text: "Logout" },
];

const LeftSideBar = () => {
    
    const navigate = useNavigate();

    const logoutHandler = async () => {
        try {
            const res = await axios.get("http://localhost:8000/api/v1/user/logout", {withCredentials: true});
            if(res.data.success) {
                console.log("logged out");
                toast.success(res.data.message);
                setTimeout(() => {
                    navigate("/login");
                }, 1500);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || "Logout failed!");
        }
    }
    const sideBarHandler = (text) => {
        if(text === "Logout") {
            logoutHandler();
        }
    }
    
  return (
    <div className="fixed flex flex-col p-6  z-10 border-r border-gray-300 w-[16%] h-screen ">
      <div className="mt-3 p-3">
        <h1 className="font-bold text-3xl">Instagram</h1>
      </div>

      <div className="flex flex-col gap-6 mt-10">
        {sideBarItems.map((item, index) => {
          return (
            <div onClick={() => sideBarHandler(item.text)} className="flex items-center relative p-3 gap-3 hover:bg-gray-100 cursor-pointer rounded-lg" key={index}>
                {item.icon}
              <span className="text-xl">{item.text}</span>
            </div>
          );
        })}
      </div>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        transition={Bounce}
      />
    </div>
    
  );
};

export default LeftSideBar;
