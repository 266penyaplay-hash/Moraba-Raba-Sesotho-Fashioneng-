import React from 'react';

export type LesothoAtmosphere =
  | 'golden-dawn' // Post-Rain Golden Hour · Mokena Terraced Foothills & Golden Sunbeams
  | 'winter-snow' // Winter Dawn · Alpine Snow Ridges & Frost Dusting (High Maloti Winter)
  | 'highland-storm' // Highland Storm · Dramatic Lightning, Rain Drops & Dark Basalt Glisten
  | 'khubetsoana-red' // Khubetsoana Red Earth Kraals · Sunset Dusk
  | 'highland-mist' // Leribe High Plateaus · Mountain Mist & Stone Gorge
  | 'mokhotlong-storm' // Sefako · Mokhotlong Alpine Peak Storm
  | 'tsoenene'; // Morena Letsie · Sacred Midnight Summit & Starlight

interface LesothoBackdropProps {
  atmosphere?: LesothoAtmosphere;
  sunbeamIntensity?: number; // 0 to 1
  lightAngle?: { x: number; y: number };
  usePhotographicBackdrop?: boolean;
  videoUrl?: string;
}

const DEFAULT_BACKDROP_VIDEO =
  'https://sesothofashioneng.com/wp-content/uploads/2026/08/AQMpbCfG6TKa6Nxc7pVuohmw14KrP05AHtc8aKuGVieAgatjhhKtYg8BXrXU0DGgezrmIODFq_6j28RddsD9YoggXBJH1YcSbyWp6UpEs_fvPg.mp4';

const BACKDROP_PHOTOS: Partial<Record<LesothoAtmosphere, string>> = {
  'golden-dawn': '/moraba-raba-lesotho-post-rain-golden-hour.jpeg',
  'winter-snow': '/moraba-raba-lesotho-winter-dawn.jpeg',
  'highland-storm': '/moraba-raba-lesotho-highland-storm.jpeg',
  'mokhotlong-storm': '/moraba-raba-lesotho-highland-storm.jpeg',
};

export const LesothoBackdrop: React.FC<LesothoBackdropProps> = ({
  atmosphere = 'golden-dawn',
  sunbeamIntensity = 0.85,
  usePhotographicBackdrop = true,
  videoUrl = DEFAULT_BACKDROP_VIDEO,
}) => {
  const photoUrl = BACKDROP_PHOTOS[atmosphere];
  const [videoLoaded, setVideoLoaded] = React.useState(false);
  const [videoError, setVideoError] = React.useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay may need user gesture in strict browser contexts; muted helps ensure autoplay succeeds
      });
    }
  }, [videoUrl]);
  // Atmosphere-specific palette configuration
  const getSkyColors = () => {
    switch (atmosphere) {
      case 'khubetsoana-red':
        return {
          top: '#5A1B0E',
          mid: '#3D1309',
          bot: '#1A0704',
          sun: '#FFA066',
          mist: '#8B3E23',
          peakGradTop: '#6B2918',
          peakGradBot: '#1E0905',
          ridgeGradTop: '#4A1C10',
          ridgeGradBot: '#0E0402',
        };
      case 'highland-mist':
        return {
          top: '#1E2C3A',
          mid: '#141F2B',
          bot: '#0A1017',
          sun: '#A3D2F7',
          mist: '#4A6882',
          peakGradTop: '#3D546C',
          peakGradBot: '#121A22',
          ridgeGradTop: '#243342',
          ridgeGradBot: '#080D12',
        };
      case 'mokhotlong-storm':
      case 'highland-storm':
        return {
          top: '#191B28',
          mid: '#10121C',
          bot: '#06070B',
          sun: '#9DBEFF',
          mist: '#2A3045',
          peakGradTop: '#2E3345',
          peakGradBot: '#0E1017',
          ridgeGradTop: '#1E2230',
          ridgeGradBot: '#050609',
        };
      case 'tsoenene':
        return {
          top: '#0A0814',
          mid: '#07050E',
          bot: '#030206',
          sun: '#FF7A29',
          mist: '#221838',
          peakGradTop: '#1E1730',
          peakGradBot: '#080512',
          ridgeGradTop: '#140E22',
          ridgeGradBot: '#020104',
        };
      case 'winter-snow':
      case 'golden-dawn':
      default:
        return {
          top: '#4E371C',
          mid: '#2F2113',
          bot: '#0E0B08',
          sun: '#FFE9BE',
          mist: '#D5A351',
          peakGradTop: '#FFF8EB',
          peakGradBot: '#1F1710',
          ridgeGradTop: '#44321E',
          ridgeGradBot: '#0D0906',
        };
    }
  };

  const sky = getSkyColors();
  const isGoldenDawn = atmosphere === 'golden-dawn' || atmosphere === 'winter-snow';
  const isSunsetRed = atmosphere === 'khubetsoana-red';
  const isMist = atmosphere === 'highland-mist';
  const isStorm = atmosphere === 'mokhotlong-storm' || atmosphere === 'highland-storm';
  const isMidnight = atmosphere === 'tsoenene';

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {/* Base Canvas Color */}
      <div
        className="absolute inset-0 transition-colors duration-1000"
        style={{ backgroundColor: sky.bot }}
      />

      {/* Cinematic Background Video (Lesotho Atmosphere & Landscape) */}
      {videoUrl && !videoError && (
        <div className="absolute inset-0 z-0 overflow-hidden">
          <video
            ref={videoRef}
            src={videoUrl}
            autoPlay
            loop
            muted
            playsInline
            onLoadedData={() => setVideoLoaded(true)}
            onError={() => setVideoError(true)}
            className={`w-full h-full object-cover object-center filter brightness-[0.78] contrast-[1.08] saturate-[1.05] transition-opacity duration-1000 ${
              videoLoaded ? 'opacity-95' : 'opacity-0'
            }`}
          />
          {/* Ambient Lighting & Contrast Gradient - Video remains clear and unobstructed */}
          <div
            className="absolute inset-0 mix-blend-overlay opacity-30 pointer-events-none"
            style={{
              background: isGoldenDawn
                ? 'radial-gradient(ellipse at 50% 20%, rgba(255,210,120,0.3) 0%, rgba(20,15,10,0.8) 100%)'
                : isStorm
                ? 'radial-gradient(ellipse at 50% 20%, rgba(130,170,230,0.25) 0%, rgba(8,10,15,0.85) 100%)'
                : 'radial-gradient(ellipse at 50% 20%, rgba(240,240,255,0.2) 0%, rgba(10,10,14,0.85) 100%)',
            }}
          />
          {/* Subtle bottom vignette so UI controls and game board remain perfectly legible */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-[#0B0907]/85 pointer-events-none" />
        </div>
      )}

      {/* Cinematic Photographic Fallback Lesotho Mountain Background (Only when video is loading or unsupported) */}
      {usePhotographicBackdrop && photoUrl && (!videoLoaded || videoError) && (
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src={photoUrl}
            alt="Lesotho Maloti Mountain Atmosphere"
            className="w-full h-full object-cover object-center filter brightness-[0.75] contrast-[1.08] transition-all duration-1000 scale-100"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-[#0B0907]/85 pointer-events-none" />
        </div>
      )}
    </div>
  );
};
