import {
  useEffect,
  useState,
} from "react";

import toast, {
  Toaster,
} from "react-hot-toast";

import Sidebar from
  "../components/layout/Sidebar";

import {
  useAuth,
} from "../context/AuthContext";

import api from "../api/axios";

import {
  uploadFile,
  getSources,
} from "../api/ingestion";

export default function Upload() {

  const { user } =
    useAuth();

  const [file, setFile] =
    useState(null);

  const [sourceType,
    setSourceType] =
      useState("SAP");

  const [sources, setSources] =
    useState([]);

  const [companies, setCompanies] =
    useState([]);

  const [companyId, setCompanyId] =
    useState("");

  const [travelSource,
    setTravelSource] =
      useState("CONCUR");

  const loadSources = async () => {

    try {

      const data =
        await getSources();

      setSources(data);

    } catch (error) {

      console.error(error);
    }
  };

  useEffect(() => {

    loadSources();

  }, []);

  useEffect(() => {

    if (
      user?.role === "ANALYST"
      ||
      user?.role === "ADMIN"
    ) {

      fetchCompanies();
    }

  }, [user]);

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

  const handleUpload =
    async () => {

      if (!file) {

        toast.error(
          "Please select a file"
        );

        return;
      }

      try {

        const formData =
          new FormData();

        formData.append(
          "file",
          file
        );

        formData.append(
          "source_type",
          sourceType
        );

        // DEBUG LOGGING

        console.log(
          "SOURCE TYPE:",
          sourceType
        );

        console.log(
          "USER ROLE:",
          user?.role
        );

        console.log(
          "COMPANY ID:",
          companyId
        );

        if (
          sourceType ===
          "TRAVEL"
        ) {

          formData.append(
            "travel_source",
            travelSource
          );
        }

        if (
          (
            user?.role ===
            "ANALYST"

            ||

            user?.role ===
            "ADMIN"
          )

          &&

          companyId
        ) {

          formData.append(
            "company_id",
            companyId
          );
        }

        const response =
          await uploadFile(
            formData
          );

        console.log(
          "UPLOAD SUCCESS:",
          response
        );

        toast.success(
          "Upload successful"
        );

        setFile(null);

        loadSources();

      } catch (error) {

        console.error(
          "UPLOAD ERROR:",
          error
        );

        console.error(
          "BACKEND RESPONSE:",
          error?.response?.data
        );

        toast.error(

          error?.response?.data?.error

          ||

          JSON.stringify(
            error?.response?.data
          )

          ||

          "Upload failed"
        );
      }
    };

  return (
    <div className="
      flex
      min-h-screen
      bg-slate-950
      text-white
    ">

      <Toaster />

      <Sidebar />

      <div className="
        flex-1
        p-8
      ">

        <h1 className="
          text-4xl
          font-bold
          mb-8
        ">
          Upload ESG Data
        </h1>

        <div className="
          bg-slate-900
          rounded-2xl
          p-6
          mb-10
          space-y-6
        ">

          {/* COMPANY SELECTOR */}

          {(
            user?.role ===
            "ANALYST"

            ||

            user?.role ===
            "ADMIN"
          ) && (

            <div>

              <label className="
                block
                mb-2
                text-sm
                text-slate-400
              ">
                Select Client Company
              </label>

              <select
                value={companyId}

                onChange={(e) =>
                  setCompanyId(
                    e.target.value
                  )
                }

                className="
                  w-full
                  bg-slate-800
                  border
                  border-slate-700
                  rounded-xl
                  p-3
                "
              >

                <option value="">
                  Select Company
                </option>

                {companies.map(
                  (company) => (

                    <option
                      key={company.id}
                      value={company.id}
                    >
                      {company.name}
                    </option>
                  )
                )}

              </select>

            </div>
          )}

          {/* SOURCE TYPE */}

          <div>

            <label className="
              block
              mb-2
              text-sm
              text-slate-400
            ">
              Source Type
            </label>

            <select
              value={sourceType}

              onChange={(e) =>
                setSourceType(
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
              "
            >

              <option value="SAP">
                SAP
              </option>

              <option value="UTILITY">
                UTILITY
              </option>

              <option value="TRAVEL">
                TRAVEL
              </option>

            </select>

          </div>

          {/* TRAVEL SOURCE */}

          {sourceType ===
            "TRAVEL" && (

            <div>

              <label className="
                block
                mb-2
                text-sm
                text-slate-400
              ">
                Travel Platform
              </label>

              <select
                value={travelSource}

                onChange={(e) =>
                  setTravelSource(
                    e.target.value
                  )
                }

                className="
                  w-full
                  bg-slate-800
                  border
                  border-slate-700
                  rounded-xl
                  p-3
                "
              >

                <option value="CONCUR">
                  Concur Export
                </option>

                <option value="NAVAN">
                  Navan Export
                </option>

                <option value="GENERIC">
                  Generic Travel CSV
                </option>

              </select>

            </div>
          )}

          {/* FILE INPUT */}

          <div className="
            space-y-2
          ">

            <label className="
              block
              text-sm
              text-slate-300
            ">
              Select CSV File
            </label>

            <input
              type="file"

              accept=".csv"

              onChange={(e) =>
                setFile(
                  e.target.files[0]
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
                file:mr-4
                file:px-4
                file:py-2
                file:rounded-lg
                file:border-0
                file:bg-emerald-500
                file:text-white
                hover:file:bg-emerald-600
              "
            />

            {file && (

              <p className="
                text-emerald-400
                text-sm
              ">
                Selected:
                {" "}
                {file.name}
              </p>
            )}

          </div>

          {/* UPLOAD BUTTON */}

          <button
            onClick={
              handleUpload
            }

            className="
              bg-emerald-500
              hover:bg-emerald-600
              px-6
              py-3
              rounded-xl
              transition
            "
          >
            Upload File
          </button>

        </div>

        {/* INGESTION HISTORY */}

        <div className="
          bg-slate-900
          rounded-2xl
          p-6
        ">

          <h2 className="
            text-2xl
            font-semibold
            mb-6
          ">
            Ingestion History
          </h2>

          <table className="
            w-full
          ">

            <thead>

              <tr className="
                text-left
                text-slate-400
              ">

                <th>
                  File
                </th>

                <th>
                  Type
                </th>

                <th>
                  Status
                </th>

                <th>
                  Parsed
                </th>

                <th>
                  Failed
                </th>

              </tr>

            </thead>

            <tbody>

              {sources.map(
                (source) => (

                  <tr
                    key={source.id}

                    className="
                      border-t
                      border-slate-800
                    "
                  >

                    <td className="
                      py-4
                    ">
                      {
                        source
                        .original_filename
                      }
                    </td>

                    <td>
                      {
                        source
                        .source_type
                      }
                    </td>

                    <td>
                      {
                        source
                        .status
                      }
                    </td>

                    <td>
                      {
                        source
                        .parsed_rows
                      }
                    </td>

                    <td>
                      {
                        source
                        .failed_rows
                      }
                    </td>

                  </tr>
                )
              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}