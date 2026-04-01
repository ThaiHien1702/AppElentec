# Position Hierarchy Feature Documentation

## Overview

The Position Hierarchy feature allows users to be assigned different organizational positions/roles with a hierarchical structure:

- **Manager** (Level 4) - Highest authority
- **Assistant Manager** (Level 3)
- **Supervisor** (Level 2)
- **Staff** (Level 1) - Lowest level

## Key Components

### 1. **User Model Updates** (`User.js`)

The `position` field was updated to support enum values with default "Staff":

```javascript
position: {
  type: String,
  enum: ["Manager", "Assistant Manager", "Supervisor", "Staff"],
  default: "Staff",
  trim: true,
}
```

### 2. **Position Hierarchy Utilities** (`positionHierarchy.js`)

Provides utility functions for managing positions:

- `POSITION_LEVELS` - Maps positions to hierarchy levels
- `getPositionLevel(position)` - Get the numeric level of a position
- `isHigherPosition(pos1, pos2)` - Check if pos1 is higher than pos2
- `getPermissions(position)` - Get permissions for a position
- `hasPermission(position, permission)` - Check if position has permission
- `getSubordinatePositions(position)` - Get all positions below a level

### 3. **Permission Matrix**

Each position has specific permissions:

```javascript
POSITION_PERMISSIONS = {
  Manager: {
    canManageAllUsers: true,
    canManagePositions: true,
    canViewReports: true,
    canDeleteData: true,
    canExportData: true,
    canImportData: true,
    canEditAllComputers: true,
  },
  "Assistant Manager": {
    canViewReports: true,
    canExportData: true,
    canImportData: true,
    canEditAllComputers: true,
    // Others are false
  },
  Supervisor: {
    canViewReports: true,
    canExportData: true,
    // Others are false
  },
  Staff: {
    // All permissions are false
  },
};
```

### 4. **Enhanced Authentication Middleware** (`authMiddleware.js`)

Updated `verifyToken` middleware now:

- Fetches user's position from database
- Sets `req.userPosition`, `req.userDepartment`, and `req.positionLevel`
- Can be used in downstream middlewares/controllers

New position-based middleware functions:

- `isManager()` - Requires Manager position or above
- `isAssistantManagerOrAbove()` - Requires Assistant Manager or above
- `isSupervisor()` - Requires Supervisor or above
- `checkPosition(allowedPositions[])` - Allow specific positions
- `checkPositionLevel(minLevel)` - Allow minimum hierarchy level

### 5. **Position Controller** (`positionController.js`)

Provides endpoints for position management:

#### Public Endpoints (Authenticated)

- `GET /hierarchy` - Get position hierarchy info
- `GET /users` - Get users with optional filter by position
- `GET /users?position=Manager` - Get users in a specific position
- `GET /my-info` - Get current user's position details
- `GET /subordinates?position=Manager` - Get employees under a position

#### Manager+ Only

- `PUT /:userId` - Update a user's position

#### Admin Only

- `POST /bulk-update` - Bulk update multiple user positions
- `GET /statistics` - Get position statistics (count per position)

### 6. **Routes** (`positionRoutes.js`)

```javascript
GET    /positions/hierarchy         // Public
GET    /positions/users             // Public
GET    /positions/my-info           // Public
GET    /positions/subordinates       // Public
GET    /positions/statistics        // Admin Only
PUT    /positions/:userId           // Manager+ Only
POST   /positions/bulk-update       // Admin Only
```

## API Examples

### 1. Create User with Position

```bash
POST /api/auth/signup
{
  "idCompanny": "john_doe",
  "password": "password123",
  "displayName": "John Doe",
  "position": "Manager"  # Optional, defaults to "Staff"
}
```

### 2. Get Position Hierarchy

```bash
GET /api/positions/hierarchy
Authorization: Bearer TOKEN

Response:
{
  "message": "Lấy thông tin cấp bậc thành công",
  "hierarchy": [
    {
      "position": "Manager",
      "level": 4,
      "description": "Quản lý (Cấp cao nhất)",
      "permissions": { ... }
    },
    ...
  ]
}
```

### 3. Get Users by Position

```bash
GET /api/positions/users?position=Manager
Authorization: Bearer TOKEN

Response:
{
  "message": "Lấy danh sách người dùng thành công",
  "total": 5,
  "data": [
    {
      "_id": "...",
      "idCompanny": "john_doe",
      "displayName": "John Doe",
      "position": "Manager",
      "department": "IT",
      "email": "john@example.com"
    },
    ...
  ]
}
```

### 4. Get Current User's Position Info

```bash
GET /api/positions/my-info
Authorization: Bearer TOKEN

Response:
{
  "message": "Lấy thông tin cấp bậc người dùng thành công",
  "data": {
    "user": {
      "_id": "...",
      "idCompanny": "john_doe",
      "displayName": "John Doe",
      "position": "Manager",
      "department": "IT"
    },
    "positionLevel": 4,
    "description": "Quản lý (Cấp cao nhất)",
    "permissions": {
      "canManageAllUsers": true,
      "canManagePositions": true,
      ...
    }
  }
}
```

### 5. Update User Position

```bash
PUT /api/positions/USER_ID
Authorization: Bearer TOKEN (Manager or Admin)
Content-Type: application/json

{
  "position": "Supervisor"
}

Response:
{
  "message": "Cập nhật cấp bậc thành công",
  "data": {
    "_id": "USER_ID",
    "position": "Supervisor",
    ...
  }
}
```

### 6. Bulk Update Positions

```bash
POST /api/positions/bulk-update
Authorization: Bearer TOKEN (Admin only)
Content-Type: application/json

{
  "updates": [
    { "userId": "USER_ID_1", "position": "Supervisor" },
    { "userId": "USER_ID_2", "position": "Manager" },
    { "userId": "USER_ID_3", "position": "Staff" }
  ]
}

Response:
{
  "message": "Cập nhật cấp bậc hoàn tất",
  "successful": 3,
  "failed": 0,
  "results": [ ... ]
}
```

### 7. Get Position Statistics

```bash
GET /api/positions/statistics
Authorization: Bearer TOKEN (Admin only)

Response:
{
  "message": "Lấy thống kê cấp bậc thành công",
  "total": 50,
  "statistics": [
    { "position": "Manager", "count": 3, "level": 4 },
    { "position": "Assistant Manager", "count": 7, "level": 3 },
    { "position": "Supervisor", "count": 10, "level": 2 },
    { "position": "Staff", "count": 30, "level": 1 }
  ]
}
```

## Integration with Other Features

### 1. Computer Management

The position hierarchy can be integrated with computer management to control:

- Who can view all computers
- Who can edit/delete computers
- Who can import/export computer data

### 2. Role-Based Access Control

Positions can be combined with existing system roles:

- `role: "admin"` → Full system access
- `role: "moderator"` + `position: "Manager"` → Department-level control
- `role: "user"` + `position: "Staff"` → Limited access

### 3. Department Management

Connect positions with departments for:

- Department-specific managers
- Hierarchical permission structure
- Multi-level approval workflows

## Usage in Controllers

### Check Position in Controller

```javascript
import { hasPermission } from "../utils/positionHierarchy.js";

export const someAction = async (req, res) => {
  if (!hasPermission(req.userPosition, "canDeleteData")) {
    return res.status(403).json({
      message: "You don't have permission to delete data",
    });
  }
  // Proceed with action
};
```

### Use Position Middleware

```javascript
import { isManager, checkPosition } from "../middlewares/authMiddleware.js";

// Only managers and above
router.post("/action", verifyToken, isManager, controller);

// Only specific positions
router.post(
  "/action",
  verifyToken,
  checkPosition(["Manager", "Assistant Manager"]),
  controller,
);
```

## Database Queries

### Get all managers in a department

```javascript
const managers = await User.find({
  position: "Manager",
  department: "IT",
});
```

### Count staff by position

```javascript
const stats = await User.aggregate([
  {
    $group: {
      _id: "$position",
      count: { $sum: 1 },
    },
  },
  { $sort: { _id: -1 } },
]);
```

## Error Handling

| Status | Code         | Message                                   |
| ------ | ------------ | ----------------------------------------- |
| 400    | Bad Request  | Position not valid, invalid user ID       |
| 401    | Unauthorized | Token missing or invalid                  |
| 403    | Forbidden    | User doesn't have required position level |
| 404    | Not Found    | User not found                            |
| 500    | Server Error | Internal error                            |

## Files Modified/Created

✅ **Modified:**

- `backend/src/models/User.js` - Added position enum
- `backend/src/middlewares/authMiddleware.js` - Enhanced with position checking
- `backend/src/server.js` - Added position routes

✅ **Created:**

- `backend/src/utils/positionHierarchy.js` - Position utilities
- `backend/src/controllers/positionController.js` - Position management logic
- `backend/src/routes/positionRoutes.js` - Position API routes
- `backend/position-api.http` - HTTP test requests
- `backend/position-hierarchy.md` - This documentation

## Testing

Use the `position-api.http` file in VS Code REST Client to test all endpoints:

1. Create admin user
2. Login and copy token
3. Create test users with different positions
4. Test all endpoints with the token

## Future Enhancements

1. **Approval Workflows** - Multi-level approvals based on position
2. **Position-Based Routes** - Show different UI based on position
3. **Audit Logging** - Track position changes
4. **Department Hierarchy** - Multi-department position structures
5. **Delegation** - Allow temporary position elevation
