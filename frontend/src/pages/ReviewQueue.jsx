import {
  useEffect,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import Sidebar from
  "../components/layout/Sidebar";

import {
  getRecords,
} from "../api/review";

import api from
  "../api/axios";

export default function ReviewQueue() {

  const [records, setRecords] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState("");

  const [scope, setScope] =
    useState("");

  const [companyId,
    setCompanyId] =
      useState("");

  const [companies,
    setCompanies] =
      useState([]);

  useEffect(() => {

    fetchRecords();

  }, [
    status,
    scope,
    companyId,
  ]);

  useEffect(() => {

    fetchCompanies();

  }, []);

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

  const fetchRecords =
    async () => {

      setLoading(true);

      try {

        const data =
          await getRecords({
            status,
            scope,
            search,
            company:
              companyId,
          });

        setRecords(data);

      } finally {

        setLoading(false);
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
          mb-8
        ">

          <h1 className="
            text-4xl
            font-bold
          ">
            Review Queue
          </h1>

          <p className="
            text-slate-400
            mt-2
          ">
            Analyst review workflow
          </p>

        </div>

        {/* FILTER BAR */}

        <div className="
          bg-slate-900
          rounded-2xl
          p-6
          mb-6
          grid
          grid-cols-1
          md:grid-cols-5
          gap-4
        ">

          <input
            type="text"

            placeholder="Search..."

            value={search}

            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }

            className="
              p-3
              rounded-xl
              bg-slate-800
              border
              border-slate-700
            "
          />

          {/* STATUS FILTER */}

          <select
            value={status}

            onChange={(e) =>
              setStatus(
                e.target.value
              )
            }

            className="
              p-3
              rounded-xl
              bg-slate-800
              border
              border-slate-700
            "
          >

            <option value="">
              All Statuses
            </option>

            <option value="PENDING">
              Pending
            </option>

            <option value="APPROVED">
              Approved
            </option>

            <option value="FLAGGED">
              Flagged
            </option>

            <option value="REJECTED">
              Rejected
            </option>

          </select>

          {/* SCOPE FILTER */}

          <select
            value={scope}

            onChange={(e) =>
              setScope(
                e.target.value
              )
            }

            className="
              p-3
              rounded-xl
              bg-slate-800
              border
              border-slate-700
            "
          >

            <option value="">
              All Scopes
            </option>

            <option value="SCOPE_1">
              Scope 1
            </option>

            <option value="SCOPE_2">
              Scope 2
            </option>

            <option value="SCOPE_3">
              Scope 3
            </option>

          </select>

          {/* COMPANY FILTER */}

          <select
            value={companyId}

            onChange={(e) =>
              setCompanyId(
                e.target.value
              )
            }

            className="
              bg-slate-800
              border
              border-slate-700
              rounded-xl
              px-4
              py-2
            "
          >

            <option value="">
              All Companies
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

          <button
            onClick={fetchRecords}

            className="
              bg-emerald-500
              hover:bg-emerald-600
              rounded-xl
              px-4
              py-3
              transition
            "
          >
            Apply Filters
          </button>

        </div>

        {/* TABLE */}

        <div className="
          bg-slate-900
          rounded-2xl
          p-6
          overflow-x-auto
        ">

          {loading ? (

            <div className="
              py-20
              text-center
              text-slate-400
            ">
              Loading records...
            </div>

          ) : records.length === 0 ? (

            <div className="
              py-20
              text-center
              text-slate-400
            ">
              No records found
            </div>

          ) : (

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

                  <th className="pb-4">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody>

                {records.map(
                  (record) => (

                    <tr
                      key={record.id}

                      className="
                        border-t
                        border-slate-800
                      "
                    >

                      <td className="
                        py-4
                      ">
                        {
                          record.company_name
                        }
                      </td>

                      <td>
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

                        <StatusBadge
                          status={
                            record.status
                          }
                        />

                      </td>

                      <td>
                        {
                          record.normalized_quantity_kgco2e
                        }
                        {" "}
                        kgCO2e
                      </td>

                      <td>

                        <Link
                          to={`/records/${record.id}`}

                          className="
                            text-emerald-400
                            hover:text-emerald-300
                          "
                        >
                          Review
                        </Link>

                      </td>

                    </tr>
                  )
                )}

              </tbody>

            </table>

          )}

        </div>

      </div>

    </div>
  );
}

function StatusBadge({
  status,
}) {

  const colors = {

    PENDING:
      "bg-yellow-500/20 text-yellow-300",

    APPROVED:
      "bg-emerald-500/20 text-emerald-300",

    FLAGGED:
      "bg-orange-500/20 text-orange-300",

    REJECTED:
      "bg-red-500/20 text-red-300",
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