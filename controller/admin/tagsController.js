
const getPageTags = require('../../client/manychat/getTags')

 async function getPageTags(req, res) {
    try {
      const tags = await getPageTags.getPageInfo();
      res.json(tags);
    } catch (err) {
      console.error('Error fetching users', err.stack);
      res.status(500).send('Server error');
    }
  }

module.exports = {
    getPageTags
}