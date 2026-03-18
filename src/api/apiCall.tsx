import axios from "axios";

const apiUrl = "http://localhost:3000/";

export const adminGate = async (payload: any) => {
  try {
    const response = await axios.post(`${apiUrl}api/admin/gate`, payload);

    return response;
  } catch (error) {
    console.log(error);
  }
};

export const adminLogin = async (payload: any) => {
  try {
    const response = await axios.post(`${apiUrl}api/admin/login`, payload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionStorage.getItem("admin_gate_token")}`,
      },
    });
    return response;
  } catch (error) {
    console.log(error);
  }
};

export const managerLogin = async (payload: any) => {
  try {
    const response = await axios.post(`${apiUrl}api/manager/login`, payload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionStorage.getItem("admin_gate_token")}`,
      },
    });
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const createAdmin = async (token: any, payload: any) => {
  try {
    const response = await axios.post(`${apiUrl}api/admin/create`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response;
  } catch (error) {
    console.log(error);
  }
};

export const createWorker = async (token: any, payload: any) => {
  try {
    const response = await axios.post(`${apiUrl}api/manager/workers`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response;
  } catch (error) {
    console.log(error);
  }
};

export const getUsers = async (token: any) => {
  try {
    const response = await axios.get(`${apiUrl}api/admin/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const getManagers = async (token: any) => {
  try {
    const response = await axios.get(`${apiUrl}api/admin/managers`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const updateUser = async (token: any, payload: any) => {
  try {
    const response = await axios.put(
      `${apiUrl}api/admin/users/update`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

export const updateMyProfile = async (token: any, payload: any) => {
  try {
    const response = await axios.put(`${apiUrl}api/admin/users/me`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

export const deleteUser = async (token: any, id: any) => {
  const response = await axios.delete(`${apiUrl}api/admin/users/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const createDepartment = async (token: any, payload: any) => {
  try {
    const response = await axios.post(
      `${apiUrl}api/manager/departments`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response;
  } catch (error) {
    console.log(error);
  }
};

export const getDepartments = async (token: any) => {
  try {
    const response = await axios.get(`${apiUrl}api/manager/departments`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const updateDepartment = async (token: any, payload: any) => {
  try {
    const response = await axios.put(
      `${apiUrl}api/manager/departments`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

export const deleteDepartment = async (token: any, id: any) => {
  const response = await axios.delete(
    `${apiUrl}api/manager/departments/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

export const createPosition = async (token: any, payload: any) => {
  try {
    const response = await axios.post(
      `${apiUrl}api/manager/positions`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response;
  } catch (error) {
    console.log(error);
  }
};

export const getPositions = async (token: any) => {
  try {
    const response = await axios.get(`${apiUrl}api/manager/positions`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const updatePosition = async (token: any, payload: any) => {
  try {
    const response = await axios.put(
      `${apiUrl}api/manager/positions`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

export const deletePosition = async (token: any, id: any) => {
  const response = await axios.delete(`${apiUrl}api/manager/positions/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const getPositionsByDepartment = async (
  token: undefined | string,
  id?: number
) => {
  const response = await axios.get(
    `${apiUrl}api/manager/departments/${id}/positions`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

export const getWorkersCount = async (token: any) => {
  try {
    const response = await axios.get(`${apiUrl}api/manager/workers/count`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const getWorkers = async (token: any) => {
  try {
    const response = await axios.get(`${apiUrl}api/manager/workers`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const updateWorker = async (token: any, payload: any) => {
  try {
    const response = await axios.put(`${apiUrl}api/manager/workers`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

export const deleteWorker = async (token: any, id: any) => {
  const response = await axios.delete(`${apiUrl}api/manager/workers/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const getUsersCount = async (token: any) => {
  try {
    const response = await axios.get(`${apiUrl}api/admin/users/statistics`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const recentEmployees = async (token: any) => {
  try {
    const response = await axios.get(`${apiUrl}api/admin/employees/recent`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const getAttendanceWorkersByDepartment = async (token: any, id: any) => {
  try {
    const response = await axios.get(`${apiUrl}api/manager/attendance/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const checkInAttendanceWorker = async (token: any, payload: any) => {
  try {
    const response = await axios.post(`${apiUrl}api/worker/check-in`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const checkOutAttendanceWorker = async (token: any, payload: any) => {
  try {
    const response = await axios.post(
      `${apiUrl}api/worker/check-out`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const checkInAttendanceManager = async (token: any, payload: any) => {
  try {
    const response = await axios.post(
      `${apiUrl}api/manager/check-in`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const checkOutAttendanceManager = async (token: any, payload: any) => {
  try {
    const response = await axios.post(
      `${apiUrl}api/manager/check-out`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const getIfaUserCheckedInManager = async (token: any, id: any) => {
  try {
    const response = await axios.get(`${apiUrl}api/manager/checked-in/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const getIfaUserCheckedInWorker = async (token: any, id: any) => {
  try {
    const response = await axios.get(`${apiUrl}api/worker/checked-in/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const getStatsByDepartmentId = async (token: any, id: any) => {
  try {
    const response = await axios.get(`${apiUrl}api/manager/stats/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const getDepartmentAttendanceByDateRange = async (
  token: string | undefined,
  id: string | undefined,
  startDate: string,
  endDate: string
) => {
  try {
    const response = await axios.get(
      `${apiUrl}api/manager/department/${id}/attendance`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          startDate,
          endDate,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const getWorkersByDepartmentId = async (token: any, id: any) => {
  try {
    const response = await axios.get(
      `${apiUrl}api/manager/departments/workers/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const getContracts = async (token: any) => {
  try {
    const response = await axios.get(`${apiUrl}api/manager/contracts`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const createContract = async (token: any, payload: any) => {
  try {
    const response = await axios.post(
      `${apiUrl}api/manager/contracts`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const updateContract = async (token: any, payload: any) => {
  try {
    const response = await axios.put(
      `${apiUrl}api/manager/contracts`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

export const sendContractPdfToUser = async (
  token: any,
  contractId: string | number,
) => {
  try {
    const response = await axios.get(
      `${apiUrl}api/manager/contracts/send-pdf/${contractId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

export const updateUserStatus = async (token: any, id: any, isActive: any) => {
  try {
    const response = await axios.put(
      `${apiUrl}api/admin/users/update/status/${id}`,
      {isActive},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

export const transferUserToDepartment = async (token: any, payload: any) => {
  try {
    const response = await axios.put(
      `${apiUrl}api/manager/transfer`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

export const getAllWorkersCount = async (token: any) => {
  try {
    const response = await axios.get(`${apiUrl}api/admin/workers/count`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const getUsersByDepartmentId = async (token: any, id: any) => {
  try {
    const response = await axios.get(
      `${apiUrl}api/admin/departments/users/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const getUserProfile = async (token: any, id: any) => {
  try {
    const response = await axios.get(
      `${apiUrl}api/admin/users/profile/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const changePassword = async (token: any, payload: any) => {
  try {
    const response = await axios.put(`${apiUrl}api/admin/change/password`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

export const getWorkersByDepartment = async (token: any, id: any) => {
  try {
    const response = await axios.get(
      `${apiUrl}api/manager/workers/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const getAllContracts = async (token: any) => {
  try {
    const response = await axios.get(`${apiUrl}api/admin/contracts`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const getAllUsers = async (token: any) => {
  try {
    const response = await axios.get(`${apiUrl}api/admin/users/all`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const getDepartmentAttendancePercentage = async (token: any) => {
  try {
    const response = await axios.get(`${apiUrl}api/admin/departments/attendance/percentage`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.log(error);
  }
};
