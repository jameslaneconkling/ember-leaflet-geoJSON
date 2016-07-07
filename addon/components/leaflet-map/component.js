import Ember                 from 'ember';
import layout                from './template';
import {defaultIcon,
        defaultPolygonStyle} from '../../utils/features';
import L                     from 'leaflet';
import _                     from 'lodash';

/**
 * Base map class to implement a Leaflet map component.
 * Create map features by adding vector-layer components,
 * tile-layer components, and map-control components
 * w/i the leaflet-map component's block scope, like so:
 *
 *  {{#leaflet-map as |map|}}
 *    {{map.layerControl}}
 *
 *    {{map.drawControl
 *      createShape=(action 'updateDrawShapes')
 *      editShapes=(action 'updateDrawShapes')
 *      deleteShapes=(action 'updateDrawShapes')
 *      options=drawOptions
 *    }}
 *
 *    {{#map.clusterLayer as |cluster|}}
 *      {{#each displayedMapMarkers as |markerData|}}
 *        {{#cluster.marker
 *          geoJSON=markerData.geoJSON
 *        }}
 *          <h3>{{markerData.title}}</h3>
 *          <p>{{{markerData.snippet.body}}}</p>
 *        {{/cluster.marker}}
 *      {{/each}}
 *    {{/map.clusterLayer}}
 *
 *    {{#if shouldShowHeatmap}}
 *      {{map.heatmapLayer}}
 *    {{/if}}
 *  {{/leaflet-map}}
 *
 * @class  LeafletMapComponent
 *
 * @param {Number}           [zoom]    zoom level of map
 * @param {Array [lat, lng]} [center]  center of map as [lat, lng]
 * @param {Object}           [options] additional options for map initialization.  see leaflet docs: http://leafletjs.com/reference.html#map-options
 */
export default Ember.Component.extend({
  layout,
  classNames: ['leaflet-map-component'],
  didInsertMap: false,

  icon: defaultIcon,
  polygonStyle: defaultPolygonStyle,

  bounds: Ember.computed({
    get() {
      return this.get('bounds');
    },
    set(key, val) {
      this.get('map').setBounds(val);
      return val;
    }
  }),

  onClick() { /*noop*/ },
  onMovestart() { /*noop*/ },
  onMove() { /*noop*/ },
  onMoveend() { /*noop*/ },
  onZoomstart() { /*noop*/ },
  onZoomend() { /*noop*/ },
  onContextmenu() { /*noop*/ },

  _initMap: Ember.on('didInsertElement', function() {
    const mapOptions = _.defaults({
      center: this.get('center'),
      zoom: this.get('zoom')
    }, this.get('options') || {}, {
      center: [0, 0], //[22, -170],
      zoom: 2, //6,
      attributionControl: false,
      scrollWheelZoom: false,
      maxBounds: [[90, -180], [-90, 180]],
      minZoom: 2,
      maxZoom: 18
    });

    Ember.run.next(() => {
      const map = L.map(this.get('elementId'), mapOptions);

      map.on('click', e => this.onClick(e));
      map.on('movestart', e => this.onMovestart(e));
      map.on('move', e => this.onMove(e));
      map.on('moveend', e => this.onMoveend(e));
      map.on('zoomstart', e => this.onZoomstart(e));
      map.on('zoomend', e => this.onZoomend(e));
      map.on('contextmenu', e => this.onContextmenu(e));

      this.set('map', map);
      this.set('didInsertMap', true);
    });
  }),

  setBounds(layer) {
    this.get('map').setBounds(layer.getBounds());
  }
});
