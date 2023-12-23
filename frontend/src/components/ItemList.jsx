import { useAuth0 } from "@auth0/auth0-react";
import Item from "./Item";
import { Button } from "@mui/material";
import axios from "axios";

export default function ItemList(props) {
  console.log(props);
  const { user } = useAuth0();

  const deleteHandler = async (documentId) => {
    console.log("documentId in delete handler", documentId);
    try {
      const res = await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/${documentId}`,
        {
          headers: {
            email: user.email,
          },
        }
      );
      props.setDocsList((prevVal) => {
        return prevVal.filter((item) => item.documentId != documentId);
      });
    } catch (e) {
      console.log("error while getting the documents", e);
    }
  };

  return (
    <div style={{ maxWidth: "700px", margin: "auto" }}>
      <ul style={{ listStyle: "none" }}>
        {props.docs.map((doc) => (
          <div
            key={doc.documentId}
            style={{ display: "flex", marginBottom: "10px" }}
          >
            <Item doc={doc} />
            <Button
              variant="contained"
              onClick={deleteHandler.bind(this, doc.documentId)}
              sx={{ flexBasis: "30px" }}
            >
              Delete
            </Button>
          </div>
        ))}
      </ul>
    </div>
  );
}
