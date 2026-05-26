import {
  useEffect,
  useState,
} from "react";

import {
  useParams,
  useNavigate,
} from "react-router-dom";

import toast, {
  Toaster,
} from "react-hot-toast";

import Sidebar from
  "../components/layout/Sidebar";

import api from "../api/axios";

export default function RecordDetail() {

  const { id } = useParams();

  const navigate =
    useNavigate();

  const [record, setRecord] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    fetchRecord();

  }, []);

  const fetchRecord = async () => {

    try {

      const response =
        await api.get(
          `/review/records/${id}/`
        );

      setRecord(response.data);

    } catch {

      toast.error(
        "Failed to load record"
      );

    } finally {

      setLoading(false);
    }
  };

  const handleAction = async (
    action
  ) => {

    try {

      await api.post(
        `/review/records/${id}/${action}/`
      );

      toast.success(
        `Record ${action}d`
      );

      fetchRecord();

    } catch {

      toast.error(
        "Action failed"
      );
    }
  };

  const handleDelete =
    async () => {

      const confirmed =
        window.confirm(
          "Are you sure you want to delete this record?"
        );

      if (!confirmed) {
        return;
      }

      try {

        await api.delete(
          `/review/records/${id}/delete/`
        );

        toast.success(
          "Record deleted"
        );

        setTimeout(() => {

          navigate(
            "/records"
          );

        }, 1000);

      } catch {

        toast.error(
          "Delete failed"
        );
      }
    };

  if (loading) {

    return (
      <div className="
        min-h-screen
        flex
        items-center
        justify-center
        bg-slate-950
        text-white
      ">
        Loading...
      </div>
    );
  }

  if (!record) {

    return (
      <div className="
        min-h-screen
        flex
        items-center
        justify-center
        bg-slate-950
        text-white
      ">
        Record not found
      </div>
    );
  }

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

        <button
          onClick={() =>
            navigate(-1)
          }

          className="
            mb-6
            text-slate-400
            hover:text-white
          "
        >
          ← Back
        </button>

        <div className="
          bg-slate-900
          rounded-2xl
          p-8
          shadow-xl
        ">

          <div className="
            flex
            justify-between
            items-start
            mb-8
          ">

            <div>

              <h1 className="
                text-3xl
                font-bold
              ">
                Emission Record
              </h1>

              <p className="
                text-slate-400
                mt-2
              ">
                Review and audit workflow
              </p>

            </div>

            <div className="
              flex
              gap-3
              flex-wrap
            ">

              <button
                onClick={() =>
                  handleAction(
                    "approve"
                  )
                }

                className="
                  bg-emerald-500
                  hover:bg-emerald-600
                  px-5
                  py-2
                  rounded-xl
                "
              >
                Approve
              </button>

              <button
                onClick={() =>
                  handleAction(
                    "flag"
                  )
                }

                className="
                  bg-yellow-500
                  hover:bg-yellow-600
                  px-5
                  py-2
                  rounded-xl
                "
              >
                Flag
              </button>

              <button
                onClick={() =>
                  handleAction(
                    "reject"
                  )
                }

                className="
                  bg-red-500
                  hover:bg-red-600
                  px-5
                  py-2
                  rounded-xl
                "
              >
                Reject
              </button>

              <button
                onClick={() =>
                  handleDelete()
                }

                className="
                  bg-slate-700
                  hover:bg-slate-600
                  px-5
                  py-2
                  rounded-xl
                "
              >
                Delete
              </button>

            </div>
          </div>

          {/* RECORD METADATA */}

          <div className="
            grid
            grid-cols-1
            md:grid-cols-2
            gap-6
          ">

            <InfoCard
              title="Company"
              value={record.company_name}
            />

            <InfoCard
              title="Category"
              value={record.category}
            />

            <InfoCard
              title="Scope"
              value={record.scope}
            />

            <InfoCard
              title="Status"
              value={record.status}
            />

            <InfoCard
              title="Emissions"
              value={`
                ${record.normalized_quantity_kgco2e}
                kgCO2e
              `}
            />

            <InfoCard
              title="Vendor"
              value={record.vendor}
            />

            <InfoCard
              title="Source File"
              value={
                record.source_filename
              }
            />

          </div>

          {/* AUDIT TIMELINE */}

          <div className="
            mt-10
          ">

            <h2 className="
              text-2xl
              font-semibold
              mb-4
            ">
              Audit Timeline
            </h2>

            <div className="
              space-y-4
            ">

              {record.audit_logs?.map(
                (log) => (

                  <div
                    key={log.id}

                    className="
                      bg-slate-800
                      rounded-xl
                      p-4
                    "
                  >

                    <div className="
                      flex
                      justify-between
                    ">

                      <span className="
                        font-semibold
                      ">
                        {log.action}
                      </span>

                      <span className="
                        text-slate-400
                        text-sm
                      ">
                        {
                          log.changed_at
                        }
                      </span>

                    </div>

                    <p className="
                      text-slate-400
                      mt-2
                    ">
                      By:
                      {" "}
                      {
                        log.changed_by_email
                      }
                    </p>

                  </div>
                )
              )}

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

function InfoCard({
  title,
  value,
}) {

  return (
    <div className="
      bg-slate-800
      rounded-xl
      p-5
    ">

      <p className="
        text-slate-400
        mb-2
      ">
        {title}
      </p>

      <h2 className="
        text-xl
        font-semibold
      ">
        {value || "-"}
      </h2>

    </div>
  );
}