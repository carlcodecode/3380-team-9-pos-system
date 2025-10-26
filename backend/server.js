import http from 'http';
import url from 'url';
import pool, { testConnection } from './config/database.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import mealRoutes from './routes/mealRoutes.js';
import mealCategoryRoutes from './routes/mealCategoryRoutes.js';
import stockRoutes from './routes/stockRoutes.js';
import promoRoutes from './routes/promoRoutes.js';
import saleEventRoutes from './routes/saleEventRoutes.js'

const PORT = process.env.PORT || 3001;

// ============ MIDDLEWARE FUNCTIONS ============

// CORS middleware
function corsMiddleware(req, res) {
	const allowedOrigins = [
		'http://localhost:3000',
		'http://localhost:3001',
		'http://localhost:3002',
		'http://localhost:5173',
		process.env.FRONTEND_URL,
	].filter(Boolean);

	const origin = req.headers.origin;
	if (!origin || allowedOrigins.includes(origin)) {
		res.setHeader('Access-Control-Allow-Origin', origin || '*');
	}

	res.setHeader('Access-Control-Allow-Credentials', 'true');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

	// Handle preflight requests
	if (req.method === 'OPTIONS') {
		res.writeHead(200);
		res.end();
		return true;
	}

	return false;
}

// JSON body parser middleware
function jsonParserMiddleware(req, callback) {
	if (req.method === 'POST' || req.method === 'PUT') {
		let body = '';
		req.on('data', (chunk) => {
			body += chunk.toString();
		});
		req.on('end', () => {
			try {
				req.body = body ? JSON.parse(body) : {};
				callback();
			} catch (error) {
				callback(error);
			}
		});
	} else {
		req.body = {};
		callback();
	}
}

// Request logging middleware
function loggingMiddleware(req) {
	console.log(`${req.method} ${req.url}`);
}

// ============ ROUTING SYSTEM ============

function handleRequest(req, res) {
  // Parse URL
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // Enhanced response methods
  res.json = (data, statusCode = 200) => {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
  };

  res.status = (code) => {
    res.statusCode = code;
    return res;
  };

  // CORS handling
  if (corsMiddleware(req, res)) {
    return; // Preflight request handled
  }

  // Request logging
  loggingMiddleware(req);

  // Parse JSON body
  jsonParserMiddleware(req, (error) => {
    if (error) {
      return res.json({ error: 'Invalid JSON' }, 400);
    }

    // Route handling
    try {
      // Auth routes
      if (pathname.startsWith('/api/auth')) {
        return authRoutes(req, res, pathname, method);
      }

      // Admin routes
      if (pathname.startsWith('/api/admin')) {
        return adminRoutes(req, res, pathname, method);
      }

      // Customer routes
      if (pathname.startsWith('/api/customers')) {
        return customerRoutes(req, res, pathname, method);
      }

      // Meal routes
      if (pathname.startsWith('/api/meals')) {
        return mealRoutes(req, res, pathname, method);
      }

      // Meal category routes
      if (pathname.startsWith('/api/meal-categories')) {
        return mealCategoryRoutes(req, res, pathname, method);
      }

      // Stock routes
      if (pathname.startsWith('/api/stocks')) {
        return stockRoutes(req, res, pathname, method);
      }

      // Promo routes
      if (pathname.startsWith('/api/promotions')) {
        return promoRoutes(req, res, pathname, method);
      }

      // Health check
      if (pathname === '/api/health' && method === 'GET') {
        return handleHealthCheck(req, res);
      }

      // 404 handler
      res.json({ error: 'Route not found' }, 404);
    } catch (error) {
      console.error('Server error:', error);
      res.json({ error: 'Internal server error' }, 500);
    }
  });
	// Parse URL
	const parsedUrl = url.parse(req.url, true);
	const pathname = parsedUrl.pathname;
	const method = req.method;

	// Enhanced response methods
	res.json = (data, statusCode = 200) => {
		res.writeHead(statusCode, { 'Content-Type': 'application/json' });
		res.end(JSON.stringify(data));
	};

	res.status = (code) => {
		res.statusCode = code;
		return res;
	};

	// CORS handling
	if (corsMiddleware(req, res)) {
		return; // Preflight request handled
	}

	// Request logging
	loggingMiddleware(req);

	// Parse JSON body
	jsonParserMiddleware(req, (error) => {
		if (error) {
			return res.json({ error: 'Invalid JSON' }, 400);
		}

		// Route handling
		try {
			// Auth routes
			if (pathname.startsWith('/api/auth')) {
				return authRoutes(req, res, pathname, method);
			}

			// Admin routes
			if (pathname.startsWith('/api/admin')) {
				return adminRoutes(req, res, pathname, method);
			}

			// Meal routes
			if (pathname.startsWith('/api/meals')) {
				return mealRoutes(req, res, pathname, method);
			}

			// Meal category routes
			if (pathname.startsWith('/api/meal-categories')) {
				return mealCategoryRoutes(req, res, pathname, method);
			}

			// Stock routes
			if (pathname.startsWith('/api/stocks')) {
				return stockRoutes(req, res, pathname, method);
			}

			// Promo routes
			if (pathname.startsWith('/api/promotions')) {
				return promoRoutes(req, res, pathname, method);
			}

			if (pathname.startsWith('/api/sale-events')) {
				return saleEventRoutes(req, res, pathname, method);
			}

			// Health check
			if (pathname === '/api/health' && method === 'GET') {
				return handleHealthCheck(req, res);
			}

			// 404 handler
			res.json({ error: 'Route not found' }, 404);
		} catch (error) {
			console.error('Server error:', error);
			res.json({ error: 'Internal server error' }, 500);
		}
	});
}

// Health check endpoint
function handleHealthCheck(req, res) {
	pool
		.query('SELECT NOW() AS time')
		.then(([rows]) => {
			res.json({
				status: 'ok',
				message: 'Server and database connected',
				timestamp: rows[0].time,
				environment: process.env.NODE_ENV || 'development',
			});
		})
		.catch((error) => {
			res.json(
				{
					status: 'error',
					error: error.message,
				},
				500,
			);
		});
}

// ============ START SERVER ============

const server = http.createServer(handleRequest);

server.listen(PORT, async () => {
	console.log(`🚀 Server running on http://localhost:${PORT}`);
	console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
	console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);

	// Test database connection
	await testConnection();
});

export default server;
