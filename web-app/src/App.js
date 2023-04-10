import React, { useState } from "react";
import axios from "axios";

function App() {
  const [originalImage, setOriginalImage] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [originalImageName, setOriginalImageName] = useState(null);
  const [cartoonizedImage, setCartoonizedImage] = useState(null);

  const handleFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setOriginalImage(e.target.result);
      };
      reader.readAsDataURL(event.target.files[0]);
      setSelectedImage(event.target.files[0]);
      setOriginalImageName(event.target.files[0].name);
    }
  };
  
  const handleClick = async () => {
    const formData = new FormData();
    formData.append('image', selectedImage);
    await axios.request({
      method: 'POST',
      url: 'http://localhost:5000/api/cartoonize',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      withCredentials: true,
      responseType: 'arraybuffer',
    }).then((response) => {
      const base64 = btoa(
        new Uint8Array(response.data).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          '',
        ),
      );
      setCartoonizedImage(`data:image/jpeg;base64,${base64}`);
    }).catch((error) => {
      // console.log(error);
      window.alert(error.message);
    });
  };

  return (
    <div className="wrapper" >
      <div className="heading-wrapper">
        <h1 className="heading" >
          Cartoonize your Image
        </h1>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div className="card">
          <h2 className="heading-2">Upload Image</h2>
          <div className="upload-wrapper" 
            style={{
              width: "100%",
              textAlign: "center",
            }}
          >
            <label
              style={{
                cursor: "pointer",
                width: "100%",
              }} 
              onChange={handleFileChange} 
              htmlFor="formId"
            >
              <input type="file" id="formId" hidden/>
              <span 
                className="heading-3"
                style={{
                  width: '100%',
                  marginLeft: "10px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              > 
                <img
                  alt="upload"
                  src="https://icons-for-free.com/iconfiles/png/512/cloud+upload+file+storage+upload+icon-1320190558968694328.png"
                  className="upload-icon"
                  height={30}
                  width={30}
                  style={{ marginRight: "10px"}}
                />
                {
                  originalImageName === null ? 
                  "Choose a file" 
                  : originalImageName.length > 20 ?
                  originalImageName.substring(0, 20) + "..." + originalImageName.substring(originalImageName.length - 5, originalImageName.length)
                  : originalImageName}
              </span>
            </label>
          </div>

          <img 
            src={originalImage === null ? "/skeleton.jpg" : originalImage}
            alt="uploaded pic"
            className='card-image'
          />
        </div>

        <div className="card">
          <h2 className="heading-2">Cartoonized Image</h2>

          <img 
            src={cartoonizedImage === null ? "/skeleton.jpg" : cartoonizedImage}
            alt="uploaded pic"
            className='card-image'
            style={{ marginTop: "40px" }}
          />
        </div>
      </div>
      <div>
        <button 
          className="custom-button button-text"
          onClick={handleClick}
        >
          Cartoonize
        </button>
      </div>
    </div>    
  );
}

export default App;
