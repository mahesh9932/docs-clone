import { useAuth0 } from "@auth0/auth0-react";
import classes from "./RootLayout.module.css";
import { Button, TextField, Typography } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import Modal from "@mui/material/Modal";
import { IoIosClose } from "react-icons/io";
import axios from "axios";
import emailjs from "@emailjs/browser";

const RootLayout = (props) => {
  const { user, isLoading, logout } = useAuth0();
  const [isModalOpen, setIsModelOpen] = useState(false);
  const [val, setVal] = useState("");

  // console.log("user", user);

  const location = useLocation();
  console.log(
    "location",
    location,
    location.pathname.split("/")[location.pathname.split("/").length - 1]
  );
  const navigate = useNavigate();

  const shareHandler = () => {
    setIsModelOpen(true);
  };

  const addHandler = async () => {
    if (val) {
      const locArray = location.pathname.split("/");
      try {
        const res = await axios.put(
          `${import.meta.env.VITE_BACKEND_URL}/addUser/${
            locArray[locArray.length - 1]
          }`,
          {},
          {
            headers: {
              email: user.email,
              newemail: val,
            },
          }
        );

        const templateParams = {
          from_name: user.name || "Docs",
          link: "http://127.0.0.1:5173" + location.pathname,
          to_email: val,
        };

        console.log("template params", templateParams);

        // sending an email
        await emailjs.send(
          "service_wfypcv8",
          "template_610jeqt",
          templateParams,
          "l9R31boyuhccq7uWc"
        );

        console.log("succesfully sent an email");
      } catch (e) {
        console.log("error while addin user", e);
      }
    }
    setIsModelOpen(false);
  };

  const clickHandler = () => {
    logout();
  };
  if (isLoading) {
    return <></>;
  }

  const homeHandler = () => {
    navigate("/");
  };
  return (
    <div>
      <Modal open={isModalOpen} onClose={() => setIsModelOpen(false)}>
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              background: "white",
              width: "90%",
              borderRadius: "2rem",
              padding: "4rem",
              margin: "1rem",
              color: "white",
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              justifyContent: "center",
              alignItems: "center",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                right: "10px",
                top: "0px",
                cursor: "pointer",
              }}
            >
              <IoIosClose
                color="black"
                size={"40px"}
                onClick={() => setIsModelOpen(false)}
              />
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <TextField
                label="Email"
                variant="standard"
                fullWidth
                value={val}
                onChange={(e) => setVal(e.target.value)}
              />
              <Button variant="contained" onClick={addHandler}>
                Send Link
              </Button>
            </div>
          </div>
        </div>
      </Modal>
      <div
        style={{
          padding: "20px 10px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "4px",
            alignItems: "center",
            cursor: "pointer",
          }}
          onClick={homeHandler}
        >
          <div className={classes.logo}>
            <img width={"100%"} src="/logo.png" alt="Home Icon" />
          </div>
          <h2>Docs</h2>
        </div>
        {/* <div
          style={{
            position: "relative",
          }}
        >
          <div className={classes.logo}>
            <img
              width={"100%"}
              src={(user && user.picture) || "/profile-user.png"}
              alt="profile picture"
            />
          </div>
          <div className={classes.dropdown}>Logout</div>
        </div> */}
        <div>
          {location.pathname.indexOf("document") != -1 && (
            <Button
              variant="contained"
              onClick={shareHandler}
              sx={{
                marginRight: "20px",
              }}
            >
              Share
            </Button>
          )}

          <Button variant="contained" onClick={clickHandler}>
            Logout
          </Button>
        </div>
      </div>
      {props.children}
    </div>
  );
};
export default RootLayout;
