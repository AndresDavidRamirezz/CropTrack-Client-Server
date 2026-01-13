import React, { useState, useEffect } from 'react';
import CropForm from '../../components/Crop/Form/CropForm';
import CropList from '../../components/Crop/List/CropList';
import { getAllCrops, createCrop, updateCrop, deleteCrop } from '../../services/cropService';
import './CropPage.css';

const CropPage = () => {
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingCrop, setEditingCrop] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // Obtener datos del usuario logueado
  const getUserData = () => {
    try {
      const userData = JSON.parse(localStorage.getItem('userData'));
      return {
        usuario_creador_id: userData?.id,
        empresa: userData?.empresa
      };
    } catch {
      return { usuario_creador_id: null, empresa: null };
    }
  };

  // Cargar cosechas al montar el componente
  const fetchCrops = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getAllCrops();
      setCrops(data);
    } catch (err) {
      console.error('Error al cargar cosechas:', err);
      setError(err.message || 'Error al cargar las cosechas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCrops();
  }, []);

  // Crear nueva cosecha
  const handleCreate = async (formData) => {
    setLoading(true);
    setError(null);

    try {
      const { usuario_creador_id, empresa } = getUserData();

      if (!usuario_creador_id || !empresa) {
        throw new Error('No se pudo obtener la información del usuario');
      }

      const cropData = {
        ...formData,
        empresa,
        usuario_creador_id
      };

      await createCrop(cropData);
      await fetchCrops();
      setShowForm(false);
    } catch (err) {
      console.error('Error al crear cosecha:', err);
      setError(err.message || 'Error al crear la cosecha');
    } finally {
      setLoading(false);
    }
  };

  // Actualizar cosecha existente
  const handleUpdate = async (id, formData) => {
    setLoading(true);
    setError(null);

    try {
      await updateCrop(id, formData);
      await fetchCrops();
      setEditingCrop(null);
      setShowForm(false);
    } catch (err) {
      console.error('Error al actualizar cosecha:', err);
      setError(err.message || 'Error al actualizar la cosecha');
    } finally {
      setLoading(false);
    }
  };

  // Eliminar cosecha
  const handleDelete = async (id) => {
    setLoading(true);
    setError(null);

    try {
      await deleteCrop(id);
      await fetchCrops();
    } catch (err) {
      console.error('Error al eliminar cosecha:', err);
      setError(err.message || 'Error al eliminar la cosecha');
    } finally {
      setLoading(false);
    }
  };

  // Activar modo edición
  const handleEdit = (crop) => {
    setEditingCrop(crop);
    setShowForm(true);
    setError(null);
    // Scroll al formulario
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cancelar edición / crear
  const handleCancel = () => {
    setEditingCrop(null);
    setShowForm(false);
    setError(null);
  };

  // Toggle mostrar formulario
  const handleToggleForm = () => {
    if (showForm) {
      handleCancel();
    } else {
      setShowForm(true);
      setEditingCrop(null);
    }
  };

  return (
    <div className="crop-page">
      <header className="crop-page-header">
        <div className="header-content">
          <h1>Gestión de Cosechas</h1>
          <p>Administra todos tus cultivos en un solo lugar</p>
        </div>
        <button
          className={`btn-toggle-form ${showForm ? 'active' : ''}`}
          onClick={handleToggleForm}
        >
          {showForm ? 'Cerrar Formulario' : '+ Nueva Cosecha'}
        </button>
      </header>

      {error && (
        <div className="error-banner">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
          <button className="error-close" onClick={() => setError(null)}>×</button>
        </div>
      )}

      <div className="crop-page-content">
        {showForm && (
          <CropForm
            initialData={editingCrop}
            onSubmit={editingCrop ? handleUpdate : handleCreate}
            onCancel={handleCancel}
            loading={loading}
          />
        )}

        <CropList
          crops={crops}
          onEdit={handleEdit}
          onDelete={handleDelete}
          loading={loading && !showForm}
        />
      </div>
    </div>
  );
};

export default CropPage;
