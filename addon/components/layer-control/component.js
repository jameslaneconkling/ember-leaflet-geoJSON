import Ember                     from 'ember';
import layout                    from './template';
import L                         from 'leaflet';
import _                         from 'lodash';

export default Ember.Component.extend({
  layout,
  tagName: '',

  _init: Ember.on('didInitAttrs', function() {
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
  }),

  _teardown: Ember.on('willDestroyElement', function() {
    this.get('map').removeControl(this.get('layerControl'));
  })
});
