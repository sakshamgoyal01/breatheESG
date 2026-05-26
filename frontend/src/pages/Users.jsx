import {
  useEffect,
  useState,
} from "react";

import Sidebar from
  "../components/layout/Sidebar";

import api from "../api/axios";

export default function Users() {

  const [users, setUsers] =
    useState([]);

  const [companies, setCompanies] =
    useState([]);

  const [showModal, setShowModal] =
    useState(false);

  const [editingUser, setEditingUser] =
    useState(null);

  const [newCompanyName,
    setNewCompanyName] =
      useState("");

  const [formData, setFormData] =
    useState({

      username: "",

      email: "",

      password: "",

      role: "CLIENT_UPLOADER",

      company_id: "",
    });

  useEffect(() => {

    fetchUsers();

    fetchCompanies();

  }, []);

  const fetchUsers =
    async () => {

      try {

        const response =
          await api.get(
            "/core/users/"
          );

        setUsers(
          response.data
        );

      } catch (error) {

        console.error(error);
      }
    };

  const fetchCompanies =
    async () => {

      try {

        const response =
          await api.get(
            "/core/companies/"
          );

        setCompanies(
          response.data
        );

      } catch (error) {

        console.error(error);
      }
    };

  const createCompany =
    async () => {

      if (!newCompanyName)
        return;

      try {

        await api.post(
          "/core/companies/create/",
          {
            name:
              newCompanyName,
          }
        );

        setNewCompanyName("");

        fetchCompanies();

      } catch (error) {

        console.error(error);
      }
    };

  const deleteUser =
    async (userId) => {

      const confirmed =
        window.confirm(
          "Delete this user?"
        );

      if (!confirmed) return;

      try {

        await api.delete(
          `/core/users/${userId}/`
        );

        fetchUsers();

      } catch (error) {

        console.error(error);
      }
    };

  const openCreateModal =
    () => {

      setEditingUser(null);

      setFormData({

        username: "",

        email: "",

        password: "",

        role: "CLIENT_UPLOADER",

        company_id: "",
      });

      setShowModal(true);
    };

  const openEditModal =
    (user) => {

      setEditingUser(user);

      setFormData({

        username:
          user.username,

        email:
          user.email,

        password: "",

        role:
          user.role,

        company_id:
          user.company_id || "",
      });

      setShowModal(true);
    };

  const handleSubmit =
    async (e) => {

      e.preventDefault();

      try {

        if (editingUser) {

          await api.patch(

            `/core/users/${editingUser.id}/`,

            formData
          );

        } else {

          await api.post(
            "/core/users/create/",
            formData
          );
        }

        setShowModal(false);

        fetchUsers();

      } catch (error) {

        console.error(error);
      }
    };

  return (
    <div className="
      flex
      min-h-screen
      bg-slate-950
      text-white
    ">

      <Sidebar />

      <div className="
        flex-1
        p-8
      ">

        <div className="
          flex
          justify-between
          items-center
          mb-10
        ">

          <div>

            <h1 className="
              text-4xl
              font-bold
            ">
              Platform Users
            </h1>

            <p className="
              text-slate-400
              mt-2
            ">
              Identity and
              access management
            </p>

          </div>

          <button
            onClick={
              openCreateModal
            }

            className="
              bg-emerald-500
              hover:bg-emerald-600
              px-5
              py-3
              rounded-xl
            "
          >
            Add User
          </button>

        </div>

        <div className="
          bg-slate-900
          rounded-2xl
          p-6
        ">

          <table className="
            w-full
          ">

            <thead>

              <tr className="
                text-left
                text-slate-400
              ">

                <th className="pb-4">
                  Username
                </th>

                <th className="pb-4">
                  Email
                </th>

                <th className="pb-4">
                  Role
                </th>

                <th className="pb-4">
                  Company
                </th>

                <th className="pb-4">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>

              {users.map((user) => (

                <tr
                  key={user.id}

                  className="
                    border-t
                    border-slate-800
                  "
                >

                  <td className="
                    py-4
                  ">
                    {user.username}
                  </td>

                  <td>
                    {user.email}
                  </td>

                  <td>

                    <RoleBadge
                      role={user.role}
                    />

                  </td>

                  <td>
                    {
                      user.company_name
                    }
                  </td>

                  <td className="
                    space-x-2
                  ">

                    <button
                      onClick={() =>
                        openEditModal(
                          user
                        )
                      }

                      className="
                        bg-blue-500
                        hover:bg-blue-600
                        px-3
                        py-1
                        rounded-lg
                      "
                    >
                      Edit
                    </button>

                    <button
                      onClick={() =>
                        deleteUser(
                          user.id
                        )
                      }

                      className="
                        bg-red-500
                        hover:bg-red-600
                        px-3
                        py-1
                        rounded-lg
                      "
                    >
                      Delete
                    </button>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

        {showModal && (

          <div className="
            fixed
            inset-0
            bg-black/60
            flex
            items-center
            justify-center
            z-50
          ">

            <div className="
              bg-slate-900
              rounded-2xl
              p-8
              w-full
              max-w-lg
            ">

              <h2 className="
                text-2xl
                font-bold
                mb-6
              ">

                {editingUser
                  ? "Edit User"
                  : "Create User"}

              </h2>

              <form
                onSubmit={
                  handleSubmit
                }

                className="
                  space-y-4
                "
              >

                <input
                  placeholder="Username"

                  value={
                    formData.username
                  }

                  disabled={
                    editingUser
                  }

                  onChange={(e) =>
                    setFormData({

                      ...formData,

                      username:
                        e.target.value,
                    })
                  }

                  className="
                    w-full
                    bg-slate-800
                    p-3
                    rounded-xl
                  "
                />

                <input
                  placeholder="Email"

                  value={
                    formData.email
                  }

                  onChange={(e) =>
                    setFormData({

                      ...formData,

                      email:
                        e.target.value,
                    })
                  }

                  className="
                    w-full
                    bg-slate-800
                    p-3
                    rounded-xl
                  "
                />

                <input
                  type="password"

                  placeholder="Password"

                  value={
                    formData.password
                  }

                  onChange={(e) =>
                    setFormData({

                      ...formData,

                      password:
                        e.target.value,
                    })
                  }

                  className="
                    w-full
                    bg-slate-800
                    p-3
                    rounded-xl
                  "
                />

                <select
                  value={
                    formData.role
                  }

                  onChange={(e) =>
                    setFormData({

                      ...formData,

                      role:
                        e.target.value,
                    })
                  }

                  className="
                    w-full
                    bg-slate-800
                    p-3
                    rounded-xl
                  "
                >

                  <option value="ADMIN">
                    ADMIN
                  </option>

                  <option value="ANALYST">
                    ANALYST
                  </option>

                  <option value="CLIENT_UPLOADER">
                    CLIENT_UPLOADER
                  </option>

                </select>

                <select
                  value={
                    formData.company_id
                  }

                  onChange={(e) =>
                    setFormData({

                      ...formData,

                      company_id:
                        e.target.value,
                    })
                  }

                  className="
                    w-full
                    bg-slate-800
                    p-3
                    rounded-xl
                  "
                >

                  <option value="">
                    Select Company
                  </option>

                  {companies.map((company) => (

                    <option
                      key={company.id}
                      value={company.id}
                    >
                      {company.name}
                    </option>

                  ))}

                </select>

                <div className="
                  flex
                  gap-2
                ">

                  <input
                    placeholder="New Company Name"

                    value={
                      newCompanyName
                    }

                    onChange={(e) =>
                      setNewCompanyName(
                        e.target.value
                      )
                    }

                    className="
                      flex-1
                      bg-slate-800
                      p-3
                      rounded-xl
                    "
                  />

                  <button
                    type="button"

                    onClick={
                      createCompany
                    }

                    className="
                      bg-emerald-500
                      hover:bg-emerald-600
                      px-4
                      rounded-xl
                    "
                  >
                    Add
                  </button>

                </div>

                <div className="
                  flex
                  justify-end
                  gap-3
                  pt-4
                ">

                  <button
                    type="button"

                    onClick={() =>
                      setShowModal(
                        false
                      )
                    }

                    className="
                      px-4
                      py-2
                      rounded-xl
                      bg-slate-700
                    "
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"

                    className="
                      px-4
                      py-2
                      rounded-xl
                      bg-emerald-500
                    "
                  >

                    {editingUser
                      ? "Update"
                      : "Create"}

                  </button>

                </div>

              </form>

            </div>

          </div>

        )}

      </div>

    </div>
  );
}

function RoleBadge({
  role,
}) {

  const styles = {

    ADMIN:
      "bg-red-500/20 text-red-300",

    ANALYST:
      "bg-blue-500/20 text-blue-300",

    CLIENT_UPLOADER:
      "bg-emerald-500/20 text-emerald-300",
  };

  return (
    <span className={`
      px-3
      py-1
      rounded-full
      text-sm
      font-medium
      ${styles[role]}
    `}>
      {role}
    </span>
  );
}