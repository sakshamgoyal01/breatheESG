import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  loginUser,
  getCurrentUser,
} from "../api/auth";

const AuthContext =
  createContext();

export const AuthProvider = ({
  children,
}) => {

  const [user, setUser] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    const token =
      localStorage.getItem(
        "access_token"
      );

    if (token) {

      getCurrentUser()

        .then((currentUser) => {

          setUser(
            currentUser
          );
        })

        .catch(() => {

          logout();
        })

        .finally(() => {

          setLoading(false);
        });

    } else {

      setLoading(false);
    }

  }, []);

  const login = async (
    username,
    password
  ) => {

    const data =
      await loginUser(
        username,
        password
      );

    // STORE TOKENS

    localStorage.setItem(
      "access_token",
      data.access
    );

    localStorage.setItem(
      "refresh_token",
      data.refresh
    );

    // FETCH USER

    const currentUser =
      await getCurrentUser();

    setUser(currentUser);

    return {
      user: currentUser,
    };
  };

  const logout = () => {

    localStorage.removeItem(
      "access_token"
    );

    localStorage.removeItem(
      "refresh_token"
    );

    setUser(null);
  };

  return (

    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        loading,
      }}
    >

      {children}

    </AuthContext.Provider>
  );
};

export const useAuth = () =>
  useContext(AuthContext);