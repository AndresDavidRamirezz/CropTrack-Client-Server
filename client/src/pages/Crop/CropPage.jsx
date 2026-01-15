import React, { useState, useEffect } from 'react';
import CropForm from '../../components/Crop/Form/CropForm';
import CropList from '../../components/Crop/List/CropList';
import './CropPage.css';

const API_URL = 'http://localhost:4000/api/crops';

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
      console.log('🔍 [CROP-PAGE] userData:', userData);
      return {
        usuario_creador_id: userData?.id,
        empresa: userData?.empresa
      };
    } catch (err) {
      console.error('❌ [CROP-PAGE] Error obteniendo userData:', err);
      return { usuario_creador_id: null, empresa: null };
    }
  };

  // Cargar cosechas al montar el componente
  const fetchCrops = async () => {
    const { usuario_creador_id } = getUserData();

    if (!usuario_creador_id) {
      setError('No se pudo identificar al usuario');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🟡 [CROP-PAGE] Cargando cosechas para usuario:', usuario_creador_id);

      const response = await fetch(`${API_URL}/user/${usuario_creador_id}`);
      const data = await response.json();

      console.log('📥 [CROP-PAGE] Response status:', response.status);
      console.log('📥 [CROP-PAGE] Data:', data);

      if (response.ok) {
        setCrops(data);
        console.log('✅ [CROP-PAGE] Cosechas cargadas:', data.length);
      } else {
        throw new Error(data.error || 'Error al cargar las cosechas');
      }
    } catch (err) {
      console.error('❌ [CROP-PAGE] Error al cargar cosechas:', err);
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

      console.log('🟡 [CROP-PAGE] Creando cosecha:', cropData);

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cropData)
      });

      const data = await response.json();
      console.log('📥 [CROP-PAGE] Response:', response.status, data);

      if (response.ok) {
        console.log('✅ [CROP-PAGE] Cosecha creada exitosamente');
        await fetchCrops();
        setShowForm(false);
      } else {
        throw new Error(data.error || 'Error al crear la cosecha');
      }
    } catch (err) {
      console.error('❌ [CROP-PAGE] Error al crear cosecha:', err);
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
      console.log('🟡 [CROP-PAGE] Actualizando cosecha:', id, formData);

      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      console.log('📥 [CROP-PAGE] Response:', response.status, data);

      if (response.ok) {
        console.log('✅ [CROP-PAGE] Cosecha actualizada exitosamente');
        await fetchCrops();
        setEditingCrop(null);
        setShowForm(false);
      } else {
        throw new Error(data.error || 'Error al actualizar la cosecha');
      }
    } catch (err) {
      console.error('❌ [CROP-PAGE] Error al actualizar cosecha:', err);
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
      console.log('🟡 [CROP-PAGE] Eliminando cosecha:', id);

      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      console.log('📥 [CROP-PAGE] Response:', response.status, data);

      if (response.ok) {
        console.log('✅ [CROP-PAGE] Cosecha eliminada exitosamente');
        await fetchCrops();
      } else {
        throw new Error(data.error || 'Error al eliminar la cosecha');
      }
    } catch (err) {
      console.error('❌ [CROP-PAGE] Error al eliminar cosecha:', err);
      setError(err.message || 'Error al eliminar la cosecha');
    } finally {
      setLoading(false);
    }
  };

  // Activar modo edicion
  const handleEdit = (crop) => {
    setEditingCrop(crop);
    setShowForm(true);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cancelar edicion / crear
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
          <h1>Gestion de Cosechas</h1>
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
          <button className="error-close" onClick={() => setError(null)}>x</button>
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
