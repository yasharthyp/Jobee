import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';
import { useAuth } from '../context/AuthContext';

interface LocationState {
  userCity: string | null;
  userState: string | null;
  loading: boolean;
  permissionDenied: boolean;
}

export function useLocation() {
  const { worker, profile } = useAuth();
  const [state, setState] = useState<LocationState>({
    userCity: null,
    userState: null,
    loading: true,
    permissionDenied: false,
  });

  const applyFallback = useCallback(() => {
    const city = worker?.city ?? profile?.city ?? null;
    const region = worker?.state ?? profile?.state ?? null;
    setState({ userCity: city, userState: region, loading: false, permissionDenied: true });
  }, [worker, profile]);

  const requestLocation = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true }));
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        applyFallback();
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const [geo] = await Location.reverseGeocodeAsync({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });

      if (geo) {
        setState({
          userCity: geo.city ?? geo.subregion ?? null,
          userState: geo.region ?? null,
          loading: false,
          permissionDenied: false,
        });
      } else {
        applyFallback();
      }
    } catch {
      applyFallback();
    }
  }, [applyFallback]);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  return { ...state, requestLocation };
}
