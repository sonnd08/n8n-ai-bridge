require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// N8N Configuration
const N8N_API_TOKEN = process.env.N8N_API;
const N8N_BASE_URL = process.env.N8N_BASE_URL || 'https://n8n.sonnd.com/api/v1';

// Configure axios for n8n API
const n8nApi = axios.create({
  baseURL: N8N_BASE_URL,
  headers: {
    'X-N8N-API-KEY': N8N_API_TOKEN,
    'Content-Type': 'application/json'
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'n8n AI Bridge is running' });
});

// Test n8n connection and check permissions
async function testN8nConnection() {
  console.log('\n🔍 Testing n8n connection...');
  
  const permissions = {
    connection: false,
    workflows: { read: false, write: false },
    executions: { read: false },
    credentials: { read: false, write: false },
    users: { read: false }
  };

  try {
    // Test basic connection using workflows endpoint
    const response = await n8nApi.get('/workflows');
    permissions.connection = true;
    console.log('✅ n8n connection successful');
    
    // Test workflows permissions
    try {
      await n8nApi.get('/workflows');
      permissions.workflows.read = true;
      console.log('✅ Workflows READ permission: Available');
    } catch (error) {
      console.log('❌ Workflows READ permission: Denied');
    }

    try {
      // Test workflow creation (we'll delete it immediately)
      const testWorkflow = {
        name: 'AI-Bridge-Test-Workflow',
        nodes: [
          {
            parameters: {},
            name: 'Start',
            type: 'n8n-nodes-base.start',
            typeVersion: 1,
            position: [240, 300]
          }
        ],
        connections: {},
        settings: {}
      };
      
      const createResponse = await n8nApi.post('/workflows', testWorkflow);
      permissions.workflows.write = true;
      console.log('✅ Workflows WRITE permission: Available');
      
      // Clean up test workflow
      await n8nApi.delete(`/workflows/${createResponse.data.id}`);
      console.log('🧹 Test workflow cleaned up');
    } catch (error) {
      console.log('❌ Workflows WRITE permission: Denied');
    }

    // Test executions permissions
    try {
      await n8nApi.get('/executions');
      permissions.executions.read = true;
      console.log('✅ Executions READ permission: Available');
    } catch (error) {
      console.log('❌ Executions READ permission: Denied');
    }

    // Test credentials permissions
    try {
      await n8nApi.get('/credentials');
      permissions.credentials.read = true;
      console.log('✅ Credentials READ permission: Available');
    } catch (error) {
      console.log('❌ Credentials READ permission: Denied');
    }

    // Test users permissions (might not be available in all n8n versions)
    try {
      await n8nApi.get('/users');
      permissions.users.read = true;
      console.log('✅ Users READ permission: Available');
    } catch (error) {
      console.log('❌ Users READ permission: Denied');
    }

  } catch (error) {
    console.log('❌ n8n connection failed:', error.message);
    console.log('Please check your N8N_API token and N8N_BASE_URL');
  }

  return permissions;
}

// API Endpoints

// Get n8n connection status and permissions
app.get('/api/n8n/status', async (req, res) => {
  try {
    const permissions = await testN8nConnection();
    res.json({
      status: 'success',
      permissions,
      baseUrl: N8N_BASE_URL
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Get all workflows
app.get('/api/workflows', async (req, res) => {
  try {
    const response = await n8nApi.get('/workflows');
    res.json({
      status: 'success',
      data: response.data
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Create a new workflow
app.post('/api/workflows', async (req, res) => {
  try {
    const response = await n8nApi.post('/workflows', req.body);
    res.json({
      status: 'success',
      data: response.data
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Get specific workflow
app.get('/api/workflows/:id', async (req, res) => {
  try {
    const response = await n8nApi.get(`/workflows/${req.params.id}`);
    res.json({
      status: 'success',
      data: response.data
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Update workflow
app.put('/api/workflows/:id', async (req, res) => {
  try {
    const response = await n8nApi.put(`/workflows/${req.params.id}`, req.body);
    res.json({
      status: 'success',
      data: response.data
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Execute workflow
app.post('/api/workflows/:id/execute', async (req, res) => {
  try {
    const response = await n8nApi.post(`/workflows/${req.params.id}/execute`);
    res.json({
      status: 'success',
      data: response.data
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Get executions
app.get('/api/executions', async (req, res) => {
  try {
    const response = await n8nApi.get('/executions');
    res.json({
      status: 'success',
      data: response.data
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Start server
async function startServer() {
  app.listen(PORT, async () => {
    console.log(`🚀 n8n AI Bridge server running on port ${PORT}`);
    console.log(`📍 Base URL: http://localhost:${PORT}`);
    console.log(`🔗 n8n API URL: ${N8N_BASE_URL}`);
    
    // Test n8n connection on startup
    await testN8nConnection();
    
    console.log(`\n📖 Available endpoints:`);
    console.log(`   GET  /health - Health check`);
    console.log(`   GET  /api/n8n/status - n8n connection status`);
    console.log(`   GET  /api/workflows - List all workflows`);
    console.log(`   POST /api/workflows - Create new workflow`);
    console.log(`   GET  /api/workflows/:id - Get specific workflow`);
    console.log(`   PUT  /api/workflows/:id - Update workflow`);
    console.log(`   POST /api/workflows/:id/execute - Execute workflow`);
    console.log(`   GET  /api/executions - List executions`);
    console.log(`\n🤖 Ready for AI interactions!`);
  });
}

startServer(); 