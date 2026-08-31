const crypto = require('crypto');
const Certificate = require('../models/Certificate');
const EventRegistration = require('../models/EventRegistration');
const Winner = require('../models/Winner');
const Event = require('../models/Event');
const User = require('../models/User');

const generateCertificateId = () => {
  const year = new Date().getFullYear();
  const rand = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `CERT-${year}-${rand}`;
};

// GET /api/certificates/my-certificates — Fetch logged in student's verified certificates
exports.getMyCertificates = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // 1. Check for any verified attendances that don't have certificates yet, and auto-issue them
    const verifiedRegistrations = await EventRegistration.find({
      userId,
      status: 'ATTENDED',
    }).populate('eventId');

    for (const reg of verifiedRegistrations) {
      if (!reg.eventId) continue;
      const existing = await Certificate.findOne({
        userId,
        eventId: reg.eventId._id,
        type: 'PARTICIPATION',
      });

      if (!existing) {
        let certId;
        let exists = true;
        while (exists) {
          certId = generateCertificateId();
          exists = await Certificate.findOne({ certificateId: certId });
        }

        await Certificate.create({
          certificateId: certId,
          userId,
          eventId: reg.eventId._id,
          type: 'PARTICIPATION',
          title: `Certificate of Participation — ${reg.eventId.name}`,
          issueDate: new Date(),
        });
      }
    }

    // 2. Check for any Winner records and auto-issue Winner certificates
    const winnerRecords = await Winner.find({ userId }).populate('eventId');
    for (const win of winnerRecords) {
      if (!win.eventId) continue;
      const winType = win.position === '1st Place' ? 'WINNER_1ST' : win.position === '2nd Place' ? 'WINNER_2ND' : 'WINNER_3RD';
      
      const existingWinCert = await Certificate.findOne({
        userId,
        eventId: win.eventId._id,
        type: winType,
      });

      if (!existingWinCert) {
        let certId;
        let exists = true;
        while (exists) {
          certId = generateCertificateId();
          exists = await Certificate.findOne({ certificateId: certId });
        }

        await Certificate.create({
          certificateId: certId,
          userId,
          eventId: win.eventId._id,
          type: winType,
          title: `Certificate of Excellence (${win.position}) — ${win.eventId.name}`,
          position: win.position,
          marks: win.marks,
          issueDate: new Date(),
        });
      }
    }

    // Fetch all certificates for the user
    const certificates = await Certificate.find({ userId, isRevoked: false })
      .populate('eventId', 'name date location category image description')
      .populate('userId', 'firstName lastName department year className rollNumber userId')
      .sort({ createdAt: -1 });

    res.json(certificates);
  } catch (error) {
    next(error);
  }
};

// GET /api/certificates/verify/:certificateId — Public verification endpoint
exports.verifyCertificate = async (req, res, next) => {
  try {
    const { certificateId } = req.params;
    const cert = await Certificate.findOne({ certificateId: certificateId.trim().toUpperCase() })
      .populate('eventId', 'name date location category description')
      .populate('userId', 'firstName lastName department year className rollNumber userId');

    if (!cert) {
      return res.status(404).json({
        verified: false,
        message: 'Certificate not found. This credential may be invalid or not yet issued.',
      });
    }

    if (cert.isRevoked) {
      return res.status(410).json({
        verified: false,
        message: 'This certificate has been officially revoked by the campus administration.',
      });
    }

    res.json({
      verified: true,
      certificate: {
        certificateId: cert.certificateId,
        type: cert.type,
        title: cert.title,
        position: cert.position,
        marks: cert.marks,
        issueDate: cert.issueDate,
        issuedBy: cert.issuedBy,
        recipient: {
          name: `${cert.userId.firstName} ${cert.userId.lastName}`,
          userId: cert.userId.userId,
          department: cert.userId.department,
          year: cert.userId.year,
          className: cert.userId.className,
          rollNumber: cert.userId.rollNumber,
        },
        event: {
          name: cert.eventId.name,
          date: cert.eventId.date,
          location: cert.eventId.location,
          category: cert.eventId.category,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/certificates/events/:eventId/issue-all — Issue certificates for all verified event attendees
exports.issueEventCertificates = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found.' });

    const attendees = await EventRegistration.find({
      eventId,
      status: 'ATTENDED',
    });

    let issuedCount = 0;

    for (const att of attendees) {
      const existing = await Certificate.findOne({
        userId: att.userId,
        eventId,
        type: 'PARTICIPATION',
      });

      if (!existing) {
        let certId;
        let exists = true;
        while (exists) {
          certId = generateCertificateId();
          exists = await Certificate.findOne({ certificateId: certId });
        }

        await Certificate.create({
          certificateId: certId,
          userId: att.userId,
          eventId,
          type: 'PARTICIPATION',
          title: `Certificate of Participation — ${event.name}`,
          issueDate: new Date(),
        });
        issuedCount++;
      }
    }

    res.json({
      message: `Successfully issued ${issuedCount} certificates for event: ${event.name}`,
      issuedCount,
      totalAttendees: attendees.length,
    });
  } catch (error) {
    next(error);
  }
};
