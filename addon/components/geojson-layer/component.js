import Ember                     from 'ember';
import layout                    from './template';
import L                         from 'leaflet';

/**
 * Add a L.geoJson layer to the leaflet-map component
 *  {{#leaflet-map as |map|}}
 *    {{geojson-layer
 *      geoJSON=(wkt2geojson model.data)
 *    }}
 *  {{/leaflet-map}}
 *
 * @class  GeojsonLayerComponent
 * @param {geoJSON} geoJSON          the input geoJSON geometry
 *
 * @action [addLayer]     (layer, map)
 * @action [removeLayer]  (layer, map)
 * @action [mouseDown]    (layer, map)
 * @action [mouseUp]      (layer, map)
 * @action [mouseEnter]   (layer, map)
 * @action [mouseLeave]   (layer, map)
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
      Component initialized without a map.
      Ensure it was declared as a contextual component w/i the leaflet-map component block scope, like so:
        {{#leaflet-map as |map|}}
          {{map.geoJSONLayer}}
        {{/leaflet-map}}`, this.get('map') instanceof L.Map);

    const leafletGeoJSON = new L.GeoJSON(this.get('geoJSON') || null, {
      style: feature => this.get('polygonStyle'),
      pointToLayer: (feature, latLng) => new L.Marker(latLng, {icon: this.get('icon')})
    });
    this.set('leafletGeoJSON', leafletGeoJSON);
  }),

  _setupMarker: Ember.on('didInsertElement', function() {
    const layer = this.get('leafletGeoJSON');
    const map = this.get('map');

    // binding popups must happen after the element has been inserted into the DOM
    layer.eachLayer(geoJSONLayer => {
      geoJSONLayer.on('mouseover', () => this._mouseEnter(geoJSONLayer));
      geoJSONLayer.on('mouseout', () => this._mouseLeave(geoJSONLayer));
      geoJSONLayer.on('mousedown', () => this._mouseDown(geoJSONLayer));
      geoJSONLayer.on('click', () => this._mouseUp(geoJSONLayer));

      const popupContent = this.$('._marker-component-popup').html().replace(/<!--.*-->/g, '').replace(/\s/g, '');

      if (popupContent) {
        // don't bind popup if content isn't defined
        geoJSONLayer.bindPopup(popupContent);
      }
    });

    map.addLayer(layer)
    this.get('addLayer')(layer, map);
  }),

  _teardown: Ember.on('willDestroyElement', function() {
    const layer = this.get('leafletGeoJSON');

    this.get('map').removeLayer(layer);
    this.get('removeLayer')(layer, this.get('map'));
  }),

  _mouseDown(geoJSONLayer) {
    this.get('mouseDown')(geoJSONLayer, this.get('map'));
  },

  _mouseUp(geoJSONLayer) {
    this.get('mouseUp')(geoJSONLayer, this.get('map'));
  },

  _mouseEnter(geoJSONLayer) {
    this.get('mouseEnter')(geoJSONLayer, this.get('map'));
  },

  _mouseLeave(geoJSONLayer) {
    this.get('mouseLeave')(geoJSONLayer, this.get('map'));
  }
});
