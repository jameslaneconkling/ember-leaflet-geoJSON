import Ember           from 'ember';
import layout          from './template';
import L               from 'leaflet';
import {on}            from 'ember-computed-decorators';

export default Ember.Component.extend({
  layout,
  tagName: '',
  didInsertClusterLayer: false,

  @on('didInitAttrs')
  _init() {
    Ember.assert(`Could not find MarkerClusterGroup constructor.  Make sure the plugin has been successfully loaded.`, !!L.MarkerClusterGroup);
    Ember.assert(`
      Component initialized without a map.
      Ensure it was declared as a contextual component w/i the leaflet-map component block scope, like so:
        {{#leaflet-map as |map|}}
          {{map.clusterLayer}}
        {{/leaflet-map}}`, this.get('map') instanceof L.Map);

    let map = this.get('map');
    let clusterLayer = new L.MarkerClusterGroup();
    this.set('clusterLayer', clusterLayer);
    map.addLayer(clusterLayer);
    this.set('didInsertClusterLayer', true);
  },

  @on('willDestroyElement')
  _tearDown() {
    this.get('map').removeLayer(this.get('clusterLayer'));
  }
});
