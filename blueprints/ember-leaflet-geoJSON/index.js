module.exports = {
  normalizeEntityName: function() {},

  afterInstall: function() {
    return this.addBowerPackageToProject('leaflet', '~0.7.7');
    // return this.addBowerPackagesToProject([
    //   'leaflet',
    //   'leaflet-draw',
    //   'leaflet.markercluster'
    // ]);
  }
};
