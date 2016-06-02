import Ember                   from 'ember';
import layout                  from './template';
import L                       from 'leaflet';
import _                       from 'lodash';
import computed, {on}          from 'ember-computed-decorators';
import {isGeometryCollection}  from '../../utils/features';

/**
 * Add draw controls to a {{leaflet-map}} component.  Embed the controls w/i the maps block context
 *  {{#leaflet-map as |map|}}
 *    {{map.drawControl
 *      createShape=(action updateFilterShapes)
 *      editShapes=(action updateFilterShapes)
 *      deleteShapes=(action updateFilterShapes)
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

  @on('didInitAttrs')
  _init() {
    Ember.assert(`Could not find leaflet-draw constructor.  Make sure the plugin has been successfully loaded.`, !!L.Control.Draw);
    Ember.assert(`
      Component initialized without a map.
      Ensure it was declared as a contextual component w/i the leaflet-map component block scope, like so:
        {{#leaflet-map as |map|}}
          {{map.drawControl}}
        {{/leaflet-map}}`, this.get('map') instanceof L.Map);

    let map = this.get('map');
    let drawnFeatures = new L.GeoJSON(this.get('geoJSON') || null, {
      style: feature => this.get('polygonStyle'),
      pointToLayer: (feature, latLng) => new L.Marker(latLng, {icon: this.get('icon')})
    });
    let bounds = drawnFeatures.getBounds();
    if (bounds.isValid()) {
      this.get('map').fitBounds(bounds);
    }

    let drawOptions = {
      edit: {
        featureGroup: drawnFeatures
      },
      draw: _.defaultsDeep(this.get('options') || {}, {
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
      })
    };
    let drawControls = new L.Control.Draw(drawOptions);

    this.setProperties({
      drawControls,
      drawnFeatures
    });

    map.on('draw:created', (event) => this._createShape(event));
    map.on('draw:edited', (event) => this._editShapes(event));
    map.on('draw:deleted', (event) => this._deleteShapes(event));

    map.addControl(drawControls);
    map.addLayer(drawnFeatures);
  },

  @on('didUpdateAttrs')
  _update() {
    Ember.assert(`draw-control does not support GeometryCollections--convert the GeometryCollection to a FeatureCollection.`, !isGeometryCollection(this.get('geoJSON')));
    // on update of geometries, replace all drawnFeature layers with layers created from the new geoJSON
    // if we wanted to optimize, we could only fire when geometry changes, rather than when any attribute changes
    let drawnFeatures = this.get('drawnFeatures');
    drawnFeatures.clearLayers();

    let newFeatures = new L.GeoJSON(this.get('geoJSON') || null, {
      style: feature => this.get('polygonStyle'),
      pointToLayer: (feature, latLng) => new L.Marker(latLng, {icon: this.get('icon')})
    });
    newFeatures.eachLayer(layer => drawnFeatures.addLayer(layer));
  },

  @on('willDestroyElement')
  _teardown() {
    let map = this.get('map');
    map.off('draw');
    map.removeControl(this.get('drawControls'));
    if (this.get('geoJSON')) {
      map.removeLayer(this.get('geoJSON'));
    }
  },

  /**
   * Handler called when a new filter shape has been created
   *
   * @param  {} event An object with the following properties:
   *                  event.layer = The leaflet L.Path object just created
   *                  event.layerType = The type of layer (polygon, rectangle, circle)
   */
  _createShape(event) {
    this.get('drawnFeatures').addLayer(event.layer);
    this.get('createShape')(event.layer, this.get('drawnFeatures'), this.get('map'));
  },

  /**
   * Handler called when submitting an edit to a filter shape
   *
   * @param  {} event An object with the following properties:
   *                  event.layers = A L.LayerGroup object containing all layers just edited
   */
  _editShapes(event) {
    this.get('editShapes')(event.layers, this.get('drawnFeatures'), this.get('map'));
  },

  /**
   * Handler called when a filter shape has been deleted
   *
   * @param  {} event An object with the following properties:
   *                  event.layers = A L.LayerGroup object containing all layers just edited
   */
  _deleteShapes(event) {
    this.get('deleteShapes')(event.layers, this.get('drawnFeatures'), this.get('map'));
  }
});
