const axios = require('axios');

// Request forward logic - gelen istekleri ilgili servislere yönlendirir
const proxy = async (req, res, targetUrl) => {
  try {
    // req.originalUrl: /api/v1/flights/search?origin=IST
    // req.baseUrl: /api/v1/flights
    // req.path: /search
    // Target service bekliyor: /api/flights/search

    // /api/v1/flights -> /api/flights (sadece path, query string olmadan)
    const pathWithQuery = req.originalUrl.replace('/api/v1/', '/api/');
    const pathOnly = pathWithQuery.split('?')[0];
    const url = `${targetUrl}${pathOnly}`;

    const config = {
      method: req.method,
      url: url,
      headers: {
        ...req.headers,
        host: new URL(targetUrl).host
      },
      params: req.query,
      data: req.body
    };

    const response = await axios(config);

    res.status(response.status).json(response.data);
  } catch (error) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({
        success: false,
        message: 'Service iletişiminde hata oluştu',
        error: error.message
      });
    }
  }
};

module.exports = proxy;
