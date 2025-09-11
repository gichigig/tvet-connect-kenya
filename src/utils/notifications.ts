// Sample notifications utilities

export const createSampleNotifications = () => {
  return [
    {
      id: '1',
      title: 'Welcome!',
      message: 'Welcome to the system',
      type: 'info',
      timestamp: new Date().toISOString()
    }
  ];
};