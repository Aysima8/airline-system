const express = require('express');
const router = express.Router();
const axios = require('axios');
const jwt = require('jsonwebtoken');

// Docker içinde localhost çalışmaz. Container adıyla konuşmak gerekir.
const KEYCLOAK_URL = process.env.KEYCLOAK_URL || 'http://keycloak:8080';
const KEYCLOAK_REALM = process.env.KEYCLOAK_REALM || 'airline';

// Register/Admin işleri için service-account client
const KEYCLOAK_ADMIN_CLIENT_ID = process.env.KEYCLOAK_ADMIN_CLIENT_ID || 'airline-gateway';
const KEYCLOAK_ADMIN_CLIENT_SECRET =
  process.env.KEYCLOAK_CREDENTIALS_SECRET ||
  process.env.KEYCLOAK_CLIENT_SECRET ||
  '';

// Login (password grant) için genellikle public client kullanılır
const KEYCLOAK_WEB_CLIENT_ID = process.env.KEYCLOAK_WEB_CLIENT_ID || 'airline-web';

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: User login
 *     tags: [Authentication]
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body || {};

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username ve password gerekli'
      });
    }

    const tokenUrl = `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token`;

    // Login için genellikle airline-web kullanılır (public client)
    const params = {
      grant_type: 'password',
      client_id: KEYCLOAK_WEB_CLIENT_ID,
      username,
      password,
      scope: 'openid profile email'
    };

    // Eğer airline-web confidential ise secret gerekebilir (opsiyonel)
    if (process.env.KEYCLOAK_WEB_CLIENT_SECRET) {
      params.client_secret = process.env.KEYCLOAK_WEB_CLIENT_SECRET;
    }

    const response = await axios.post(tokenUrl, new URLSearchParams(params), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const { access_token, refresh_token, expires_in } = response.data;
    const decoded = jwt.decode(access_token);

    return res.status(200).json({
      success: true,
      data: {
        token: access_token,
        refreshToken: refresh_token,
        expiresIn: expires_in,
        user: {
          id: decoded?.sub,
          username: decoded?.preferred_username,
          email: decoded?.email,
          name: decoded?.name || decoded?.preferred_username,
          roles: decoded?.realm_access?.roles || []
        }
      }
    });
  } catch (err) {
    console.error('Login error FULL:', err.response?.data || err.message);
    return res.status(401).json({
      success: false,
      message:
        err.response?.data?.error_description ||
        err.response?.data?.error ||
        'Giriş başarısız'
    });
  }
});

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Register new user
 *     tags: [Authentication]
 */
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, firstName, lastName } = req.body || {};

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username, email ve password gerekli'
      });
    }

    // Admin token al (client_credentials)
    if (!KEYCLOAK_ADMIN_CLIENT_SECRET) {
      return res.status(500).json({
        success: false,
        message:
          'KEYCLOAK_ADMIN_CLIENT_SECRET (KEYCLOAK_CREDENTIALS_SECRET) boş. Keycloak client secret env ayarlanmalı.'
      });
    }

    const adminTokenUrl = `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token`;

    const adminTokenResponse = await axios.post(
      adminTokenUrl,
      new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: KEYCLOAK_ADMIN_CLIENT_ID,
        client_secret: KEYCLOAK_ADMIN_CLIENT_SECRET
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    const adminToken = adminTokenResponse.data.access_token;

    // Kullanıcı oluştur
    const createUserUrl = `${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/users`;

    const createResponse = await axios.post(
      createUserUrl,
      {
        username,
        email,
        firstName: firstName || username,
        lastName: lastName || '',
        enabled: true,
        credentials: [
          {
            type: 'password',
            value: password,
            temporary: false
          }
        ]
        // realmRoles burada bazen çalışmaz; şimdilik kaldırdım ki create patlamasın.
        // Rol atamak gerekiyorsa ayrı endpoint ile yapılır.
      },
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Keycloak 201 döner, id Location header'da olur
    const locationHeader = createResponse.headers?.location || createResponse.headers?.Location;
    let userId = null;
    if (locationHeader) {
      const parts = locationHeader.split('/');
      userId = parts[parts.length - 1];
    }

    // Welcome email kuyruğuna ekle (RabbitMQ)
    try {
      const amqp = require('amqplib');

      // Docker içinde rabbitmq host adıyla bağlan
      const rabbitUrl = process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672';
      const connection = await amqp.connect(rabbitUrl);
      const channel = await connection.createChannel();

      const queue = 'welcome-queue';
      await channel.assertQueue(queue, { durable: true });

      const message = {
        userId: userId || username,
        email,
        firstName: firstName || username,
        lastName: lastName || '',
        timestamp: new Date().toISOString()
      };

      channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), { persistent: true });

      await channel.close();
      await connection.close();
    } catch (queueError) {
      console.error('Welcome email queue hatası:', queueError.response?.data || queueError.message);
    }

    return res.status(201).json({
      success: true,
      message: 'Kullanıcı başarıyla oluşturuldu'
    });
  } catch (error) {
    console.error('Register error FULL:', error.response?.data || error.message);

    // Keycloak hata formatları: error, error_description, message...
    const msg =
      error.response?.data?.errorMessage ||
      error.response?.data?.error_description ||
      error.response?.data?.error ||
      error.response?.data?.message ||
      'Kayıt başarısız';

    return res.status(400).json({
      success: false,
      message: msg
    });
  }
});

// Token yenileme endpoint
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body || {};

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token gerekli'
      });
    }

    const tokenUrl = `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token`;

    // refresh genelde frontend client ile yapılır
    const response = await axios.post(
      tokenUrl,
      new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: KEYCLOAK_WEB_CLIENT_ID,
        refresh_token: refreshToken,
        ...(process.env.KEYCLOAK_WEB_CLIENT_SECRET
          ? { client_secret: process.env.KEYCLOAK_WEB_CLIENT_SECRET }
          : {})
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    return res.status(200).json({
      success: true,
      data: {
        token: response.data.access_token,
        refreshToken: response.data.refresh_token,
        expiresIn: response.data.expires_in
      }
    });
  } catch (error) {
    console.error('Refresh error FULL:', error.response?.data || error.message);
    return res.status(401).json({
      success: false,
      message: 'Token yenileme başarısız'
    });
  }
});

// Logout endpoint
router.post('/logout', async (req, res) => {
  try {
    const { refreshToken } = req.body || {};

    if (refreshToken) {
      const logoutUrl = `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/logout`;

      await axios.post(
        logoutUrl,
        new URLSearchParams({
          client_id: KEYCLOAK_WEB_CLIENT_ID,
          refresh_token: refreshToken,
          ...(process.env.KEYCLOAK_WEB_CLIENT_SECRET
            ? { client_secret: process.env.KEYCLOAK_WEB_CLIENT_SECRET }
            : {})
        }),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );
    }

    return res.status(200).json({
      success: true,
      message: 'Çıkış başarılı'
    });
  } catch (error) {
    // logout fail olsa bile ok dönmek normal
    return res.status(200).json({
      success: true,
      message: 'Çıkış başarılı'
    });
  }
});

module.exports = router;
