import React from 'react';

export const MapContainer: React.FC<{ children?: React.ReactNode } & Record<string, unknown>> = ({ children }) => (
  <div>{children}</div>
);
export const TileLayer: React.FC = () => null;
export const Marker: React.FC = () => null;
export const Popup: React.FC<{ children?: React.ReactNode }> = ({ children }) => <div>{children}</div>;
export const Circle: React.FC = () => null;
export const Rectangle: React.FC = () => null;
export const ScaleControl: React.FC = () => null;
export const ZoomControl: React.FC = () => null;
export const useMap = () => ({
  on: () => {},
  off: () => {},
  setView: () => {},
  fitBounds: () => {},
});

export default {} as unknown as Record<string, unknown>;


