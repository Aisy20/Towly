import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import * as Location from 'expo-location';
import { useMapStore } from '../store/mapStore';

export function useLocation() {
  const [error, setError] = useState<string | null>(null);
  const { userLocation, setUserLocation } = useMapStore();

  useEffect(() => {
    let sub: Location.LocationSubscription | null = null;
    let cancelled = false;

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setError('Location permission denied. Townly needs your location to show nearby reports.');
          return;
        }

        const loc = await Location.getCurrentPositionAsync({
          // Balanced accuracy is fine on native; on web the browser decides
          accuracy: Location.Accuracy.Balanced,
        });

        if (!cancelled) {
          setUserLocation(loc.coords.latitude, loc.coords.longitude);
        }

        // watchPositionAsync is not well-supported on web — skip it there
        if (Platform.OS !== 'web') {
          sub = await Location.watchPositionAsync(
            { accuracy: Location.Accuracy.Balanced, distanceInterval: 50 },
            (update) => {
              if (!cancelled) {
                setUserLocation(update.coords.latitude, update.coords.longitude);
              }
            },
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError('Could not get location.');
        }
      }
    })();

    return () => {
      cancelled = true;
      sub?.remove();
    };
  }, []);

  return { location: userLocation, error };
}
