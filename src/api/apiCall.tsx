import axios from "axios";

const apiUrl = 'http://localhost:3000/';

export const adminLogin = async (payload: any) => {
    try {
      const response = await axios.post(
        `${apiUrl}api/admin/login`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("admin_gate_token")}`,
          },
        }
      );
      return response;
    } catch (error) {
      console.log(error);
    }
};

export const adminGate = async (payload: any) => {
  try {
    const response = await axios.post(
      `${apiUrl}api/admin/gate`,
      payload
    );

    return response;
  } catch (error) {
    console.log(error);
  }
};

export const createAdmin = async (token: any, payload: any) => {
    try {
      const response = await axios.post(
        `${apiUrl}api/admin/admins/create`,
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

export const createManager = async (token: any, payload: any) => {
  try {
    const response = await axios.post(
      `${apiUrl}api/manager/worker/create`,
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

export const getUsers = async (token: any) => {
  try {
    const response = await axios.get(
      `${apiUrl}api/admin/getUsers`,{
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

export const updateUser = async (token: any, payload: any) => {
  try {
    const response = await axios.put(`${apiUrl}api/admin/users/update`,
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
    const response = await axios.put(`${apiUrl}api/admin/users/myProfile/update`,
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

export const deleteUser = async (token: any, id: any) => {
  const response = await axios.delete(
    `${apiUrl}api/admin/users/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

export const createDepartment = async (token: any, payload: any) => {
  try {
    const response = await axios.post(
      `${apiUrl}api/manager/createDepartment`,
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
    const response = await axios.get(
      `${apiUrl}api/manager/getDepartments`,{
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

export const updateDepartment = async (token: any, payload: any) => {
  try {
    const response = await axios.put(`${apiUrl}api/manager/departments/update`,
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
    `${apiUrl}api/manager/delete/departments/${id}`,
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
      `${apiUrl}api/manager/createPosition`,
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
    const response = await axios.get(
      `${apiUrl}api/manager/getPosition`,{
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

export const updatePosition = async (token: any, payload: any) => {
  try {
    const response = await axios.put(`${apiUrl}api/manager/positions/update`,
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
  const response = await axios.delete(
    `${apiUrl}api/manager/delete/positions/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

export const getPositionsByDepartment = async (
  token: undefined | string,
  id?: number
) => {
  const res = await axios.get(`${apiUrl}api/manager/getPositionsByDepartmentId/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};

export const getWorkersCount = async (token: any) => {
  try {
    const response = await axios.get(
      `${apiUrl}api/manager/getWorkersCount`,{
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

export const getWorkers = async (token: any) => {
  try {
    const response = await axios.get(
      `${apiUrl}api/manager/getWorkers`,{
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

export const updateWorker = async (token: any, payload: any) => {
  try {
    const response = await axios.put(`${apiUrl}api/manager/workers/update`,
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

export const deleteWorker = async (token: any, id: any) => {
  const response = await axios.delete(
    `${apiUrl}api/manager/workers/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

export const getUsersCount = async (token: any) => {
  try {
    const response = await axios.get(
      `${apiUrl}api/admin/getUsersCount`,{
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