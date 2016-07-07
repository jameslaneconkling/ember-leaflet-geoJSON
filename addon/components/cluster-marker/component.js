import Ember                     from 'ember';
import layout                    from './template';
import L                         from 'leaflet';

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

  _init: Ember.on('didInitAttrs', function() {
    Ember.assert(`
      Component initialized without a MarkerClusterGroup.
      Ensure it was declared as a contextual component w/i the cluster-layer component block scope, like so:
        {{#leaflet-map as |map|}}
          {{map.clusterControl as |cluster|}}
            {{cluster.marker}}
          {{/map.clusterControl}}
        {{/leaflet-map}}`, this.get('clusterLayer') instanceof L.MarkerClusterGroup);

    Ember.assert('Map Cluster Marker component cannot be initialized before cluster-layer component is initialized', !!this.get('clusterLayer'));

    const geoJSONLayer = new L.GeoJSON(this.get('geoJSON') || null, {
      style: feature => this.get('polygonStyle'),
      pointToLayer: (feature, latLng) => new L.Marker(latLng, {icon: this.get('icon')})
    });
    this.set('layer', geoJSONLayer);
    this.set('clusterMarkers', this.layer2clusterMarkers(geoJSONLayer));
  }),

  _setupMarker: Ember.on('didInsertElement', function() {
    const clusterMarkers = this.get('clusterMarkers');
    clusterMarkers.forEach(geoJSONLayer => {
      geoJSONLayer.on('mouseover', () => this._mouseEnter(geoJSONLayer));
      geoJSONLayer.on('mouseout', () => this._mouseLeave(geoJSONLayer));
      geoJSONLayer.on('mousedown', () => this._mouseDown(geoJSONLayer));
      geoJSONLayer.on('click', () => this._mouseUp(geoJSONLayer));

      const popupContent = this.createPopupContent();

      if (popupContent.childElementCount > 0) {
        // don't bind popup if content isn't defined
        geoJSONLayer.bindPopup(popupContent);
      }
    });

    this.get('clusterLayer').addLayers(clusterMarkers)
    this.get('addLayer')(this.get('layer'), clusterMarkers, this.get('map'));
  }),

  _teardown: Ember.on('willDestroyElement', function() {
    const clusterMarkers = this.get('clusterMarkers');
    this.get('clusterLayer').removeLayers(clusterMarkers);

    this.get('removeLayer')(this.get('layer'), clusterMarkers, this.get('map'));
  }),

  createPopupContent() {
    const popupElement = document.createElement('div');
    let firstNode = this.element.firstChild;
    let lastNode = this.element.lastChild;

    while (firstNode) {
      popupElement.insertBefore(firstNode, null);
      firstNode = firstNode !== lastNode ? lastNode.parentNode.firstChild : null;
    }
    return popupElement;
  },

  layer2clusterMarkers(leafletLayer) {
    let clusterMarkers = [];

    leafletLayer.eachLayer(layer => {
      // NOTE - handling multigeometries is pretty naieve right now: will put one marker at the center of the entire collection.
      //        the other option would be to put markers on each featre in the multigeometry
      const layerType = layer.feature.geometry.type;
      const markerLatLng = layerType === 'Point' ? layer.getLatLng() : layer.getBounds().getCenter();
      const clusterMarker = new L.Marker(markerLatLng, {
        icon: this.get('icon')
      });
      clusterMarker['__featureGeom'] = layer;

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
