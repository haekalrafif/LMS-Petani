export function getActiveRoute() {
    const route = location.hash.slice(1).toLowerCase().split('/')[0]; 
    return `/${route || ''}`;
  }