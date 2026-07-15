export type Role = 'admin' | 'manager' | 'support' | 'delivery' | 'user';

export const hasPermission = (userRole: string | undefined, action: string, data?: any): boolean => {
  if (!userRole) return false;
  
  // Super Admin can do everything
  if (userRole === 'admin') return true;

  switch (userRole) {
    case 'manager':
      switch (action) {
        case 'access_page':
          return true;
        case 'access_settings_tab':
          return true; // Access all tabs
        case 'manage_security_policies':
          return false; // Cannot manage global security toggles
        case 'invite_role':
          return ['support', 'delivery'].includes(data);
        case 'change_role':
          return ['support', 'delivery'].includes(data);
        case 'create':
          return true;
        case 'edit':
          return true;
        case 'delete':
          return false;
        default:
          return false;
      }
    case 'support':
      switch (action) {
        case 'access_page':
          return typeof data === 'string' && (data.startsWith('/admin/support') || data.startsWith('/admin/settings'));
        case 'access_settings_tab':
          // Except store details, flash sale, shipping, security, notifications
          return data === 'profile';
        case 'invite_role':
        case 'change_role':
        case 'create':
        case 'delete':
          return false;
        case 'edit':
          return true;
        default:
          return false;
      }
    case 'delivery':
      switch (action) {
        case 'access_page':
          // They only access delivery and settings profile
          return typeof data === 'string' && (data.startsWith('/admin/delivery') || data.startsWith('/admin/settings'));
        case 'access_settings_tab':
          return data === 'profile';
        case 'invite_role':
        case 'change_role':
        case 'create':
        case 'edit':
        case 'delete':
          return false;
        default:
          return false;
      }
    default:
      return false;
  }
};
