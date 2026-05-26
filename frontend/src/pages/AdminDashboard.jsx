import {
  useEffect,
  useState,
} from "react";

import {
  motion,
} from "framer-motion";

import Sidebar from
  "../components/layout/Sidebar";

import api from "../api/axios";

export default function AdminDashboard() {

  const [stats, setStats] =
    useState(null);

  const [companies, setCompanies] =
    useState([]);

  const [sources, setSources] =
    useState([]);

  useEffect(() => {

    loadDashboard();

  }, []);

  const loadDashboard =
    async () => {

      try {

        const [
          companyRes,
          sourceRes,
          dashboardRes,
        ] = await Promise.all([

          api.get(
            "/core/companies/"
          ),

          api.get(
            "/ingestion/sources/"
          ),

          api.get(
            "/review/dashboard/"
          ),
        ]);

        setCompanies(
          companyRes.data
        );

        setSources(
          sourceRes.data
        );

        setStats(
          dashboardRes.data
        );

      } catch (error) {

        console.error(error);
      }
    };

  if (!stats) {

    return (
      <div className="
        min-h-screen
        flex
        items-center
        justify-center
        bg-slate-950
        text-white
      ">
        Loading platform...
      </div>
    );
  }

  const failedUploads =
    sources.filter(
      (source) =>
        source.status ===
        "FAILED"
    ).length;

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

        {/* HEADER */}

        <div className="
          mb-10
        ">

          <h1 className="
            text-4xl
            font-bold
          ">
            Platform Overview
          </h1>

          <p className="
            text-slate-400
            mt-2
          ">
            Enterprise ESG
            governance and
            operational monitoring
          </p>

        </div>

        {/* KPI GRID */}

        <div className="
          grid
          grid-cols-1
          md:grid-cols-2
          xl:grid-cols-4
          gap-6
          mb-10
        ">

          <KpiCard
            title="Total Companies"
            value={
              companies.length
            }
          />

          <KpiCard
            title="Total Records"
            value={
              stats.total_records
            }
          />

          <KpiCard
            title="Failed Uploads"
            value={
              failedUploads
            }
          />

          <KpiCard
            title="Pending Reviews"
            value={
              stats.pending_reviews
            }
          />

        </div>

        {/* INGESTION HEALTH */}

        <motion.div
          whileHover={{
            y: -4,
          }}

          className="
            bg-slate-900
            rounded-2xl
            p-6
            mb-10
          "
        >

          <div className="
            flex
            justify-between
            mb-6
          ">

            <h2 className="
              text-2xl
              font-semibold
            ">
              Ingestion Health
            </h2>

            <span className="
              text-slate-400
            ">
              Source pipeline status
            </span>

          </div>

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
                  Status
                </th>

              </tr>

            </thead>

            <tbody>

              {sources.slice(0, 8)
                .map((source) => (

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

        </motion.div>

        {/* COMPANY ACTIVITY */}

        <motion.div
          whileHover={{
            y: -4,
          }}

          className="
            bg-slate-900
            rounded-2xl
            p-6
          "
        >

          <div className="
            flex
            justify-between
            mb-6
          ">

            <h2 className="
              text-2xl
              font-semibold
            ">
              Client Activity
            </h2>

            <span className="
              text-slate-400
            ">
              Multi-tenant operations
            </span>

          </div>

          <table className="
            w-full
          ">

            <thead>

              <tr className="
                text-left
                text-slate-400
              ">

                <th className="pb-4">
                  Company
                </th>

                <th className="pb-4">
                  Uploads
                </th>

                <th className="pb-4">
                  Pending
                </th>

                <th className="pb-4">
                  Emissions
                </th>

              </tr>

            </thead>

            <tbody>

              {companies.map((company) => (

                <tr
                  key={company.id}

                  className="
                    border-t
                    border-slate-800
                  "
                >

                  <td className="
                    py-4
                  ">
                    {
                      company.name
                    }
                  </td>

                  <td>
                    {
                      company.uploads
                    }
                  </td>

                  <td>
                    {
                      company.pending_reviews
                    }
                  </td>

                  <td>
                    {
                      company.emissions
                    }
                    {" "}
                    kgCO2e
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </motion.div>

      </div>

    </div>
  );
}

function KpiCard({
  title,
  value,
}) {

  return (
    <motion.div
      whileHover={{
        y: -4,
      }}

      className="
        bg-slate-900
        rounded-2xl
        p-6
      "
    >

      <p className="
        text-slate-400
        mb-2
      ">
        {title}
      </p>

      <h2 className="
        text-3xl
        font-bold
      ">
        {value}
      </h2>

    </motion.div>
  );
}

function StatusBadge({
  status,
}) {

  const colors = {

    COMPLETE:
      "bg-emerald-500/20 text-emerald-300",

    PARTIAL:
      "bg-yellow-500/20 text-yellow-300",

    FAILED:
      "bg-red-500/20 text-red-300",

    PROCESSING:
      "bg-blue-500/20 text-blue-300",
  };

  return (
    <span className={`
      px-3
      py-1
      rounded-full
      text-sm
      font-medium
      ${colors[status]}
    `}>
      {status}
    </span>
  );
}