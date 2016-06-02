module.exports = {
  normalizeEntityName: function() {},

  afterInstall: function() {
    return this.addBowerPackagesToProject([
      {name: 'leaflet'},
      {name: 'leaflet-draw'},
      {name: 'leaflet.markercluster'}
    ]);
  }
};
