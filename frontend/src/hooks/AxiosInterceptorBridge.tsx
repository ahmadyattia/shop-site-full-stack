// interceptor for requests that return status 401 (unauthorized)
// logs the user out

import React, { useEffect, useRef } from "react";
import { api } from "../server/api";
import { useAuth } from "@/context/AuthContext";

export function AxiosInterceptorBridge({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();

  // Put the action function into a mutable ref container
  // use ref because without it there's a stale closure issue
  const logoutRef = useRef(logout);
  const userRef = useRef(user);

  // Keep the ref updated with the logout hook on every render
  logoutRef.current = logout;
  userRef.current = user;
  useEffect(() => {}, []);

  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        // log out on intercepting status 401
        if (error.response?.status === 401) {
          if (userRef.current) {
            logoutRef.current();
            alert("Your session has expired.");
          }
        }
        return Promise.reject(error);
      },
    );

    // Clean up interceptor if this component unmounts
    return () => api.interceptors.response.eject(interceptor);
  }, []);

  return <>{children}</>;
}
