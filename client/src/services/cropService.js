const API_URL = 'http://localhost:4000/api/crops';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const getAllCrops = async () => {
  const response = await fetch(API_URL, {
    method: 'GET',
    headers: getAuthHeaders()
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Error al obtener las cosechas');
  }

  return data;
};

export const getCropById = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'GET',
    headers: getAuthHeaders()
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Error al obtener la cosecha');
  }

  return data;
};

export const createCrop = async (cropData) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(cropData)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Error al crear la cosecha');
  }

  return data;
};

export const updateCrop = async (id, cropData) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(cropData)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Error al actualizar la cosecha');
  }

  return data;
};

export const deleteCrop = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Error al eliminar la cosecha');
  }

  return data;
};
