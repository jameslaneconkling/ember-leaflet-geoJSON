import Ember                     from 'ember';
import layout                    from './template';
import L                         from 'leaflet';
import _                         from 'lodash';
import {isGeometryCollection,
        circleFeatureToGeoJSON}  from '../../utils/features';

/**
 * Add draw controls to a {{leaflet-map}} component.  Embed the controls w/i the maps block context
 *  {{#leaflet-map as |map|}}
 *    {{map.drawControl
 *      geoJSON=geoJSON
 *      createShape=(action 'updateFilterShapes')
 *      editShapes=(action 'updateFilterShapes')
 *      deleteShapes=(action 'updateFilterShapes')
 *      options=drawOptions
 *    }}
 *  {{/leaflet-map}}
 *
 * @param  {Object}    [options]  Override drault draw handler options.  see vendor [docs](https://github.com/Leaflet/Leaflet.draw#draw-handler-options), e.g.
 *                                                                            options = {
 *                                                                              polygon: false,
 *                                                                              circle: false,
 *                                                                              marker: {
 *                                                                                icon:  L.icon(...),
 *                                                                                repeatMode: false
 *                                                                              }
 *                                                                            }
 *
 * @param    {geoJSON} [geoJSON]                             optional geometries to add to draw control.  set to false to remove all geometries from map
 *
 * @action   [createShape]   (newLayer, allLayers, map)           optional handler called when creating a new shape - returns
 * @action   [editShapes]    (updatedLayers, allLayers, map)      optional handler called when updating geometries on 1+ shapes - returns
 * @action   [deleteShapes]  (updatedLayers, allLayers, map)      optional handler called when deleting 1+ shapes - returns
 */
export default Ember.Component.extend({
  layout,
  tagName: '',

  createShape() {/*noop*/},
  updatedShapes() {/*noop*/},
  deleteShapes() {/*noop*/},

  _init: Ember.on('didInitAttrs', function() {
    Ember.assert(`Could not find leaflet-draw constructor.  Make sure the plugin has been successfully loaded.`, !!L.Control.Draw);
    Ember.assert(`
      Component initialized without a map.
      Ensure it was declared as a contextual component w/i the leaflet-map component block scope, like so:
        {{#leaflet-map as |map|}}
          {{map.drawControl}}
        {{/leaflet-map}}`, this.get('map') instanceof L.Map);

    const map = this.get('map');
    const drawOptions = _.defaultsDeep(this.get('options') || {}, {
      draw: {
        polyline: {
          shapeOptions: this.get('polygonStyle')
        },
        polygon: {
          shapeOptions: this.get('polygonStyle')
        },
        rectangle: {
          shapeOptions: this.get('polygonStyle')
        },
        circle: {
          shapeOptions: this.get('polygonStyle')
        },
        marker: {
          icon: this.get('icon'),
          repeatMode: true
        }
      },
      edit: {
        remove: true,
        buffer: null
      }
    });

    const drawnFeatures = this.geoJSON2Layer(this.get('geoJSON'), drawOptions);
    drawOptions.set('edit.featureGroup', drawnFeatures);

    const bounds = drawnFeatures.getBounds();
    if (bounds.isValid()) {
      this.get('map').fitBounds(bounds);
    }

    const drawControls = new L.Control.Draw(drawOptions);

    this.setProperties({
      drawControls,
      drawnFeatures,
      drawOptions
    });

    map.on('draw:created', (event) => this._createShape(event));
    map.on('draw:edited', (event) => this._editShapes(event));
    map.on('draw:deleted', (event) => this._deleteShapes(event));

    map.addControl(drawControls);
    map.addLayer(drawnFeatures);
  }),

  _update: Ember.on('didUpdateAttrs', function() {
    Ember.assert(`draw-control does not support GeometryCollections--convert the GeometryCollection to a FeatureCollection.`, !isGeometryCollection(this.get('geoJSON')));
    // on update of geometries, replace all drawnFeature layers with layers created from the new geoJSON
    // if we wanted to optimize, we could only fire when geometry changes, rather than when any attribute changes
    const drawnFeatures = this.get('drawnFeatures');
    drawnFeatures.clearLayers();

    const newFeatures = this.geoJSON2Layer(this.get('geoJSON'), this.get('drawOptions'));
    newFeatures.eachLayer(layer => drawnFeatures.addLayer(layer));
  }),

  _teardown: Ember.on('willDestroyElement', function() {
    const map = this.get('map');
    map.off('draw');
    map.removeControl(this.get('drawControls'));
    if (this.get('geoJSON')) {
      map.removeLayer(this.get('geoJSON'));
    }
  }),

  geoJSON2Layer(geoJSON, drawOptions) {
    const featureStyle = (feature) => {
      const featureType = feature.geometry.type.toLowerCase();
      return drawOptions.get(`draw.${featureType}.shapeOptions`);
    };
    return new L.GeoJSON(geoJSON || null, {
      style: featureStyle,
      pointToLayer: (feature, latLng) => new L.Marker(latLng, {icon: this.get('icon')})
    });
  },

  /**
   * Handler called when a new filter shape has been created
   *
   * @param  {} event An object with the following properties:
   *                  event.layer = The leaflet L.Path object just created
   *                  event.layerType = The type of layer (polygon, rectangle, circle)
   */
  _createShape(event) {
    const newShape = event.layer instanceof L.Circle ?
      circleFeatureToGeoJSON(event.layer) :
      event.layer.toGeoJSON();

    this.get('drawnFeatures').addLayer(event.layer);
    this.get('createShape')(newShape, this.get('drawnFeatures').toGeoJSON(), this.get('map'));
  },

  /**
   * Handler called when submitting an edit to a filter shape
   *
   * @param  {} event An object with the following properties:
   *                  event.layers = A L.LayerGroup object containing all layers just edited
   */
  _editShapes(event) {
    this.get('editShapes')(event.layers.toGeoJSON(), this.get('drawnFeatures').toGeoJSON(), this.get('map'));
  },

  /**
   * Handler called when a filter shape has been deleted
   *
   * @param  {} event An object with the following properties:
   *                  event.layers = A L.LayerGroup object containing all layers just edited
   */
  _deleteShapes(event) {
    this.get('deleteShapes')(event.layers.toGeoJSON(), this.get('drawnFeatures').toGeoJSON(), this.get('map'));
  }
});
