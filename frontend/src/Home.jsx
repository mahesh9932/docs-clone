import Button from "@mui/material/Button";
import classes from "./Home.module.css";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { useEffect, useState } from "react";
import axios from "axios";
import ItemList from "./components/ItemList";
import { useAuth0 } from "@auth0/auth0-react";

export default function Home() {
  const { user, logout } = useAuth0();

  console.log("user", user);
  const navigate = useNavigate();
  const clickHandler = () => {
    navigate(`/document/${uuidv4()}`);
  };

  const [docsList, setDocsList] = useState([]);

  console.log(docsList);

  //   getting and setting the docs list
  useEffect(() => {
    const getDocs = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/docs`,
          {
            headers: {
              email: user.email,
            },
          }
        );
        setDocsList(res.data.docs);
      } catch (e) {
        console.log("error while getting the documents", e);
      }
    };

    getDocs();
  }, []);

  return (
    <>
      <div className={classes.container}>
        <Button variant="contained" onClick={clickHandler}>
          Add New Doc
        </Button>
      </div>
      <ItemList docs={docsList} setDocsList={setDocsList} />
    </>
  );
}
