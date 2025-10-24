// Map database user_role values to string names
export const getUserRole = (roleNumber) => {
  const roles = {
    0: 'customer',
    1: 'staff',
    2: 'admin'
  };
  return roles[roleNumber] || 'customer';
};

export const getRoleNumber = (roleName) => {
  const roles = {
    'customer': 0,
    'staff': 1,
    'admin': 2
  };
  return roles[roleName] || 0;
};
