import L           from 'leaflet';

export function geoJSON2LeafletLayer(geoJSON,
  styleFn = feature => defaultPolygonStyle,
  pointToLayerFn = (feature, latLng) => new L.Marker(latLng, {icon: defaultIcon})) {
    return new L.GeoJSON(geoJSON || null, {
      style: styleFn,
      pointToLayer: pointToLayerFn
    });
}

export function featureCollection2GeometryCollection(featureCollection) {
  return {
    type: 'GeometryCollection',
    geometries: featureCollection.features.mapBy('geometry')
  };
}

export function geomCollection2FeatureCollection(geometryCollection) {
  return {
    type: 'FeatureCollection',
    features: geometryCollection.geometries.map(geometry => ({
      type: 'Feature',
      properties: {},
      geometry
    }))
  };
}

export function isGeometryCollection(geoJSON = {}) {
  return geoJSON.type === 'GeometryCollection' ||
    geoJSON.features && geoJSON.features.any(isGeometryCollection);
}

export function circleFeatureToGeoJSON(circleFeature) {
  const pointGeoJSON = circleFeature.toGeoJSON();
  pointGeoJSON.properties.radius = circleFeature.getRadius();
  return pointGeoJSON;
}

export const defaultPolygonStyle = {
  color: '#FFC04C',
  weight: 4,
  opacity: 0.8,
  clickable: true
};

export const defaultIcon = L.icon({
  iconUrl: 'assets/images/l_orange.svg',
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  shadowUrl: 'assets/images/marker-shadow.png',
  shadowSize: [41, 41],
  shadowAnchor: [14, 41]
});
