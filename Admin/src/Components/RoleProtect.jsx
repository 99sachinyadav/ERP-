import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const RoleProtect = ({ children, tokenKey, redirectTo }) => {
  const navigate = useNavigate();
  const roleToken = localStorage.getItem(tokenKey);
  const adminToken = localStorage.getItem("adminToken");

  useEffect(() => {
    if (!roleToken && !adminToken) {
      navigate(redirectTo);
    }
  }, [roleToken, adminToken, navigate, redirectTo]);

  return <div>{children}</div>;
};

export default RoleProtect;
