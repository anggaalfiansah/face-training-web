/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import * as faces from "../api/faces2";
import Webcam from "react-webcam";
import MODAL from "react-modal";
import axios from "axios";
import "./styles.css";

export default function CheckOut() {
  const webcam = React.useRef(null);
  const inputSize = 160;
  const [WIDTH] = useState(512);
  const [HEIGHT] = useState(512);
  const [detections, setdetections] = useState();
  const [faceMatcher, setfaceMatcher] = useState();
  const [match, setmatch] = useState();
  const [facingMode, setfacingmode] = useState("user");
  const [Count, setCount] = useState(0);
  const [Modal, setModal] = useState(false);
  const [Response, setResponse] = useState({
    message: "Anda tidak punya akses",
  });
  const url = "https://services-tugas-akhir-jc.herokuapp.com";

  useEffect(() => {
    const fetch = async () => {
      await setInputDevice();
      await getfaceData();
      if (!!faceMatcher) {
        captured();
      } else {
        setCount(Count + 1);
        console.log(Count);
      }
    };
    return fetch();
  }, [Count]);

  const getfaceData = async () => {
    const response = await axios.get(`${url}/Face`);
    console.log(response);
    setfaceMatcher(await faces.createMatcher(response.data.data));
  };

  //   Fungsi Untuk Menentukan Camera
  const setInputDevice = () => {
    navigator.mediaDevices.enumerateDevices().then(async (devices) => {
      let inputDevice = await devices.filter(
        (device) => device.kind === "videoinput"
      );
      if (inputDevice.length < 2) {
        await setfacingmode("user");
      }
    });
  };

  // Fungsi Untuk Mengcapture gambar dan memprosesnya secara berkala.
  const captured = async () => {
    await setmatch();
    await setdetections();
    await faces.loadModels();
    try {
      const capture = webcam.current.getScreenshot();
      if (!!capture) {
        faces
          .getFullFaceDescription(capture, inputSize)
          .then(async (fullDesc) => {
            if (!!fullDesc) {
              const desc = fullDesc.map((fd) => fd.descriptor);
              const detect = fullDesc.map((fd) => fd.detection);
              console.log(desc);
              if (!!desc && !!faceMatcher) {
                setdetections(detect);
                const match = await desc.map((descriptor) =>
                  faceMatcher.findBestMatch(descriptor)
                );
                setmatch(match);
                console.log(detect);
                console.log(match);
                if (match.length > 0) {
                  console.log(match[0]._label.split("+")[0]);
                  CheckOut(match[0]._label.split("+")[0]);
                } else {
                  setCount(Count + 1);
                  console.log(Count);
                }
              } else {
                setCount(Count + 1);
                console.log(Count);
              }
            }
          });
      } else {
        setCount(Count + 1);
        console.log(Count);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const CheckOut = async (UserID) => {
    const time = new Date();
    const Tanggal = ("0" + time.getDate()).slice(-2);
    const bulan = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];
    const Bulan = bulan[time.getMonth()];
    const Tahun = time.getFullYear();
    const CheckOut = time.toString().substr(16, 5);

    const data = {
      UserID,
      Tanggal,
      Bulan,
      Tahun,
      CheckOut,
    };
    console.log(data);
    try {
      const checkin = await axios.put(`${url}/attendance/CheckOut`, data);
      console.log(checkin);
      setResponse(checkin.data);
      setModal(true);
      setTimeout(() => {
        setModal(false);
        setCount(Count + 1);
        console.log(Count);
      }, 5000);
    } catch (err) {
      console.log(err.message);
      setResponse({ message: "Anda tidak punya akses" });
      setModal(true);
      setTimeout(() => {
        setModal(false);
        setCount(Count + 1);
        console.log(Count);
      }, 5000);
    }
  };

  let videoConstraints = null;
  if (!!facingMode) {
    videoConstraints = {
      width: WIDTH,
      height: HEIGHT,
      facingMode: facingMode,
    };
  }

  let drawBox = null;
  if (!!detections) {
    drawBox = detections.map((detection, i) => {
      let _H = detection.box.height;
      let _W = detection.box.width;
      let _X = detection.box._x;
      let _Y = detection.box._y;
      return (
        <div key={i}>
          <div
            style={{
              position: "absolute",
              border: "solid",
              borderColor: "blue",
              height: _H,
              width: _W,
              transform: `translate(${_X}px,${_Y}px)`,
            }}
          >
            {!!match && !!match[i] ? (
              <p
                className="text-center"
                style={{
                  backgroundColor: "blue",
                  border: "solid",
                  borderColor: "blue",
                  width: _W,
                  marginTop: 0,
                  color: "#fff",
                  transform: `translate(-3px,${_H}px)`,
                }}
              >
                {match[i]._label.split("+")[1]}
              </p>
            ) : null}
          </div>
        </div>
      );
    });
  }

  return (
    <div
      className="body-custom"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <h1 className="text-center text-white">FACE RECOGNITION CHECK OUT</h1>
      <div className="border border-color p-2">
        <div
          style={{
            width: WIDTH,
            height: HEIGHT,
          }}
        >
          <div style={{ position: "relative", width: WIDTH }}>
            {!!videoConstraints ? (
              <div style={{ position: "absolute" }}>
                <Webcam
                  audio={false}
                  width={WIDTH}
                  height={HEIGHT}
                  ref={webcam}
                  screenshotFormat="image/jpeg"
                  screenshotQuality={0.9}
                  videoConstraints={videoConstraints}
                />
              </div>
            ) : null}
            {!!drawBox ? drawBox : null}
          </div>
        </div>
      </div>
      <MODAL isOpen={Modal} ariaHideApp={false} style={customStyles}>
        <h2>{Response.message}</h2>
      </MODAL>
    </div>
  );
}

const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
  },
};
