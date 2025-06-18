# AI Instructions for n8n Bridge

## Purpose
This is a Node.js server that bridges AI code editors with n8n automation platform. It allows AI assistants to create, manage, and execute n8n workflows programmatically.

## Server Capabilities

### Connection Management
- Tests n8n API connection on startup
- Checks and reports available permissions
- Provides health status endpoints

### Available Permissions (varies by n8n setup)
- **Workflows**: Read and write operations
- **Executions**: View execution history and results
- **Credentials**: Access to stored credentials (if permitted)
- **Users**: User management (if available)

## API Endpoints

### Status & Health
- `GET /health` - Server health check
- `GET /api/n8n/status` - n8n connection status and permissions

### Workflows
- `GET /api/workflows` - List all workflows
- `POST /api/workflows` - Create new workflow
- `GET /api/workflows/:id` - Get specific workflow
- `PUT /api/workflows/:id` - Update existing workflow
- `POST /api/workflows/:id/execute` - Execute workflow

### Executions
- `GET /api/executions` - List workflow executions

## How AI Should Use This Bridge

### 1. Check Connection First
Always verify n8n connection and permissions:
```javascript
GET /api/n8n/status
```

### 2. Workflow Creation
When creating workflows, use proper n8n node structures:
```javascript
POST /api/workflows
{
  "name": "My Workflow",
  "nodes": [...],
  "connections": {...},
  "active": false
}
```

### 3. Node Structure
Each n8n node must have:
- `name`: Unique identifier
- `type`: Node type (e.g., 'n8n-nodes-base.httpRequest')
- `parameters`: Node configuration
- `position`: [x, y] coordinates
- `typeVersion`: Node version

### 4. Common Node Types
- `n8n-nodes-base.start` - Workflow trigger
- `n8n-nodes-base.httpRequest` - HTTP requests
- `n8n-nodes-base.code` - Custom JavaScript code
- `n8n-nodes-base.set` - Set data values
- `n8n-nodes-base.if` - Conditional logic

### 5. Best Practices
- Always start with a trigger node
- Use meaningful node names
- Set `active: false` for new workflows (activate manually)
- Test workflows before making them active
- Handle errors gracefully

## Error Handling
All API responses follow this format:
```javascript
// Success
{
  "status": "success",
  "data": {...}
}

// Error
{
  "status": "error",
  "message": "Error description"
}
```

## Environment Variables
- `N8N_API`: JWT token for n8n API authentication
- `N8N_BASE_URL`: n8n base URL (default: http://localhost:5678) - API path (/api/v1) is automatically appended
- `PORT`: Server port (default: 3000)

## Security Notes
- API token is required for all n8n operations
- All requests are authenticated through the bridge
- Permissions are checked on server startup
- Test workflows are automatically cleaned up

## Usage Examples

### Create a Simple HTTP Request Workflow
```javascript
POST /api/workflows
{
  "name": "Simple HTTP Request",
  "nodes": [
    {
      "name": "Start",
      "type": "n8n-nodes-base.start",
      "parameters": {},
      "position": [240, 300],
      "typeVersion": 1
    },
    {
      "name": "HTTP Request",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "url": "https://api.example.com/data",
        "method": "GET"
      },
      "position": [460, 300],
      "typeVersion": 1
    }
  ],
  "connections": {
    "Start": {
      "main": [
        [{"node": "HTTP Request", "type": "main", "index": 0}]
      ]
    }
  },
  "active": false
}
```

This bridge enables seamless integration between AI assistants and n8n, allowing for intelligent workflow automation creation and management. 