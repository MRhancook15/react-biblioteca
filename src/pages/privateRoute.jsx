import { Route, Navigate } from "react-router-dom";

function PrivateRoute({ element, authenticated, ...rest }) {
  return authenticated ? (
    <Route {...rest} element={element} />
  ) : (
    <Navigate to="/" replace />
  );
}

export default PrivateRoute;
