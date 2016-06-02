/* jshint node: true */
'use strict';

module.exports = {
  name: 'ember-leaflet-geo-json',

  included: function(app) {
    this._super.included(app);
    app.import(app.bowerDirectory + '/leaflet/dist/leaflet-src.js');
    app.import(app.bowerDirectory + '/leaflet-draw/dist/leaflet.draw.js');
    app.import(app.bowerDirectory + '/leaflet.markercluster/dist/leaflet.markercluster.js');

    app.import(app.bowerDirectory + '/leaflet/dist/leaflet.css');
    app.import(app.bowerDirectory + '/leaflet-draw/dist/leaflet.draw.css');
    app.import(app.bowerDirectory + '/leaflet.markercluster/dist/MarkerCluster.Default.css');
    app.import(app.bowerDirectory + '/leaflet.markercluster/dist/MarkerCluster.css');

    var imagesDestDir = '/assets/images';
    app.import(app.bowerDirectory + '/leaflet/dist/images/layers-2x.png', { destDir: imagesDestDir });
    app.import(app.bowerDirectory + '/leaflet/dist/images/layers.png', { destDir: imagesDestDir });
    app.import(app.bowerDirectory + '/leaflet/dist/images/marker-icon-2x.png', { destDir: imagesDestDir });
    app.import(app.bowerDirectory + '/leaflet/dist/images/marker-icon.png', { destDir: imagesDestDir });
    app.import(app.bowerDirectory + '/leaflet/dist/images/marker-shadow.png', { destDir: imagesDestDir });

    app.import(app.bowerDirectory + '/leaflet-draw/dist/images/spritesheet-2x.png', { destDir: imagesDestDir });
    app.import(app.bowerDirectory + '/leaflet-draw/dist/images/spritesheet.png', { destDir: imagesDestDir });
  }
};
