import {
  useEffect,
  useState,
} from "react";

import Sidebar from
  "../components/layout/Sidebar";

import api from "../api/axios";

export default function IngestionHealth() {

  const [sources, setSources] =
    useState([]);

  useEffect(() => {

    fetchSources();

  }, []);

  const fetchSources =
    async () => {

      try {

        const response =
          await api.get(
            "/ingestion/sources/"
          );

        setSources(
          response.data
        );

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
          mb-10
        ">

          <h1 className="
            text-4xl
            font-bold
          ">
            Ingestion Health
          </h1>

          <p className="
            text-slate-400
            mt-2
          ">
            ESG pipeline and
            ingestion monitoring
          </p>

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
                  File
                </th>

                <th className="pb-4">
                  Company
                </th>

                <th className="pb-4">
                  Source
                </th>

                <th className="pb-4">
                  Uploaded By
                </th>

                <th className="pb-4">
                  Status
                </th>

              </tr>

            </thead>

            <tbody>

              {sources.map((source) => (

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
                      source.original_filename
                    }
                  </td>

                  <td>
                    {
                      source.company_name
                    }
                  </td>

                  <td>
                    {
                      source.source_type
                    }
                  </td>

                  <td>
                    {
                      source.uploaded_by_username
                    }
                  </td>

                  <td>

                    <StatusBadge
                      status={
                        source.status
                      }
                    />

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}

function StatusBadge({
  status,
}) {

  const styles = {

    COMPLETE:
      "bg-emerald-500/20 text-emerald-300",

    FAILED:
      "bg-red-500/20 text-red-300",

    PROCESSING:
      "bg-blue-500/20 text-blue-300",

    PARTIAL:
      "bg-yellow-500/20 text-yellow-300",
  };

  return (
    <span className={`
      px-3
      py-1
      rounded-full
      text-sm
      font-medium
      ${styles[status]}
    `}>
      {status}
    </span>
  );
}