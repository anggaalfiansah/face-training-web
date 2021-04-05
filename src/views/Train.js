/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import * as faces from "../api/faces";
import Webcam from "react-webcam";
import { Link } from "react-router-dom";
import Spinner from "./Loading/Spinner";
import "./styles.css";

export default function Train() {
  const dataFace = useSelector((state) => state.faceReducer.list);
  const webcam = React.useRef(null);
  const inputSize = 160;
  const [WIDTH] = useState(420);
  const [HEIGHT] = useState(420);
  const [detections, setdetections] = useState();
  const facingMode = useState("user");
  const [Count, setCount] = useState(0);
  const [ListFace, setListFace] = useState([]);
  const [Nama, setNama] = useState("");
  const [Loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetch = async () => {
      console.log(ListFace);
    };
    return fetch();
  }, [Count]);

  // Fungsi Untuk Mengcapture gambar dan memprosesnya secara berkala.
  const captured = async () => {
    setdetections();
    setLoading(true);
    await faces.loadModels();
    const capture = webcam.current.getScreenshot();
    if (!!capture) {
      faces
        .getFullFaceDescription(capture, inputSize)
        .then(async (fullDesc) => {
          if (!!fullDesc) {
            const desc = fullDesc.map((fd) => fd.descriptor);
            const detect = fullDesc.map((fd) => fd.detection);
            console.log(desc);
            console.log(detect);
            setdetections(detect);
            setLoading(false);
            if (desc.length === 0) {
              alert("Sample Wajah tidak terdeteksi");
            } else {
              const listFace = ListFace;
              listFace.push(desc[0]);
              setListFace(listFace);
              alert("Sample Wajah berhasil ditambahkan");
            }
          }
        })
        .then(() => {
          setCount(Count + 1);
          console.log(Count);
        });
    } else {
      setCount(Count + 1);
      console.log(Count);
      setLoading(false);
    }
  };

  const submit = () => {
    // Silahkan Atur Minimal Jumlah Sample Wajah
    if (ListFace.length < 5) {
      alert("Sample wajah minimal 5");
    } else {
      const listFace = dataFace;
      const Face = {
        name: Nama,
        descriptors: ListFace,
      };
      listFace.push(Face);
      console.log(listFace);
      dispatch({
        type: "Submit Face",
        value: listFace,
      });
      setListFace([]);
      window.ReactNativeWebView.postMessage(JSON.stringify(Face.descriptors));
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
          />
        </div>
      );
    });
  }

  const layout = () => {
    if (Loading === true) {
      return (
        <div
          className="my-auto mx-auto"
          style={{ position: "absolute", width: "100%", height: "100%" }}
        >
          <Spinner />
          <h4
            className="p-2 col-10 mx-auto rounded text-center"
            style={{ backgroundColor: "rgba(240, 240, 240, 0.5)" }}
          >
            Harap Tahan Posisi Sampai Proses Training Selesai
          </h4>
        </div>
      );
    }
  };

  return (
    <div
      className="body-custom"
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        className="border m-2 rounded"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <h1 className="my-2 p-2 text-white">DAFTARKAN WAJAH</h1>
        <div
          style={{
            width: WIDTH,
            height: HEIGHT,
          }}
        >
          <div style={{ position: "relative", width: WIDTH }}>
            {!!videoConstraints ? (
              <div style={{ position: "absolute" }}>
                {layout()}
                <Webcam
                  audio={false}
                  width={WIDTH}
                  height={HEIGHT}
                  ref={webcam}
                  screenshotFormat="image/jpeg"
                  screenshotQuality={0.8}
                  videoConstraints={videoConstraints}
                />
              </div>
            ) : null}
            {!!drawBox ? drawBox : null}
          </div>
        </div>
        <div className="row mt-3 col-10">
          <div className="col-6 mx-auto">
            <button
              className="btn btn-outline-success my-1 mx-auto col-12"
              onClick={captured}
            >
              Get Sample
            </button>
          </div>
        </div>
        <div className="row mt-1 col-10 p-2">
          <div className="mb-1 text-center">
            Sample Wajah : {ListFace.length}
          </div>
          <hr />
          <h6 className="small text-center">
            Jumlah Sample Minimal 5, lebih banyak lebih akurat
          </h6>
          <hr />
          <input
            type="text"
            id="nama-wajah"
            className="form-control text-center"
            placeholder="Masukan Nama"
            onChange={(e) => setNama(e.target.value)}
            required
            hidden
          />
          <Link
            to="/Test"
            className="col-md-5 btn btn-primary mx-auto mt-2"
            onClick={submit}
          >
            Submit
          </Link>
          <button
            className="col-md-5 btn btn-danger mx-auto my-2"
            onClick={() => {
              setListFace([]);
              setdetections();
              alert("Sample Wajah Berhasil Direset");
              setCount(Count + 1);
            }}
          >
            Reset Sample Wajah
          </button>
        </div>
      </div>
    </div>
  );
}
