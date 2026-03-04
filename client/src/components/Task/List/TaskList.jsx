import React from 'react';
import TaskCard from '../Card/TaskCard';
import './TaskList.css';

const TaskList = ({ tasks, crops, onSelect, loading }) => {
  if (loading) {
    return (
      <div className="task-list-loading">
        <div className="loading-spinner"></div>
        <p>Cargando tareas...</p>
      </div>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <div className="task-list-empty">
        <div className="empty-icon">📋</div>
        <h3>No hay tareas registradas</h3>
        <p>Crea tu primera tarea usando el formulario de arriba.</p>
      </div>
    );
  }

  return (
    <div className="task-list">
      <div className="task-list-header">
        <h2>Mis Tareas</h2>
        <span className="task-count">{tasks.length} tarea{tasks.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="task-grid">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            crops={crops}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
};

export default TaskList;
