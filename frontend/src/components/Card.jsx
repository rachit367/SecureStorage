import React, { useState, useEffect } from 'react';
import { FaRegFileAlt } from "react-icons/fa";
import { MdOutlineFileDownload } from "react-icons/md";
import { MdDeleteForever } from "react-icons/md";
import { motion } from "framer-motion";
import axios from 'axios';
import API from "../config";

const tagColorMap = {
  green: 'bg-green-600 hover:bg-green-700',
  red: 'bg-red-600 hover:bg-red-700',
  blue: 'bg-blue-600 hover:bg-blue-700',
  yellow: 'bg-yellow-600 hover:bg-yellow-700',
};

const Card = ({ data, reference, setData }) => {
  const { name, downloadUrl, _id } = data;
  const [randomTagColor, setRandomTagColor] = useState('green');

  useEffect(() => {
    const colors = Object.keys(tagColorMap);
    const random = colors[Math.floor(Math.random() * colors.length)];
    setRandomTagColor(random);
  }, []);

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this file?");
    if (!confirmed) return;

    const token = localStorage.getItem('authToken');
    if (!token) {
      alert('Please login to delete files');
      return;
    }

    try {
      await axios.delete(`${API.DELETE}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setData((prev) => prev.filter((item) => item._id !== id));
      alert("File deleted successfully!");
    } catch (err) {
      console.error("Delete failed", err);
      if (err.response?.status === 401) {
        alert('Session expired. Please login again.');
        window.location.reload();
      } else {
        alert('Delete failed');
      }
    }
  };

  return (
    <motion.div
      drag
      dragConstraints={reference}
      whileDrag={{ scale: 1.1 }}
      dragTransition={{
        bounceStiffness: 600,
        bounceDamping: 30,
        power: 0.1,
        timeConstant: 50,
      }}
      className="card z-10 w-60 h-72 relative bg-zinc-900/90 text-white rounded-[40px] px-8 py-10 overflow-hidden flex-shrink-0"
    >
      <div>
        <FaRegFileAlt size={24} />
      </div>

      <p className="text-sm leading-tight mt-5 font-semibold">{name}</p>

      <div className="footer absolute bottom-0 left-0 w-full">
        <div className="flex items-center justify-between mb-3">

          {/* DOWNLOAD */}
          <a
            href={downloadUrl}
            className="relative group ml-5"
          >
            <MdOutlineFileDownload
              size="1.2em"
              className="text-white hover:text-gray-500 transition-transform duration-200 cursor-pointer hover:scale-150"
            />
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 text-xs bg-black text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
              Download
            </span>
          </a>

          {/* DELETE */}
          <div className="relative group mr-4">
            <MdDeleteForever
              onClick={() => handleDelete(_id)}
              size="1.2em"
              className="text-white hover:text-gray-500 transition-transform duration-200 cursor-pointer hover:scale-150"
            />
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 text-xs bg-black text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
              Delete
            </span>
          </div>

        </div>

        <div
          className={`tag w-full flex items-center justify-center py-4 transition-colors duration-300 ${
            tagColorMap[randomTagColor] || 'bg-gray-600 hover:bg-gray-700'
          }`}
        >
          <h1 className="text-sm font-semibold">Read Me</h1>
        </div>
      </div>
    </motion.div>
  );
};

export default Card;
