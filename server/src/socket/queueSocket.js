let ioInstance = null;

export const initSocket = (io) => {
  ioInstance = io;

  io.on('connection', (socket) => {
    // console.log(`🔌 Client connected to MediFlow socket: ${socket.id}`);

    socket.on('join_department', (department) => {
      if (department) {
        socket.join(department.toLowerCase());
      }
    });

    socket.on('disconnect', () => {
      // console.log(`Client disconnected: ${socket.id}`);
    });
  });
};

export const emitQueueUpdate = (department) => {
  if (!ioInstance) return;
  // Broadcast to all clients
  ioInstance.emit('queue_updated', {
    department,
    timestamp: new Date().toISOString()
  });

  if (department) {
    ioInstance.to(department.toLowerCase()).emit('dept_queue_updated', {
      department,
      timestamp: new Date().toISOString()
    });
  }
};

export const emitTokenCall = (data) => {
  if (!ioInstance) return;
  ioInstance.emit('token_called', {
    ...data,
    timestamp: new Date().toISOString()
  });
};
