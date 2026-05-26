import {
  LayoutDashboard,
  Upload,
  ClipboardList,
  LogOut,
  Building2,
  Shield,
  BarChart3,
  Users,
} from "lucide-react";

import {
  Link,
  useLocation,
} from "react-router-dom";

import {
  useAuth,
} from "../../context/AuthContext";

export default function Sidebar() {

  const location =
    useLocation();

  const {
    logout,
    user,
  } = useAuth();

  const role =
    user?.role;

  let navItems = [];

  // CLIENT USER

  if (
    role ===
    "CLIENT_UPLOADER"
  ) {

    navItems = [

      {
        name: "Dashboard",
        icon: LayoutDashboard,
        path:
          "/client-dashboard",
      },

      {
        name: "Upload ESG Data",
        icon: Upload,
        path: "/upload",
      },
    ];
  }

  // ANALYST USER

  else if (
    role ===
    "ANALYST"
  ) {

    navItems = [

      {
        name: "Portfolio",
        icon: LayoutDashboard,
        path: "/dashboard",
      },

      {
        name: "Companies",
        icon: Building2,
        path: "/companies",
      },

      {
        name: "Upload Data",
        icon: Upload,
        path: "/upload",
      },

      {
        name: "Review Queue",
        icon: ClipboardList,
        path: "/reviews",
      },
    ];
  }

  // ADMIN USER

  else if (
    role ===
    "ADMIN"
  ) {

    navItems = [

  {
    name:
      "Platform Overview",

    icon: Shield,

    path:
      "/admin-dashboard",
  },

  {
    name: "Companies",
    icon: Building2,
    path: "/companies",
  },

  {
    name: "Users",
    icon: Users,
    path: "/users",
  },

  {
    name:
      "Ingestion Health",

    icon: BarChart3,

    path:
      "/ingestion-health",
  },

  {
    name:
      "Review Queue",

    icon:
      ClipboardList,

    path:
      "/reviews",
  },

    ];
  }

  return (
    <div className="
      w-72
      bg-slate-900
      border-r
      border-slate-800
      flex
      flex-col
      justify-between
      p-6
    ">

      {/* TOP SECTION */}

      <div>

        <div className="
          mb-10
        ">

          <h1 className="
            text-3xl
            font-bold
            tracking-tight
          ">
            Breathe ESG
          </h1>

          <p className="
            text-slate-400
            text-sm
            mt-1
          ">
            Enterprise ESG Platform
          </p>

        </div>

        {/* USER INFO */}

        <div className="
          bg-slate-800
          rounded-2xl
          p-4
          mb-8
        ">

          <p className="
            text-sm
            text-slate-400
          ">
            Logged in as
          </p>

          <h2 className="
            text-lg
            font-semibold
            mt-1
          ">
            {user?.username}
          </h2>

          <p className="
            text-emerald-400
            text-sm
            mt-1
          ">
            {role}
          </p>

        </div>

        {/* NAVIGATION */}

        <div className="
          space-y-2
        ">

          {navItems.map((item) => {

            const Icon =
              item.icon;

            const active =
              location.pathname ===
              item.path;

            return (

              <Link
                key={item.path}

                to={item.path}

                className={`
                  flex
                  items-center
                  gap-3
                  p-3
                  rounded-xl
                  transition-all

                  ${
                    active

                      ? `
                        bg-emerald-500
                        text-white
                        shadow-lg
                      `

                      : `
                        hover:bg-slate-800
                        text-slate-300
                      `
                  }
                `}
              >

                <Icon size={20} />

                <span className="
                  font-medium
                ">
                  {item.name}
                </span>

              </Link>
            );
          })}

        </div>

      </div>

      {/* LOGOUT */}

      <button
        onClick={logout}

        className="
          flex
          items-center
          gap-3
          p-3
          rounded-xl
          bg-slate-800
          hover:bg-red-500
          transition-all
        "
      >

        <LogOut size={20} />

        Logout

      </button>

    </div>
  );
}