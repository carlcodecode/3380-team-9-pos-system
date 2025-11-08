// Permission bit flags (must match backend exactly)
// Backend: REPORT (0), MEAL (1), STOCK (2), MEAL_CATEGORY (3), SALE_EVENT (4), PROMO (5)
export const PERMISSIONS = {
  NONE: 0,
  REPORTS: 1 << 0,            // Bit 0: Reports (placeholder - not in staff dashboard yet)
  MEAL_MANAGEMENT: 1 << 1,    // Bit 1: Meal Management
  STOCK_CONTROL: 1 << 2,      // Bit 2: Stock Control
  ORDERS: 1 << 3,             // Bit 3: Orders (MEAL_CATEGORY in backend)
  SEASONAL_DISCOUNTS: 1 << 4, // Bit 4: Seasonal Discounts (SALE_EVENT in backend)
  PROMO_CODES: 1 << 5,        // Bit 5: Promo Codes (PROMO in backend)
};

// Check if user has a specific permission
export const hasPermission = (userPermissions, permission) => {
  return (userPermissions & permission) !== 0;
};

// Convert frontend permission object to bitmask
export const permissionsToBitmask = (permissions) => {
  let mask = 0;
  if (permissions.reports) mask |= PERMISSIONS.REPORTS;
  if (permissions.mealManagement) mask |= PERMISSIONS.MEAL_MANAGEMENT;
  if (permissions.stockControl) mask |= PERMISSIONS.STOCK_CONTROL;
  if (permissions.orders) mask |= PERMISSIONS.ORDERS;
  if (permissions.seasonalDiscounts) mask |= PERMISSIONS.SEASONAL_DISCOUNTS;
  if (permissions.promoCodes) mask |= PERMISSIONS.PROMO_CODES;
  return mask;
};

// Convert bitmask to frontend permission object
export const bitmaskToPermissions = (mask) => {
  return {
    reports: hasPermission(mask, PERMISSIONS.REPORTS),
    mealManagement: hasPermission(mask, PERMISSIONS.MEAL_MANAGEMENT),
    stockControl: hasPermission(mask, PERMISSIONS.STOCK_CONTROL),
    orders: hasPermission(mask, PERMISSIONS.ORDERS),
    seasonalDiscounts: hasPermission(mask, PERMISSIONS.SEASONAL_DISCOUNTS),
    promoCodes: hasPermission(mask, PERMISSIONS.PROMO_CODES),
  };
};
