export function getActiveRoute() {
    const route = location.hash.slice(1).toLowerCase().split('/')[1];
    return `/${route || ''}`;
  }