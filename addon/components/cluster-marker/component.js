import Ember                     from 'ember';
import layout                    from './template';
import L                         from 'leaflet';
import computed, {on}            from 'ember-computed-decorators';

/**
 * @param {geoJSON} geoJSON  the marker geoJSON
 *
 * @action [addLayer]     (layer, markers, map)
 * @action [removeLayer]  (layer, markers, map)
 * @action [mouseDown]    (layer, markers, map)
 * @action [mouseUp]      (layer, markers, map)
 * @action [mouseEnter]   (layer, markers, map)
 * @action [mouseLeave]   (layer, markers, map)
 */
export default Ember.Component.extend({
  layout,
  tagName: 'div',

  addLayer() {/*noop*/},
  removeLayer() {/*noop*/},
  mouseDown() {/*noop*/},
  mouseUp() {/*noop*/},
  mouseEnter() {/*noop*/},
  mouseLeave() {/*noop*/},

  @on('didInitAttrs')
  _init() {
    Ember.assert(`
      Component initialized without a MarkerClusterGroup.
      Ensure it was declared as a contextual component w/i the cluster-layer component block scope, like so:
        {{#leaflet-map as |map|}}
          {{map.clusterControl as |cluster|}}
            {{cluster.marker}}
          {{/map.clusterControl}}
        {{/leaflet-map}}`, this.get('clusterLayer') instanceof L.MarkerClusterGroup);

    Ember.assert('Map Cluster Marker component cannot be initialized before cluster-layer component is initialized', !!this.get('clusterLayer'));

    let geoJSONLayer = new L.GeoJSON(this.get('geoJSON') || null, {
      style: feature => this.get('polygonStyle'),
      pointToLayer: (feature, latLng) => new L.Marker(latLng, {icon: this.get('icon')})
    });
    this.set('geoJSONLayer', geoJSONLayer);
    this.set('clusterMarkers', this.layer2clusterMarkers(geoJSONLayer));
  },

  @on('didInsertElement')
  _setupMarker() {
    let clusterMarkers = this.get('clusterMarkers');
    clusterMarkers.forEach(geoJSONLayer => {
      geoJSONLayer.on('mouseover', () => this._mouseEnter(geoJSONLayer));
      geoJSONLayer.on('mouseout', () => this._mouseLeave(geoJSONLayer));
      geoJSONLayer.on('mousedown', () => this._mouseDown(geoJSONLayer));
      geoJSONLayer.on('click', () => this._mouseUp(geoJSONLayer));

      let popupContent = this.$('._marker-component-popup').html().replace(/<!--.*-->/g, '').replace(/\s/g, '');

      if (popupContent) {
        // don't bind popup if content isn't defined
        geoJSONLayer.bindPopup(popupContent);
      }
    });

    this.get('clusterLayer').addLayers(clusterMarkers)
    this.get('addLayer')(this.get('geoJSONLayer'), clusterMarkers, this.get('map'));
  },

  @on('willDestroyElement')
  _teardown() {
    let clusterMarkers = this.get('clusterMarkers');
    this.get('clusterLayer').removeLayers(clusterMarkers);

    this.get('removeLayer')(this.get('geoJSONLayer'), clusterMarkers, this.get('map'));
  },

  layer2clusterMarkers(leafletLayer) {
    let clusterMarkers = [];

    leafletLayer.eachLayer(layer => {
      // NOTE - handling multigeometries is pretty naieve right now: will put one marker at the center of the entire collection.
      //        the other option would be to put markers on each featre in the multigeometry
      let layerType = layer.feature.geometry.type;
      let markerLatLng = layerType === 'Point' ? layer.getLatLng() : layer.getBounds().getCenter();
      let clusterMarker = new L.Marker(markerLatLng, {
        icon: this.get('icon'),
        __featureGeom: layer,
      });

      clusterMarkers.push(clusterMarker);
    });

    return clusterMarkers;
  },

  _mouseDown(geoJSONLayer) {
    this.get('mouseDown')(geoJSONLayer, this.get('clusterMarkers'), this.get('map'));
  },

  _mouseUp(geoJSONLayer) {
    this.get('mouseUp')(geoJSONLayer, this.get('clusterMarkers'), this.get('map'));
  },

  _mouseEnter(geoJSONLayer) {
    this.get('mouseEnter')(geoJSONLayer, this.get('clusterMarkers'), this.get('map'));
  },

  _mouseLeave(geoJSONLayer) {
    this.get('mouseLeave')(geoJSONLayer, this.get('clusterMarkers'), this.get('map'));
  }
});
