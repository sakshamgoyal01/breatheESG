import {
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  motion,
} from "framer-motion";

import {
  useAuth,
} from "../context/AuthContext";

export default function Login() {

  const navigate =
    useNavigate();

  const { login } =
    useAuth();

  const [username, setUsername] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [error, setError] =
    useState("");

  const handleSubmit = async (
    e
  ) => {

    e.preventDefault();

    try {

      const response =
        await login(
          username,
          password
        );

      // Role-based redirect
      if (
        response.user.role ===
        "CLIENT_UPLOADER"
      ) {

        navigate(
          "/client-dashboard"
        );

      } else if (
        response.user.role ===
        "ADMIN"
      ) {

        navigate(
          "/admin-dashboard"
        );

      } else {

        navigate(
          "/dashboard"
        );
      }

    } catch {

      setError(
        "Invalid credentials"
      );
    }
  };

  return (
    <div className="
      min-h-screen
      flex
      items-center
      justify-center
      bg-slate-950
    ">

      <motion.form
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}

        onSubmit={handleSubmit}

        className="
          bg-slate-900
          p-10
          rounded-2xl
          shadow-xl
          w-full
          max-w-md
          space-y-6
        "
      >

        <div>

          <h1 className="
            text-3xl
            font-bold
            text-white
          ">
            Breathe ESG
          </h1>

          <p className="
            text-slate-400
            mt-2
          ">
            Enterprise ESG Platform
          </p>

        </div>

        {error && (

          <p className="
            text-red-400
          ">
            {error}
          </p>
        )}

        <input
          type="text"
          placeholder="Username"

          value={username}

          onChange={(e) =>
            setUsername(
              e.target.value
            )
          }

          className="
            w-full
            p-3
            rounded-xl
            bg-slate-800
            border
            border-slate-700
            text-white
            outline-none
            focus:ring-2
            focus:ring-emerald-500
          "
        />

        <input
          type="password"
          placeholder="Password"

          value={password}

          onChange={(e) =>
            setPassword(
              e.target.value
            )
          }

          className="
            w-full
            p-3
            rounded-xl
            bg-slate-800
            border
            border-slate-700
            text-white
            outline-none
            focus:ring-2
            focus:ring-emerald-500
          "
        />

        <button
          type="submit"

          className="
            w-full
            bg-emerald-500
            hover:bg-emerald-600
            transition
            p-3
            rounded-xl
            font-semibold
            text-white
          "
        >
          Login
        </button>

      </motion.form>
    </div>
  );
}