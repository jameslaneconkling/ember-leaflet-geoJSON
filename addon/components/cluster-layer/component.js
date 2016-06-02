import Ember           from 'ember';
import layout          from './template';
import L               from 'leaflet';

export default Ember.Component.extend({
  layout,
  tagName: '',
  didInsertClusterLayer: false,

  _init: Ember.on('didInitAttrs', function() {
    Ember.assert(`Could not find MarkerClusterGroup constructor.  Make sure the plugin has been successfully loaded.`, !!L.MarkerClusterGroup);
    Ember.assert(`
      Component initialized without a map.
      Ensure it was declared as a contextual component w/i the leaflet-map component block scope, like so:
        {{#leaflet-map as |map|}}
          {{map.clusterLayer}}
        {{/leaflet-map}}`, this.get('map') instanceof L.Map);

    const map = this.get('map');
    const clusterLayer = new L.MarkerClusterGroup();
    this.set('clusterLayer', clusterLayer);
    map.addLayer(clusterLayer);
    this.set('didInsertClusterLayer', true);
  }),

  _tearDown: Ember.on('willDestroyElement', function() {
    this.get('map').removeLayer(this.get('clusterLayer'));
  })
});
