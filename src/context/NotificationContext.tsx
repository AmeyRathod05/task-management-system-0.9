"use client";
import React, { createContext, useContext, useState, ReactNode } from 'react';
import Notification from '../components/ui/notification/Notification';

type NotificationType = 'success' | 'info' | 'warning' | 'error';

interface NotificationContextType {
  showNotification: (type: NotificationType, title: string, description?: string) => void;
  hideNotification: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notification, setNotification] = useState<{
    visible: boolean;
    type: NotificationType;
    title: string;
    description?: string;
  } | null>(null);

  const showNotification = (type: NotificationType, title: string, description?: string) => {
    setNotification({ visible: true, type, title, description });
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      hideNotification();
    }, 3000);
  };

  const hideNotification = () => {
    setNotification(null);
  };

  return (
    <NotificationContext.Provider value={{ showNotification, hideNotification }}>
      {children}
      {notification && notification.visible && (
        <Notification
          variant={notification.type}
          title={notification.title}
          description={notification.description}
        />
      )}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
