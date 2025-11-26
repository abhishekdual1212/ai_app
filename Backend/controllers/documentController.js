const Document = require('../models/Document');
const UserSession = require('../models/UserSession');
const Service = require('../models/Service');

exports.createDocument = async (req, res) => {
  const { sessionId, documentData } = req.body;

  const session = await UserSession.findById(sessionId);
  if (!session) return res.status(404).json({ success: false, message: 'Session not found' });

  const mockContent = `
${session.service_type.toUpperCase()} DOCUMENT
Generated for: ${documentData.clientName || 'Client'}
Service Type: ${session.service_type}
Date: ${new Date().toISOString()}
[Mock legal document content would go here]
`;

  const document = await Document.create({
    session_id: session._id,
    service_type: session.service_type,
    content: mockContent
  });

  res.json({ success: true, data: { documentId: document._id, content: mockContent } });
};

exports.quickGenerate = async (req, res) => {
  const { userId, serviceType } = req.body;
  const service = await Service.findOne({ type: serviceType, status: 'active' });

  const session = await UserSession.create({
    user_id: userId,
    service_id: service._id,
    service_type: serviceType
  });

  const content = `Quick document for ${serviceType}, generated on ${new Date().toISOString()}`;

  const doc = await Document.create({
    session_id: session._id,
    service_type: serviceType,
    content
  });

  res.json({ success: true, data: { documentId: doc._id, content } });
};

exports.getDocumentStatus = async (req, res) => {
  const doc = await Document.findById(req.params.id);
  if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });
  res.json({ success: true, data: { status: doc.status } });
};
