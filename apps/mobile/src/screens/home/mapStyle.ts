/**
 * Calm, muted Google-map styling for the Home map — tints water and parks with
 * the design-system map tokens. Applied via MapView `customMapStyle`; ignored on
 * platforms that don't support it (e.g. Apple Maps on iOS), which fall back to
 * the default basemap. Hence "park/water treatment where supported".
 */
import { palette } from '@/theme';

export const townlyMapStyle = [
  { elementType: 'geometry', stylers: [{ color: palette.mapBlocks }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: palette.inkMuted }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: palette.surface }] },
  { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: palette.mapGround }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: palette.mapPark }] },
  { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: palette.surface }] },
  { featureType: 'road', elementType: 'labels', stylers: [{ visibility: 'simplified' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: palette.mapWater }] },
];
