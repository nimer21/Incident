export default function handler(req, res) {
    if (req.method === 'GET') {
      res.status(200).send('Backend is healthy');
    } else {
      res.status(405).send('Method Not Allowed');
    }
  }
  