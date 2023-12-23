import { NavLink } from "react-router-dom";
import classes from "./Item.module.css";
export default function Item(props) {
  const doc = props.doc;
  return (
    <li className={classes["list-item"]}>
      <NavLink to={`/document/${doc.documentId}`}>{doc.name}</NavLink>
    </li>
  );
}
