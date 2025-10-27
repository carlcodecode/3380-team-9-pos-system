# Staff Permissions System

## Permission Bit Flags

The system uses a 6-bit bitmask to store permissions efficiently in the database.

| Bit Position | Decimal Value | Binary | Permission | Staff Dashboard Tab |
|--------------|---------------|--------|------------|---------------------|
| 0 | 1 | 000001 | Reports | N/A (Admin only) |
| 1 | 2 | 000010 | Orders | Order Management |
| 2 | 4 | 000100 | Meal Management | Meal Management |
| 3 | 8 | 001000 | Stock Control | Stock Control |
| 4 | 16 | 010000 | Promo Codes | Promo Codes |
| 5 | 32 | 100000 | Seasonal Discounts | Seasonal Discounts |

## Backend Field Mapping

When creating/updating staff, the frontend sends:
- `report_perm` → Reports permission
- `meal_perm` → Orders permission  
- `stock_perm` → Meal Management permission
- `meal_category_perm` → Stock Control permission
- `sale_event_perm` → Promo Codes permission
- `promo_perm` → Seasonal Discounts permission

These are combined into a single `PERMISSIONS` integer column in the STAFF table.

## Frontend Permission Object

The frontend uses a more readable object structure:
```javascript
{
  reports: boolean,
  orders: boolean,
  mealManagement: boolean,
  stockControl: boolean,
  promoCodes: boolean,
  seasonalDiscounts: boolean
}
```

## Examples

### All Permissions
- Bitmask: 63 (111111 in binary)
- User sees: All 5 tabs (Orders, Meals, Stock, Promos, Discounts)

### Only Orders
- Bitmask: 2 (000010 in binary)
- User sees: Only the "Orders" tab

### Orders + Stock
- Bitmask: 10 (001010 in binary = 2 + 8)
- User sees: "Orders" and "Stock Control" tabs

### No Permissions
- Bitmask: 0 (000000 in binary)
- User sees: "No Permissions" message

## Admin Access

Administrators automatically have all permissions (treated as bitmask 63) regardless of what's stored in the database.

## Database Schema

```sql
ALTER TABLE STAFF ADD COLUMN PERMISSIONS INT DEFAULT 0;
```

The PERMISSIONS column stores the integer bitmask value.

## Files Modified

### Backend
- `controllers/adminController.js` - Permission encoding/decoding
- `controllers/authController.js` - Include PERMISSIONS in login response

### Frontend
- `utils/permissions.js` - Permission utility functions (NEW)
- `components/admin/StaffManagement.jsx` - Permission checkboxes UI
- `components/staff/StaffDashboard.jsx` - Tab visibility control
- `contexts/AuthContext.jsx` - Store user permissions

## Usage

### Checking Permissions (Frontend)
```javascript
import { PERMISSIONS, hasPermission } from '../../utils/permissions';

// Check if user can view orders
const canViewOrders = hasPermission(user.permissions, PERMISSIONS.ORDERS);
```

### Converting Between Formats
```javascript
import { permissionsToBitmask, bitmaskToPermissions } from '../../utils/permissions';

// Frontend object → Backend bitmask
const bitmask = permissionsToBitmask({
  orders: true,
  mealManagement: true,
  // ... other permissions
});

// Backend bitmask → Frontend object  
const permissions = bitmaskToPermissions(10); // Returns { orders: true, stockControl: true, ... }
```
