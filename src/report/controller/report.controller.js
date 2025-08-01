const Claim = require('../../claim/models/claim.model');
const { Parser } = require('json2csv'); // for CSV export

exports.getFinalReports = async (req, res) => {
  try {
    const {
      status = 'approved',
      startDate,
      endDate,
      userId
    } = req.query;

    const filter = { status };

    if (startDate && endDate) {
      filter.updatedAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    if (userId) {
      filter.userId = userId;
    }

    const claims = await Claim.find(filter).populate('userId');

    res.json({ success: true, claims });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.downloadReport = async (req, res) => {
  try {
    const claims = await Claim.find({ status: 'approved' }).populate('userId');

    const data = claims.map(claim => ({
      user: claim.userId.name,
      postId: claim.postId,
      approvedAmount: claim.expectedEarnings - claim.deductions.reduce((a, b) => a + b.amount, 0),
      totalDeductions: claim.deductions.reduce((a, b) => a + b.amount, 0),
      status: claim.status,
      approvedAt: claim.updatedAt
    }));

    const parser = new Parser();
    const csv = parser.parse(data);

    res.header('Content-Type', 'text/csv');
    res.attachment('final_report.csv');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
