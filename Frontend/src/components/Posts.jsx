import React from "react";
import Post from "./Post";

const Posts = () => {
  return (
    <div className="w-96 flex flex-col justify-between">
      {[1, 2, 3].map((item, index) =>
        <Post key={index} />
      )}
    </div>
  );
};

export default Posts;
