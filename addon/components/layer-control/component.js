import Ember                     from 'ember';
import layout                    from './template';
import L                         from 'leaflet';
import _                         from 'lodash';
import computed, {on}            from 'ember-computed-decorators';

export default Ember.Component.extend({
  layout,
  tagName: '',
  preferences:            Ember.inject.service(),

  @computed('preferences.mapConfig.tiles')
  tileUrls() {
    // testable tile urls:
    // return {
    //   Satellite: '//services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    //   Basic: '//services.arcgisonline.com/arcgis/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}'
    // };
    return this.get('preferences.mapConfig.tiles').reduce((obj, tile) => {
      obj[tile.name] = tile.url;
      return obj;
    }, {});
  },

  @on('didInitAttrs')
  _init() {
    Ember.assert(`
      Component initialized without a map.
      Ensure it was declared as a contextual component w/i the leaflet-map component block scope, like so:
        {{#leaflet-map as |map|}}
          {{map.layerControl}}
        {{/leaflet-map}}`, this.get('map') instanceof L.Map);

    const baseLayers = _.mapValues(this.get('tileUrls'), url => L.tileLayer(url));
    const layerControl = L.control.layers(baseLayers).setPosition('bottomleft').addTo(this.get('map'));

    _.forOwn(baseLayers, layer => this.get('map').addLayer(layer));
    this.set('layerControl', layerControl);
  },

  @on('willDestroyElement')
  _teardown() {
    this.get('map').removeControl(this.get('layerControl'));
  }
});
