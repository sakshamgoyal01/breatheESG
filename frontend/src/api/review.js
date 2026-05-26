import api from "./axios";


export const getDashboardStats =
  async () => {

    const response =
      await api.get(
        "/review/dashboard/"
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


export const getRecords =
  async ({
    status = "",
    scope = "",
    search = "",
    ordering = "",
    category = "",
  } = {}) => {

    const params =
      new URLSearchParams();

    // Status filter
    if (status) {

      params.append(
        "status",
        status
      );
    }

    // Scope filter
    if (scope) {

      params.append(
        "scope",
        scope
      );
    }

    // Search filter
    if (search) {

      params.append(
        "search",
        search
      );
    }

    // Category filter
    if (category) {

      params.append(
        "category",
        category
      );
    }

    // Ordering
    if (ordering) {

      params.append(
        "ordering",
        ordering
      );
    }

    const response =
      await api.get(
        `/review/records/?${params.toString()}`
      );

    return response.data;
};


export const getRecordDetail =
  async (recordId) => {

    const response =
      await api.get(
        `/review/records/${recordId}/`
      );

    return response.data;
};


export const approveRecord =
  async (recordId) => {

    const response =
      await api.post(
        `/review/records/${recordId}/approve/`
      );

    return response.data;
};


export const rejectRecord =
  async (
    recordId,
    reason
  ) => {

    const response =
      await api.post(
        `/review/records/${recordId}/reject/`,
        {
          reason
        }
      );

    return response.data;
};


export const flagRecord =
  async (
    recordId,
    reason
  ) => {

    const response =
      await api.post(
        `/review/records/${recordId}/flag/`,
        {
          reason
        }
      );

    return response.data;
};


export const bulkApproveRecords =
  async (recordIds) => {

    const response =
      await api.post(
        "/review/records/bulk-approve/",
        {
          record_ids: recordIds
        }
      );

    return response.data;
};