import React, { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleMap, useLoadScript, StandaloneSearchBox } from '@react-google-maps/api';

const libraries = ['places'];

const MapComponent = ({ onLocationChange, postButton, windowContainer, displayed }) => {
  const darkModeStyle = [
    {
      elementType: 'geometry',
      stylers: [
        {
          color: '#28343e', // Matches --secondary-bg-color
        },
      ],
    },
    {
      elementType: 'labels.text.fill',
      stylers: [
        {
          color: '#8ba9b8', // Lightened for text visibility
        },
      ],
    },
    {
      elementType: 'labels.text.stroke',
      stylers: [
        {
          color: '#06141d', // Matches --bg-color
        },
      ],
    },
    {
      featureType: 'administrative',
      elementType: 'geometry',
      stylers: [
        {
          color: '#28343e', // Matches --bg-color-lighter
        },
      ],
    },
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [
        {
          color: '#06141d', // Matches --bg-color
        },
      ],
    },
    {
      featureType: 'road',
      elementType: 'geometry',
      stylers: [
        {
          color: '#1b2730', // Matches --secondary-bg-color
        },
      ],
    },
    {
      featureType: 'poi',
      elementType: 'geometry',
      stylers: [
        {
          color: '#28343e', // Matches --bg-color-lighter
        },
      ],
    },
    {
      featureType: 'transit',
      elementType: 'geometry',
      stylers: [
        {
          color: '#06141d', // Matches --bg-color
        },
      ],
    },
  ];

  const [center, setCenter] = useState({});

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCenter({ lat: latitude, lng: longitude });
          setMarkerPosition({ lat: latitude, lng: longitude });
        },
        () => {
          console.error('Geolocation access denied');
        }
      );
    } else {
      console.error('Geolocation not supported by this browser');
    }
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const placeDetails = useRef({
    name: null,
    lat: null,
    lng: null,
    link: null,
  });

  const [zoom, setZoom] = useState(18);
  const [markerPosition, setMarkerPosition] = useState(center);

  const searchBoxRef = useRef();
  const searchInputRef = useRef();
  const mapRef = useRef(); // Reference to the map instance
  const markerRef = useRef(); // Reference to the marker instance

  useEffect(() => {
    if (searchInputRef.current != null) {
      searchInputRef.current.value = '';
    }

    setMarkerPosition(center);
    placeDetails.current = {
      name: null,
      lat: null,
      lng: null,
      link: null,
    };
  }, [displayed]);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: 'AIzaSyB3uOPebdXTyyVecG-tBlNDXsEbMLd3XIc', // Replace with your API key
    // googleMapsApiKey: 'AIzaSyAOVYRIgupAurZup5y1PRh8Ismb1A3lLao',
    libraries,
    language: 'en',
  });

  const onPlacesChanged = useCallback(() => {
    const places = searchBoxRef.current.getPlaces();

    if (places.length === 0) {
      return;
    }

    const place = places[0];
    if (!place.geometry) {
      console.log('Returned place contains no geometry');
      return;
    }

    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();
    const placeName = place.types.includes('establishment') ? `${place.name}, ${place.vicinity}` : place.formatted_address;
    const placeId = place.place_id;
    placeDetails.current = {
      name: placeName,
      lat,
      lng,
      link: place.types.includes('establishment') ? `https://www.google.com/maps/place/?q=place_id:${placeId}` : `https://maps.google.com/maps?q=loc:${lat},${lng}`,
    };
    setMarkerPosition({ lat, lng });
    setCenter({ lat, lng });
    onLocationChange(placeDetails.current);
  });

  const handleClick = useCallback((event) => {
    postButton.current.style.pointerEvents = 'none';
    postButton.current.style.opacity = '0.5';
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    setMarkerPosition({ lat, lng });

    if (event.placeId) {
      event.stop();

      const service = new window.google.maps.places.PlacesService(mapRef.current);
      service.getDetails({ placeId: event.placeId }, (place, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          postButton.current.style.pointerEvents = 'auto';
          postButton.current.style.opacity = '1';
          const placeName = `${place.name}, ${place.vicinity}`;
          placeDetails.current = {
            name: placeName,
            lat,
            lng,
            link: `https://www.google.com/maps/place/?q=place_id:${event.placeId}`,
          };
          searchInputRef.current.value = placeName;
          onLocationChange(placeDetails.current);
        }
      });
    } else {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: event.latLng }, (results, status) => {
        if (status === 'OK' && results[0]) {
          postButton.current.style.pointerEvents = 'auto';
          postButton.current.style.opacity = '1';
          const placeName = results[0].formatted_address;
          placeDetails.current = {
            name: placeName,
            lat,
            lng,
            link: `https://maps.google.com/maps?q=loc:${lat},${lng}`,
          };
          searchInputRef.current.value = placeName;
          onLocationChange(placeDetails.current);
        }
      });
    }
  });

  useEffect(() => {
    if (isLoaded && markerRef.current) {
      const marker = new window.google.maps.marker.AdvancedMarkerElement({
        map: mapRef.current,
        position: markerPosition,
        title: 'Marker',
        draggable: true,
      });

      marker.addListener('dragend', (event) => {
        handleClick(event);
      });

      markerRef.current = marker;
    }
  }, [isLoaded, markerPosition]);

  if (!isLoaded)
    return (
      <>
        <div className="map-skeleton" style={{ height: '40px', marginTop: '0px' }}></div>
        <div className="map-skeleton"></div>
      </>
    );

  return (
    <>
      <StandaloneSearchBox onLoad={(ref) => (searchBoxRef.current = ref)} onPlacesChanged={onPlacesChanged}>
        <input className="uniqueField" onFocus={() => (windowContainer.current.style.overflowY = 'hidden')} onBlur={() => (windowContainer.current.style.overflowY = 'auto')} ref={searchInputRef} type="text" placeholder="Search for places" />
      </StandaloneSearchBox>
      <div className="map">
        <GoogleMap mapContainerStyle={{ height: '100%', width: '100%' }} center={center} zoom={zoom} onClick={handleClick} onLoad={(map) => (mapRef.current = map)} options={{ styles: darkModeStyle }}>
          {/* Marker is now handled by AdvancedMarkerElement */}
        </GoogleMap>
      </div>
    </>
  );
};

export default MapComponent;
