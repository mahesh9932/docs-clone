import { useAuth0 } from "@auth0/auth0-react";
import { useEffect } from "react";

const Auth = () => {
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      loginWithRedirect();
    }
  }, [isLoading, isAuthenticated, loginWithRedirect]);

  return <></>;
};
export default Auth;
