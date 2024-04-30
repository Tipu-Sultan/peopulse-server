const User = require('../models/users');

async function AlgoliaSearch(req, res) {
  const { query } = req.params;
  try {
    const result = await User.find({
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { firstname: { $regex: query, $options: 'i' } },
        { lastname: { $regex: query, $options: 'i' } },
      ],
    });
    res.json(result);
  } catch (error) {
    console.error('MongoDB search error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}


module.exports = {
  AlgoliaSearch,
};
