import { useEffect, useRef, useState } from "react";
import ReactQuill, { Quill } from "react-quill";
import { useParams } from "react-router-dom";
import axios from "axios";
import "react-quill/dist/quill.snow.css";
import "./App.css";

import { io } from "socket.io-client";
import { Button, TextField } from "@mui/material";
import { useAuth0 } from "@auth0/auth0-react";

function App() {
  const params = useParams();

  const documentId = params.id;
  const quill = useRef();

  const [socket, setSocket] = useState();
  const [loading, setIsLoading] = useState(true);
  const [name, setName] = useState("");
  const { user, isAuthenticated, isLoading } = useAuth0();

  if (isLoading) {
    return <></>;
  }

  //intializing the socket
  useEffect(() => {
    const socket = io(import.meta.env.VITE_BACKEND_URL);
    setSocket(socket);
    socket.emit("join-room", documentId);
    return () => socket.disconnect();
  }, []);

  // creating a doc in the database
  useEffect(() => {
    console.log("creating a doc");
    const createDoc = async () => {
      try {
        const res = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/create/${documentId}`,
          { email: user && user.email },
          {
            headers: {
              email: user && user.email,
            },
          }
        );
        console.log(res.data);
      } catch (e) {
        console.log("error while creating the document", e);
      }
    };
    createDoc();
  }, []);

  useEffect(() => {
    if (loading) {
      return;
    }
    const getFileName = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/doc/name/${documentId}`,
          {
            headers: {
              email: user.email,
            },
          }
        );
        if (res.data) {
          setName(res.data.fileName);
        }
      } catch (e) {
        console.log("error", e);
      }
    };

    getFileName();
  }, [loading]);

  // setting the loading state to loading ....
  useEffect(() => {
    if (!quill?.current) return;
    if (loading) {
      quill.current.getEditor().setText("Loading...");
    }
  }, [quill, loading]);

  // getting the data from the server on intial render
  useEffect(() => {
    if (!quill) return;
    const getContents = async () => {
      console.log("inside the get contents");
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/contents/${documentId}`,
          {
            headers: {
              email: user.email,
            },
          }
        );
        console.log("response in getcontents", res);
        setIsLoading(false);
        quill.current.getEditor().setText(res.data.content);
      } catch (e) {
        console.log("error while getting the contents of document", e);
      }
    };
    getContents();
  }, [quill]);

  // auto save after the intial load
  useEffect(() => {
    if (loading) {
      return;
    }
    // saving to database for every milliseconds mentioned in the env file
    const saveDoc = async () => {
      try {
        // console.log("calling to save");
        const res = await axios.put(
          `${import.meta.env.VITE_BACKEND_URL}/update/${documentId}`,
          { content: quill.current.getEditor().getText() },
          {
            headers: {
              email: user.email,
            },
          }
        );
        // console.log(res.data);
      } catch (e) {
        console.log("error while creating the document", e);
      }
    };

    const timer = setInterval(() => {
      saveDoc();
    }, import.meta.env.VITE_TIME_TO_SAVE); //

    return () => {
      clearInterval(timer);
    };
  }, [loading]);

  useEffect(() => {
    if (socket == null || quill == null) return;
    socket.on("connect", () => {
      console.log("connected", socket.id);
      socket.on("recieve-change", (delta) => {
        console.log("delta", delta);
        console.log("recieved change");
        quill.current.getEditor().updateContents(delta);
      });
    });
  }, [socket, quill]);

  const handleChange = (val, delta, source, editor) => {
    // console.log("text is", quill.current.getEditor().getText());
    if (source === "user") {
      socket.emit("send-change", delta, documentId);
    }
  };

  return (
    <div>
      <Header name={name} setName={setName} />
      <div>
        <ReactQuill ref={quill} theme="snow" onChange={handleChange} />
      </div>
    </div>
  );
}

function Header(props) {
  const params = useParams();
  const documentId = params.id;
  const { name, setName } = props;
  const [timer, setTimer] = useState(null);
  const { user } = useAuth0();

  const updateName = async (newVal) => {
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/doc/name/${documentId}`,
        {
          fileName: newVal,
        },
        {
          headers: {
            email: user.email,
          },
        }
      );
    } catch (e) {
      console.log("error", e);
    }
  };

  const changeHandler = async (event) => {
    const newVal = event.target.value;
    setName(newVal);
    if (timer) {
      clearTimeout(timer);
    }
    const timerId = setTimeout(() => {
      updateName(newVal);
    }, 500);
    setTimer(timerId);
  };

  return (
    <div className="header-container">
      {/* <h4>Header</h4> */}
      <TextField
        variant="standard"
        value={name}
        fullWidth
        onChange={changeHandler}
      />
      {/* <Button variant="contained">Save</Button> */}
    </div>
  );
}

export default App;
