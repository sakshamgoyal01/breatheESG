import {
  useEffect,
  useState,
} from "react";

import {
  useParams,
} from "react-router-dom";

import Sidebar from
  "../components/layout/Sidebar";

import api from "../api/axios";

export default function CompanyWorkspace() {

  const { companyId } =
    useParams();

  const [company, setCompany] =
    useState(null);

  const [records, setRecords] =
    useState([]);

  const [uploads, setUploads] =
    useState([]);

  useEffect(() => {

    loadWorkspace();

  }, [companyId]);

  const loadWorkspace =
    async () => {

      try {

        const [
          companyRes,
          recordsRes,
          uploadsRes,
        ] = await Promise.all([

          api.get(
            `/core/companies/${companyId}/`
          ),

          api.get(
            `/review/records/?company=${companyId}`
          ),

          api.get(
            `/ingestion/sources/?company=${companyId}`
          ),
        ]);

        setCompany(
          companyRes.data
        );

        setRecords(
          recordsRes.data
        );

        setUploads(
          uploadsRes.data
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
            {
              company?.name
            }
            {" "}
            Workspace
          </h1>

          <p className="
            text-slate-400
            mt-2
          ">
            ESG ingestion and
            governance operations
          </p>

        </div>

        {/* UPLOADS */}

        <div className="
          bg-slate-900
          rounded-2xl
          p-6
          mb-8
        ">

          <h2 className="
            text-2xl
            font-semibold
            mb-6
          ">
            Uploads
          </h2>

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
                  Source
                </th>

                <th className="pb-4">
                  Status
                </th>

              </tr>

            </thead>

            <tbody>

              {uploads.map((upload) => (

                <tr
                  key={upload.id}

                  className="
                    border-t
                    border-slate-800
                  "
                >

                  <td className="py-4">
                    {
                      upload.original_filename
                    }
                  </td>

                  <td>
                    {
                      upload.source_type
                    }
                  </td>

                  <td>
                    {
                      upload.status
                    }
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

        {/* REVIEW RECORDS */}

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
            Review Queue
          </h2>

          <table className="
            w-full
          ">

            <thead>

              <tr className="
                text-left
                text-slate-400
              ">

                <th className="pb-4">
                  Category
                </th>

                <th className="pb-4">
                  Scope
                </th>

                <th className="pb-4">
                  Status
                </th>

                <th className="pb-4">
                  Emissions
                </th>

              </tr>

            </thead>

            <tbody>

              {records.map((record) => (

                <tr
                  key={record.id}

                  className="
                    border-t
                    border-slate-800
                  "
                >

                  <td className="py-4">
                    {
                      record.category
                    }
                  </td>

                  <td>
                    {
                      record.scope
                    }
                  </td>

                  <td>
                    {
                      record.status
                    }
                  </td>

                  <td>
                    {
                      record.co2e_emissions_kg
                    }
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