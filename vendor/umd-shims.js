define('leaflet', [], function() { return {default: window.L}; });
define('lodash', [], function() { return {default: window._}; });
define('geodesy', [], function() {
  return {
    default: window.LatLon,
    Utm: window.Utm,
    Dms: window.Dms,
    Mgrs: window.Mgrs
  };
});
