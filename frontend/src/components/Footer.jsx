import React, { useRef, useEffect, useState } from 'react';
import { MdFileUpload } from 'react-icons/md';
import axios from 'axios';
import API from'../config';

const Footer = ({ fetchData }) => {
  const fileInputRef = useRef();

  const handleClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const token = localStorage.getItem('authToken');
    if (!token) {
      alert('Please login to upload files');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post(API.UPLOAD, formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
      });
      
      alert('File uploaded successfully!');
      await fetchData(); 
    } catch (err) {
      console.error('Upload failed:', err);
      if (err.response?.status === 401) {
        alert('Session expired. Please login again.');
        window.location.reload();
      } else {
        alert('Upload failed');
      }
    }
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      <div
        onClick={handleClick}
        className="transition hover:scale-110 fixed bottom-5 right-5 bg-green-600 text-white p-4 rounded-full shadow-lg cursor-pointer hover:bg-green-700 z-50"
      >
        <MdFileUpload size={28} />
      </div>
    </>
  );
};

export default Footer;
