import Ember       from 'ember';

/**
 * Create popup on leaflet layer on click
 * To prevent layer component from rendering its popup content before it's neaded to populate the popup,
 * add an hbs #if conditional to the template:
 * {{#if popupOpen}}
 *   {{yield this}}
 * {{/if}}
 *
 * popup content is removed from the component's DOM, cached on the component, and inserted into the popup
 * this means after the popup is created, component.element points to an empty <div>,
 * while component.popupContent points to the content
 */
export default Ember.Mixin.create({
  popupOpen: false,
  popupContent: null,

  _init: Ember.on('didInsertElement', function() {
    const layer = this.get('layer');

    // binding popups must happen after the element has been inserted into the DOM
    layer.eachLayer(layer => {
      layer.on('click', () => this.openPopup(layer))
    });

    this._super();
  }),

  _teardown: Ember.on('willDestroyElement', function() {
    this.get('layer').eachLayer(layer => layer.off('click'));
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

  openPopup(layer) {
    this.set('popupOpen', true);

    Ember.run.next(() => {
      // cache popupContent
      if (!this.get('popupContent')) {
        this.set('popupContent', this.createPopupContent());
      }

      const popupContent = this.get('popupContent');

      // don't bind popup if content isn't defined
      if (popupContent.childElementCount > 0) {
        layer.bindPopup(popupContent);
        layer.openPopup();
      }
    });
  }
});
