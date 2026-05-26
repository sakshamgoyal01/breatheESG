import {
  useEffect,
  useState,
} from "react";

import {
  motion,
} from "framer-motion";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import Sidebar from
  "../components/layout/Sidebar";

import {
  getDashboardStats,
  getSources,
} from "../api/review";

import {
  useAuth,
} from "../context/AuthContext";

export default function ClientDashboard() {

  const [stats, setStats] =
    useState(null);

  const [sources, setSources] =
    useState([]);

  const {
    user,
  } = useAuth();

  useEffect(() => {

    loadData();

  }, []);

  const loadData =
    async () => {

      const [
        statsData,
        sourceData,
      ] = await Promise.all([
        getDashboardStats(),
        getSources(),
      ]);

      setStats(statsData);

      setSources(sourceData);
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
        Loading ESG workspace...
      </div>
    );
  }

  const chartData = [
    {
      name: "Scope 1",
      value:
        stats.scope_breakdown
          .scope_1,
    },
    {
      name: "Scope 2",
      value:
        stats.scope_breakdown
          .scope_2,
    },
    {
      name: "Scope 3",
      value:
        stats.scope_breakdown
          .scope_3,
    },
  ];

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
            Welcome back,
            {" "}
            {user?.company || "Client"}
          </h1>

          <p className="
            text-slate-400
            mt-2
          ">
            ESG reporting and
            emissions management
            workspace
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
            title="Total Emissions"
            value={`
              ${stats.total_emissions_kgco2e}
              kgCO2e
            `}
          />

          <KpiCard
            title="Pending Reviews"
            value={
              stats.pending_reviews
            }
          />

          <KpiCard
            title="Approved Records"
            value={
              stats.approved_records
            }
          />

          <KpiCard
            title="Rejected Records"
            value={
              stats.rejected_records
            }
          />

        </div>

        {/* UPLOAD MODULES */}

        <div className="
          grid
          grid-cols-1
          lg:grid-cols-3
          gap-6
          mb-10
        ">

          <UploadCard
            title="SAP Procurement"
            subtitle="Upload SAP MB51 exports"
          />

          <UploadCard
            title="Utility Bills"
            subtitle="Upload electricity portal exports"
          />

          <TravelUploadCard />

        </div>

        {/* CHART + TABLE */}

        <div className="
          grid
          grid-cols-1
          xl:grid-cols-2
          gap-6
        ">

          {/* EMISSIONS CHART */}

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
                Emissions Breakdown
              </h2>

              <span className="
                text-slate-400
              ">
                By Scope
              </span>

            </div>

            <div className="
              h-80
            ">

              <ResponsiveContainer>

                <PieChart>

                  <Pie
                    data={chartData}
                    dataKey="value"
                    outerRadius={120}
                    label
                  >

                    {chartData.map(
                      (_, index) => (
                        <Cell
                          key={index}
                        />
                      )
                    )}

                  </Pie>

                  <Tooltip />

                </PieChart>

              </ResponsiveContainer>

            </div>

          </motion.div>

          {/* RECENT UPLOADS */}

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
                Recent Uploads
              </h2>

              <span className="
                text-slate-400
              ">
                Latest ingestion activity
              </span>

            </div>

            <div className="
              overflow-x-auto
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
                      Source
                    </th>

                    <th className="pb-4">
                      Status
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {sources
                    .slice(0, 5)
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

          </motion.div>

        </div>

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

function UploadCard({
  title,
  subtitle,
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

      <h2 className="
        text-2xl
        font-semibold
        mb-2
      ">
        {title}
      </h2>

      <p className="
        text-slate-400
        mb-6
      ">
        {subtitle}
      </p>

      <button className="
        bg-emerald-500
        hover:bg-emerald-600
        px-5
        py-3
        rounded-xl
      ">
        Upload File
      </button>

    </motion.div>
  );
}

function TravelUploadCard() {

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

      <h2 className="
        text-2xl
        font-semibold
        mb-2
      ">
        Travel Platform
      </h2>

      <p className="
        text-slate-400
        mb-6
      ">
        Upload corporate travel exports
      </p>

      <select className="
        w-full
        p-3
        rounded-xl
        bg-slate-800
        border
        border-slate-700
        mb-4
      ">

        <option>
          Concur Export
        </option>

        <option>
          Navan Export
        </option>

        <option>
          Generic Travel CSV
        </option>

      </select>

      <button className="
        bg-emerald-500
        hover:bg-emerald-600
        px-5
        py-3
        rounded-xl
      ">
        Upload Travel Data
      </button>

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