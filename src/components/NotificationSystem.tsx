// src/components/NotificationSystem.tsx
import React, { useEffect } from 'react';
import { useNotification, type NotificationType } from '../context/NotificationContext';

// --- FUNCIÓN PARA INYECTAR CSS DE FORMA SEGURA ---
const injectCSS = () => {
  const cssId = 'notification-system-styles';
  if (!document.getElementById(cssId)) {
    const style = document.createElement('style');
    style.type = 'text/css';
    style.id = cssId;
    style.innerHTML = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  }
};

const NotificationSystem: React.FC = () => {
  const { notifications } = useNotification();

  // Inyectamos el CSS solo una vez cuando el componente se monta
  useEffect(() => {
    injectCSS();
  }, []);

  const getNotificationStyle = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return { borderLeftColor: 'var(--accent-yellow)', backgroundColor: '#3a3a00' };
      case 'error':
        return { borderLeftColor: 'var(--accent-red)', backgroundColor: '#4a0000' };
      case 'info':
        return { borderLeftColor: 'var(--text-secondary)', backgroundColor: '#333' };
      default:
        return {};
    }
  };

  return (
    <div style={styles.container}>
      {notifications.map(notification => (
        <div 
          key={notification.id} 
          style={{ ...styles.notification, ...getNotificationStyle(notification.type) }}
        >
          {notification.message}
        </div>
      ))}
    </div>
  );
};

// Estilos en línea para que sea rápido
const styles = {
  container: {
    position: 'fixed' as const,
    top: '20px',
    right: '20px',
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '10px',
  },
  notification: {
    padding: '15px 20px',
    borderLeft: '5px solid',
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-body)',
    fontSize: '1em',
    boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
    minWidth: '250px',
    animation: 'slideIn 0.3s ease-out',
  }
};

export default NotificationSystem;