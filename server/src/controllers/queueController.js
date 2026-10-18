import { db } from '../config/db.js';
import { emitQueueUpdate, emitTokenCall } from '../socket/queueSocket.js';

export const getLiveQueue = (req, res) => {
  try {
    const { department, doctorId } = req.query;
    let queue = db.get('queue');

    if (department) {
      queue = queue.filter(q => q.department.toLowerCase() === department.toLowerCase());
    }
    if (doctorId) {
      queue = queue.filter(q => q.doctorId === doctorId);
    }

    // Active tokens (excluding cancelled / completed)
    const activeQueue = queue.filter(q => q.status !== 'completed' && q.status !== 'cancelled' && q.status !== 'no_show');
    const currentlyServing = activeQueue.find(q => q.status === 'in_consultation') || null;
    const waitingList = activeQueue.filter(q => q.status === 'waiting');

    // Calculate dynamic wait time (15 mins per patient ahead)
    const avgConsultationMin = 15;

    // Check if current user has a token in this queue
    let patientTokenInfo = null;
    if (req.user) {
      const userToken = activeQueue.find(q => q.patientId === req.user.id);
      if (userToken) {
        const patientsAhead = waitingList.findIndex(q => q.token === userToken.token);
        const countAhead = patientsAhead === -1 ? 0 : patientsAhead;
        patientTokenInfo = {
          token: userToken.token,
          patientsAhead: countAhead,
          estimatedWaitMinutes: countAhead * avgConsultationMin,
          status: userToken.status,
          triageLevel: userToken.triageLevel,
          department: userToken.department,
          doctorName: userToken.doctorName
        };
      }
    }

    res.json({
      success: true,
      department: department || 'All Departments',
      currentlyServing: currentlyServing ? currentlyServing.token : 'None',
      currentlyServingPatient: currentlyServing,
      totalWaiting: waitingList.length,
      avgConsultationMin,
      waitingList,
      patientTokenInfo,
      allTokens: queue
    });
  } catch (err) {
    console.error('getLiveQueue error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch live queue.' });
  }
};

export const callNextToken = (req, res) => {
  try {
    const { department = 'Cardiology', doctorId } = req.body;
    let queue = db.get('queue');

    // Filter for department / doctor
    const deptTokens = queue.filter(q => 
      (!department || q.department.toLowerCase() === department.toLowerCase()) &&
      (!doctorId || q.doctorId === doctorId)
    );

    // 1. Current serving becomes completed
    const currentServing = deptTokens.find(q => q.status === 'in_consultation');
    if (currentServing) {
      db.update('queue', q => q.id === currentServing.id, q => ({
        ...q,
        status: 'completed'
      }));
    }

    // 2. Next waiting patient becomes in_consultation (prioritize Urgent -> Priority -> Normal)
    const waitingTokens = db.get('queue').filter(q => 
      q.status === 'waiting' &&
      (!department || q.department.toLowerCase() === department.toLowerCase()) &&
      (!doctorId || q.doctorId === doctorId)
    );

    // Sort by triage level urgency first, then order
    const triageOrder = { Urgent: 1, Priority: 2, Normal: 3 };
    waitingTokens.sort((a, b) => {
      const scoreA = triageOrder[a.triageLevel] || 3;
      const scoreB = triageOrder[b.triageLevel] || 3;
      if (scoreA !== scoreB) return scoreA - scoreB;
      return (a.order || 0) - (b.order || 0);
    });

    const nextPatient = waitingTokens[0] || null;

    if (nextPatient) {
      db.update('queue', q => q.id === nextPatient.id, q => ({
        ...q,
        status: 'in_consultation'
      }));

      // Notify the called patient
      db.insert('notifications', {
        id: `notif_${Date.now()}`,
        userId: nextPatient.patientId,
        title: 'Your Token Called!',
        message: `Token ${nextPatient.token} is now being called for consultation. Please proceed to ${nextPatient.doctorName || 'the consultation room'}.`,
        time: 'Just now',
        read: false,
        type: 'queue'
      });

      emitTokenCall({
        token: nextPatient.token,
        patientName: nextPatient.patientName,
        department: nextPatient.department,
        doctorName: nextPatient.doctorName
      });
    }

    emitQueueUpdate(department);

    res.json({
      success: true,
      message: nextPatient ? `Called next token ${nextPatient.token}.` : 'No more patients waiting in queue.',
      nextServingToken: nextPatient ? nextPatient.token : null,
      patient: nextPatient
    });
  } catch (err) {
    console.error('callNextToken error:', err);
    res.status(500).json({ success: false, message: 'Failed to advance queue.' });
  }
};

export const updateTokenStatus = (req, res) => {
  try {
    const { token } = req.params;
    const { status, triageLevel, notes } = req.body;

    const entry = db.findOne('queue', q => q.token === token);
    if (!entry) {
      return res.status(404).json({ success: false, message: 'Queue token entry not found.' });
    }

    db.update('queue', q => q.token === token, q => ({
      ...q,
      ...(status && { status }),
      ...(triageLevel && { triageLevel }),
      ...(notes && { notes })
    }));

    const updated = db.findOne('queue', q => q.token === token);
    emitQueueUpdate(updated.department);

    res.json({ success: true, message: 'Queue token updated.', queueEntry: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update queue token.' });
  }
};
