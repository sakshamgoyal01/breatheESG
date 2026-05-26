import api from "./axios";

export const uploadFile =
  async (formData) => {

    const response =
      await api.post(

        "/ingestion/upload/",

        formData,

        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

    return response.data;
};

export const getSources =
  async () => {

    const response =
      await api.get(
        "/ingestion/sources/"
      );

    return response.data;
};

export const getParseErrors =
  async (sourceId) => {

    const response =
      await api.get(
        `/ingestion/sources/${sourceId}/errors/`
      );

    return response.data;
};