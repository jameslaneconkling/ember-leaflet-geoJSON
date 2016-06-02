import Ember                     from 'ember';
import layout                    from './template';
import {on}                      from 'ember-computed-decorators';
import L                         from 'leaflet';

export default Ember.Component.extend({
  layout,
  tagName: '',

  @on('didInitAttrs')
  _initLayer() {
    Ember.assert(`
      Component initialized without a map.
      Ensure it was declared as a contextual component w/i the leaflet-map component block scope, like so:
        {{#leaflet-map as |map|}}
          {{map.tileLayer}}
        {{/leaflet-map}}`, this.get('map') instanceof L.Map);

    this.set('tileLayer', L.tileLayer(this.get('tileUrl')));
    this.get('map').addLayer(this.get('tileLayer'));
  },

  willDestroyElement() {
    this.get('map').removeLayer(this.get('tileLayer'));
  }
});
