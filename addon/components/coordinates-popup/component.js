import Ember               from 'ember';
import layout              from './template';
import L                   from 'leaflet';
import LatLng,
       {Mgrs, Dms, Utm}    from 'geodesy';

export default Ember.Component.extend({
  layout,
  popup: null,
  lat: null,
  lng: null,
  mgrs: Ember.computed('lat', 'lng', function() {
    try {
      return new LatLng(this.get('lat'), this.get('lng')).toUtm().toMgrs().toString();
    } catch (e) {
      return 'Invalid Coordinate';
    }
  }),
  dms: Ember.computed('lat', 'lng', function() {
    try {
      return new LatLng(this.get('lat'), this.get('lng')).toString('dms').split(', ');
    } catch (e) {
      return 'Invalid Coordinate';
    }
  }),
  utm: Ember.computed('lat', 'lng', function() {
    try {
      return new LatLng(this.get('lat'), this.get('lng')).toUtm();
    } catch (e) {
      return 'Invalid Coordinate';
    }
  }),

  setLatLng() { /*noop*/ },
  closePopup() { /*noop*/ },

  _init: Ember.on('didInsertElement', function() {
    const popupContent = this.createPopupContent();
    const popup = new L.Popup({
      maxWidth: 'auto'
    })
      .setLatLng([this.get('lat'), this.get('lng')])
      .setContent(popupContent)
      .addTo(this.get('map'));

    this.get('map').on('popupclose', e => {
      if (e.popup === popup) {
        this.get('closePopup')();
      }
    });

    this.set('popup', popup);
  }),

  _update: Ember.on('didUpdateAttrs', function() {
    this.removeConversionError();
    this.get('popup')
      .setLatLng([this.get('lat'), this.get('lng')]);
  }),

  _teardown: Ember.on('willDestroyElement', function() {
    this.get('map').off('popupclose');
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

  setConversionError(err) {
    this.removeConversionError();
    Ember.$('.coordinates-popup-table').append(Ember.$(`<caption>${err}</caption>`));
  },

  removeConversionError() {
    Ember.$('.coordinates-popup-table caption').remove();
  },

  actions: {
    setLat(lat) {
      this.get('setLatLng')([parseFloat(lat), this.get('lng')]);
    },

    setLng(lng) {
      this.get('setLatLng')([this.get('lat'), parseFloat(lng)]);
    },

    setMGRS(mgrs) {
      try {
        const latLng = Mgrs.parse(mgrs).toUtm().toLatLonE();
        this.get('setLatLng')([latLng.lat, latLng.lon]);
      } catch (e) {
        this.setConversionError(e);
      }
    },

    setDMSLat(lat) {
      try {
        const latLng = [Dms.parseDMS(lat), this.get('lng')];
        this.get('setLatLng')(latLng);
      } catch (e) {
        this.setConversionError(e);
      }
    },

    setDMSLng(lng) {
      try {
        const latLng = [this.get('lat'), Dms.parseDMS(lng)];
        this.get('setLatLng')(latLng);
      } catch (e) {
        this.setConversionError(e);
      }
    },

    setUTM(utm) {
      try {
        const latLng = Utm.parse(utm).toLatLonE();
        this.get('setLatLng')([latLng.lat, latLng.lon]);
      } catch (e) {
        this.setConversionError(e);
      }
    }
  }
});
