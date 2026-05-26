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
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

import Sidebar from
  "../components/layout/Sidebar";

import {
  getDashboardStats,
  getSources,
} from "../api/review";

export default function Dashboard() {

  const [stats, setStats] =
    useState(null);

  const [sources, setSources] =
    useState([]);

  useEffect(() => {

    loadDashboard();

  }, []);

  const loadDashboard =
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
        Loading dashboard...
      </div>
    );
  }

  const scopeData = [
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

  const trendData = [
    {
      day: "Mon",
      uploads: 4,
    },
    {
      day: "Tue",
      uploads: 7,
    },
    {
      day: "Wed",
      uploads: 3,
    },
    {
      day: "Thu",
      uploads: 9,
    },
    {
      day: "Fri",
      uploads: 5,
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
        p-6
        lg:p-8
      ">

        {/* HEADER */}

        <div className="
          mb-8
          flex
          flex-col
          lg:flex-row
          lg:items-center
          lg:justify-between
          gap-4
        ">

          <div>

            <h1 className="
              text-4xl
              font-bold
            ">
              ESG Operations Dashboard
            </h1>

            <p className="
              text-slate-400
              mt-2
            ">
              Enterprise emissions
              governance and ingestion
              monitoring
            </p>

          </div>

          <div className="
            bg-emerald-500/10
            border
            border-emerald-500/20
            rounded-2xl
            px-5
            py-3
          ">

            <p className="
              text-sm
              text-emerald-300
            ">
              Pending Reviews
            </p>

            <h2 className="
              text-2xl
              font-bold
            ">
              {
                stats.pending_reviews
              }
            </h2>

          </div>

        </div>

        {/* KPI GRID */}

        <div className="
          grid
          grid-cols-1
          md:grid-cols-2
          xl:grid-cols-4
          gap-6
          mb-8
        ">

          <KpiCard
            title="Total Records"
            value={
              stats.total_records
            }
          />

          <KpiCard
            title="Approved"
            value={
              stats.approved_records
            }
          />

          <KpiCard
            title="Flagged"
            value={
              stats.flagged_records
            }
          />

          <KpiCard
            title="Total Emissions"
            value={`
              ${stats.total_emissions_kgco2e}
              kgCO2e
            `}
          />

        </div>

        {/* CHART GRID */}

        <div className="
          grid
          grid-cols-1
          xl:grid-cols-2
          gap-6
          mb-8
        ">

          {/* SCOPE BREAKDOWN */}

          <motion.div
            whileHover={{
              y: -4,
            }}

            className="
              bg-slate-900
              rounded-2xl
              p-6
              shadow-xl
            "
          >

            <div className="
              flex
              items-center
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
                text-sm
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
                    data={scopeData}
                    dataKey="value"
                    outerRadius={120}
                    label
                  >

                    {scopeData.map(
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

          {/* TREND CHART */}

          <motion.div
            whileHover={{
              y: -4,
            }}

            className="
              bg-slate-900
              rounded-2xl
              p-6
              shadow-xl
            "
          >

            <div className="
              flex
              items-center
              justify-between
              mb-6
            ">

              <h2 className="
                text-2xl
                font-semibold
              ">
                Ingestion Trends
              </h2>

              <span className="
                text-slate-400
                text-sm
              ">
                Weekly Upload Activity
              </span>

            </div>

            <div className="
              h-80
            ">

              <ResponsiveContainer>

                <AreaChart
                  data={trendData}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                  />

                  <XAxis
                    dataKey="day"
                  />

                  <YAxis />

                  <Tooltip />

                  <Area
                    type="monotone"
                    dataKey="uploads"
                  />

                </AreaChart>

              </ResponsiveContainer>

            </div>

          </motion.div>

        </div>

        {/* RECENT UPLOADS */}

        <motion.div
          initial={{
            opacity: 0,
            y: 10,
          }}

          animate={{
            opacity: 1,
            y: 0,
          }}

          className="
            bg-slate-900
            rounded-2xl
            p-6
            shadow-xl
          "
        >

          <div className="
            flex
            items-center
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
              text-sm
            ">
              Latest ingestion events
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

                  <th className="pb-4">
                    Parsed
                  </th>

                  <th className="pb-4">
                    Failed
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

                      <td>
                        {
                          source.parsed_rows
                        }
                      </td>

                      <td>
                        {
                          source.failed_rows
                        }
                      </td>

                    </tr>
                  ))}

              </tbody>

            </table>

          </div>

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
        shadow-lg
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