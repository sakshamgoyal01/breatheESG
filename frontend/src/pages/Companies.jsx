import { useEffect, useState } from "react";

import { motion } from "framer-motion";

import { Link } from "react-router-dom";

import Sidebar from "../components/layout/Sidebar";

import api from "../api/axios";

export default function Companies() {

  const [companies, setCompanies] =
    useState([]);

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
            Client Portfolio
          </h1>

          <p className="
            text-slate-400
            mt-2
          ">
            Manage enterprise ESG
            ingestion workflows
          </p>

        </div>

        <div className="
          grid
          grid-cols-1
          md:grid-cols-2
          xl:grid-cols-3
          gap-6
        ">

          {companies.map((company) => (

            <motion.div
              key={company.id}

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

              <h2 className="
                text-2xl
                font-semibold
                mb-6
              ">
                {company.name}
              </h2>

              <div className="
                space-y-3
                text-slate-300
              ">

                <p>
                  Pending Reviews:
                  {" "}
                  {
                    company.pending_reviews || 0
                  }
                </p>

                <p>
                  Uploads:
                  {" "}
                  {
                    company.uploads || 0
                  }
                </p>

                <p>
                  Emissions:
                  {" "}
                  {
                    company.emissions || 0
                  }
                  {" "}
                  kgCO2e
                </p>

              </div>

              <Link
                to={`/companies/${company.id}`}

                className="
                  inline-block
                  mt-6
                  bg-emerald-500
                  hover:bg-emerald-600
                  px-5
                  py-3
                  rounded-xl
                "
              >
                Open Workspace
              </Link>

            </motion.div>

          ))}

        </div>

      </div>

    </div>
  );
}