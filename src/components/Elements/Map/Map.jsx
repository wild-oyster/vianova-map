/* eslint-disable react/prop-types */
/* eslint-disable no-return-assign */
import React, { Component } from 'react';
import './Map.scss';

// Import mapboxgl library
import mapboxgl from 'mapbox-gl';

// Import Geojson data to display
import districtNY from './data/districtNewYork.geojson';
import marker from './assets/markerStation.png';

// Providing token to generate the map
mapboxgl.accessToken =
  'pk.eyJ1IjoiZmxvcmVudGxlbSIsImEiOiJja2hveDNuYzcxNWY5MndteDM2djE3NnlxIn0.UuP-JCIEimNyvaSefaRr9A';

class Map extends Component {
  constructor(props) {
    super(props);
    // State for initial map positions when loading the web-app as well as the initial zoom
    this.state = {
      lat: 40.699231753990865,
      lng: -74.0483786650457,
      zooom: 10,
    };
  }

  // ComponentDidMount for generating the map when loading the page
  componentDidMount() {
    // Destructuring usefull items
    const { stationList, setSelectedMarker } = this.props;
    const { lat, lng, zooom } = this.state;
    const { mapContainer } = this;

    // Generating a new map with the mapboxgl.Map method where we give the style, the container of the map as well as the state values
    const map = new mapboxgl.Map({
      container: mapContainer,
      style: 'mapbox://styles/florentlem/ckk45dsav4tov17nl6ecgboqu',
      center: [lng, lat],
      zoom: zooom,
      attributionControl: false,
    });

    // Adding Geolocalisation and Navigation Controls to the map
    map.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: false,
        },
        trackUserLocation: true,
        fitBoundsOptions: { maxZoom: 8 },
      })
    );
    map.addControl(new mapboxgl.NavigationControl());

    // Creating district layer with the geojson file as a source
    map.on('load', () => {
      map.addSource('new york', {
        type: 'geojson',
        data: districtNY,
      });
      map.addLayer({
        id: 'new york',
        type: 'fill',
        source: 'new york',
        layout: {},
        maxzoom: 12,
        minzoom: 9,
        paint: {
          'fill-color': '#FFF',
          'fill-opacity': 0.8,
        },
      });
    });

    const coord = stationList.map((el, index) => {
      return {
        type: 'Feature',
        properties: {
          id: index,
          location: el.name,
        },
        geometry: {
          type: 'Point',
          coordinates: [el.lon, el.lat],
        },
      };
    });

    map.on('load', () => {
      map.loadImage(marker, (error, image) => {
        if (error) throw error;
        map.addImage('custom-marker', image);
        map.addSource('points', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: coord,
          },
        });

        map.addLayer({
          id: 'points',
          type: 'symbol',
          minzoom: 12,
          source: 'points',
          layout: {
            'icon-image': 'custom-marker',
            'icon-size': 0.06,
          },
        });

        map.on('click', 'points', (e) => {
          const coordinates = e.features[0].geometry.coordinates.slice();
          const place = e.features[0].properties.location;

          new mapboxgl.Popup().setLngLat(coordinates).setHTML(place).addTo(map);
          map.flyTo({
            center: e.features[0].geometry.coordinates,
            zoom: 17,
            speed: 1,
          });
          setSelectedMarker(e.features[0].properties.id);
        });
      });
    });
  }

  render() {
    return (
      // assigning the container for the map to generate
      <div
        ref={(el) => (this.mapContainer = el)}
        className="map__globalContainer"
      />
    );
  }
}

export default Map;
