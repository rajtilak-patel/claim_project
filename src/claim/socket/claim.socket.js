let lockedClaims = {};

exports.setupClaimSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('🔌 New socket connected:', socket.id);

    // Lock Claim
    socket.on('lock_claim', ({ claimId, user }) => {
      if (!lockedClaims[claimId]) {
        lockedClaims[claimId] = socket.id;
        io.emit('claim_locked', { claimId, user });
      } else {
        socket.emit('claim_locked_by_other', { claimId });
      }
    });

    // Unlock Claim
    socket.on('unlock_claim', ({ claimId }) => {
      if (lockedClaims[claimId] === socket.id) {
        delete lockedClaims[claimId];
        io.emit('claim_unlocked', { claimId });
      }
    });

    // On disconnect
    socket.on('disconnect', () => {
      for (const [claimId, socketId] of Object.entries(lockedClaims)) {
        if (socketId === socket.id) {
          delete lockedClaims[claimId];
          io.emit('claim_unlocked', { claimId });
        }
      }
    });
  });

  console.log('Claim socket setup complete');
};
