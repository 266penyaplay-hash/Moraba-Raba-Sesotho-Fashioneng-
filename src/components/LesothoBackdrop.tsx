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
            className={`w-full h-full object-cover object-center filter brightness-[0.72] contrast-[1.12] saturate-[1.1] transition-opacity duration-1000 scale-[1.02] ${
              videoLoaded ? 'opacity-90' : 'opacity-0'
            }`}
            style={{
              maskImage:
                'linear-gradient(to bottom, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.88) 55%, rgba(0,0,0,0.4) 85%, rgba(0,0,0,0.15) 100%)',
              WebkitMaskImage:
                'linear-gradient(to bottom, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.88) 55%, rgba(0,0,0,0.4) 85%, rgba(0,0,0,0.15) 100%)',
            }}
          />
          {/* Subtle Ambient Color Wash & Vignette on top of video */}
          <div
            className="absolute inset-0 mix-blend-overlay opacity-60 pointer-events-none"
            style={{
              background: isGoldenDawn
                ? 'radial-gradient(ellipse at 50% 15%, rgba(255,200,100,0.35) 0%, rgba(30,20,12,0.9) 100%)'
                : isStorm
                ? 'radial-gradient(ellipse at 50% 15%, rgba(120,160,220,0.3) 0%, rgba(10,12,18,0.95) 100%)'
                : 'radial-gradient(ellipse at 50% 15%, rgba(240,240,255,0.25) 0%, rgba(14,14,16,0.9) 100%)',
            }}
          />
          {/* Darkening bottom gradient so UI controls remain perfectly legible */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0E0C0A]/40 to-[#0E0C0A]/90 pointer-events-none" />
        </div>
      )}

      {/* Cinematic Photographic Fallback Lesotho Mountain Background */}
      {usePhotographicBackdrop && photoUrl && (!videoLoaded || videoError) && (
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src={photoUrl}
            alt="Lesotho Maloti Mountain Atmosphere"
            className="w-full h-full object-cover object-top filter brightness-[0.72] contrast-[1.12] transition-all duration-1000 scale-105"
            style={{
              maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.85) 45%, rgba(0,0,0,0.25) 78%, rgba(0,0,0,0.05) 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.85) 45%, rgba(0,0,0,0.25) 78%, rgba(0,0,0,0.05) 100%)',
            }}
          />
          {/* Subtle Ambient Color Wash */}
          <div
            className="absolute inset-0 mix-blend-overlay opacity-60 pointer-events-none"
            style={{
              background: isGoldenDawn
                ? 'radial-gradient(ellipse at 50% 15%, rgba(255,200,100,0.4) 0%, rgba(30,20,12,0.9) 100%)'
                : isStorm
                ? 'radial-gradient(ellipse at 50% 15%, rgba(120,160,220,0.3) 0%, rgba(10,12,18,0.95) 100%)'
                : 'radial-gradient(ellipse at 50% 15%, rgba(240,240,255,0.3) 0%, rgba(14,14,16,0.9) 100%)',
            }}
          />
        </div>
      )}

      {/* Panoramic Multi-Layered Lesotho Mountain Landscape SVG */}
      <svg
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMin slice"
        className={`absolute inset-0 w-full h-full transition-opacity duration-700 ${
          videoLoaded ? 'opacity-25 mix-blend-screen' : usePhotographicBackdrop && photoUrl ? 'opacity-40 mix-blend-screen' : 'opacity-85'
        }`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Dynamic Sky Gradient */}
          <linearGradient id="sky-gradient" x1="0%" y1="0%" x2="30%" y2="100%">
            <stop offset="0%" stopColor={sky.top} stopOpacity="0.95" />
            <stop offset="45%" stopColor={sky.mid} stopOpacity="0.85" />
            <stop offset="100%" stopColor={sky.bot} stopOpacity="1" />
          </linearGradient>

          {/* Distant Snow/Mountain Peak Gradient */}
          <linearGradient id="far-peak-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={sky.peakGradTop} stopOpacity="0.95" />
            <stop offset="35%" stopColor={sky.peakGradTop} stopOpacity="0.65" />
            <stop offset="85%" stopColor={sky.peakGradBot} stopOpacity="0.95" />
            <stop offset="100%" stopColor={sky.bot} stopOpacity="1" />
          </linearGradient>

          {/* Mid-ground Mountain Slope Gradient */}
          <linearGradient id="mid-ridge-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={sky.ridgeGradTop} stopOpacity="0.88" />
            <stop offset="100%" stopColor={sky.ridgeGradBot} stopOpacity="0.98" />
          </linearGradient>

          {/* Rolling Fog / Cloud Sea Gradient */}
          <linearGradient id="valley-fog-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop
              offset="0%"
              stopColor={
                isGoldenDawn
                  ? '#FFF0D4'
                  : isSunsetRed
                  ? '#FF8C66'
                  : isMist
                  ? '#8BB4D9'
                  : isStorm
                  ? '#47536E'
                  : '#583D7A'
              }
              stopOpacity={isMist ? 0.65 : 0.45}
            />
            <stop offset="60%" stopColor={sky.mist} stopOpacity="0.25" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </linearGradient>

          {/* Sunbeam Golden God-Ray Gradient */}
          <linearGradient id="god-ray-beam" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={sky.sun} stopOpacity="0.55" />
            <stop offset="35%" stopColor="#E3B367" stopOpacity="0.25" />
            <stop offset="75%" stopColor="#B88636" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#A98545" stopOpacity="0" />
          </linearGradient>

          {/* Sunrise Alpine Sun Glow (Matenase) */}
          <radialGradient id="sun-alpine-glow" cx="22%" cy="14%" r="48%">
            <stop offset="0%" stopColor={sky.sun} stopOpacity="0.9" />
            <stop offset="20%" stopColor="#FFC875" stopOpacity="0.55" />
            <stop offset="55%" stopColor="#D99B42" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>

          {/* Sunset Dusk Sun Glow (Bothata) */}
          <radialGradient id="sunset-dusk-glow" cx="78%" cy="20%" r="50%">
            <stop offset="0%" stopColor="#FF8542" stopOpacity="0.95" />
            <stop offset="25%" stopColor="#D94B26" stopOpacity="0.6" />
            <stop offset="60%" stopColor="#731C0C" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>

          {/* Storm Lightning Cloud Backlight Glow (Sefako) */}
          <radialGradient id="storm-cloud-glow" cx="75%" cy="10%" r="55%">
            <stop offset="0%" stopColor="#A3CCFF" stopOpacity="0.45" />
            <stop offset="35%" stopColor="#4A5E78" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>

          {/* Sacred Starlight Moon & Hearth Glow (Morena) */}
          <radialGradient id="midnight-hearth-glow" cx="50%" cy="85%" r="60%">
            <stop offset="0%" stopColor="#FF7A29" stopOpacity="0.4" />
            <stop offset="40%" stopColor="#8A2E14" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Sky Base */}
        <rect width="1440" height="900" fill="url(#sky-gradient)" />

        {/* Starfield for Sacred Midnight (Tsoenene / Morena Letsie) */}
        {isMidnight && (
          <g opacity="0.85">
            {[
              [120, 45, 1.2], [240, 80, 1.5], [380, 50, 1], [450, 110, 1.8],
              [580, 40, 1.2], [690, 95, 1], [810, 60, 2], [930, 45, 1.2],
              [1050, 85, 1.6], [1180, 40, 1.4], [1310, 75, 1.2], [1400, 50, 1.8],
              [180, 130, 1], [310, 160, 1.4], [520, 140, 1.2], [760, 150, 1.7],
              [990, 130, 1.1], [1120, 160, 1.5], [1280, 140, 1],
            ].map(([cx, cy, r], i) => (
              <circle
                key={`star-${i}`}
                cx={cx}
                cy={cy}
                r={r}
                fill="#FFFDF5"
                opacity={0.5 + (i % 5) * 0.1}
              />
            ))}
            {/* Sacred Basotho Constellation lines */}
            <path
              d="M 450 110 L 580 40 L 690 95 L 810 60"
              stroke="#D5A351"
              strokeWidth="0.75"
              strokeOpacity="0.4"
              strokeDasharray="2,3"
              fill="none"
            />
            <circle cx="810" cy="60" r="4" fill="#FFD700" opacity="0.8" />
            {/* Glowing Crescent Moon */}
            <circle cx="1180" cy="90" r="22" fill="#FFEAA7" opacity="0.85" />
            <circle cx="1186" cy="86" r="19" fill="#0A0814" />
          </g>
        )}

        {/* Dynamic Celestial Light Source */}
        {isGoldenDawn && (
          <g>
            <circle cx="310" cy="120" r="380" fill="url(#sun-alpine-glow)" />
            <circle cx="310" cy="120" r="28" fill="#FFFCE8" opacity="0.9" />
          </g>
        )}

        {isSunsetRed && (
          <g>
            <circle cx="1120" cy="180" r="360" fill="url(#sunset-dusk-glow)" />
            <circle cx="1120" cy="180" r="32" fill="#FFA566" opacity="0.95" />
          </g>
        )}

        {isStorm && (
          <g>
            <circle cx="1080" cy="90" r="420" fill="url(#storm-cloud-glow)" />
          </g>
        )}

        {isMidnight && (
          <circle cx="720" cy="780" r="500" fill="url(#midnight-hearth-glow)" />
        )}

        {/* Layer 1: Highest Alpine Maloti Peaks with Ridge Formations */}
        <g id="layer-far-peaks">
          <path
            d="M 0 380 L 140 240 L 260 290 L 380 180 L 490 270 L 620 220 L 780 340 L 920 190 L 1080 130 L 1260 210 L 1440 320 L 1440 900 L 0 900 Z"
            fill="url(#far-peak-grad)"
          />

          {/* Snow & Light Highlights on Jagged Ridges */}
          {isGoldenDawn && (
            <g opacity="0.85" fill="#FFFDF8">
              <polygon points="380,180 340,230 370,240 385,210 400,245 425,230" opacity="0.9" />
              <polygon points="920,190 880,240 910,250 930,225 950,255 970,235" opacity="0.92" />
              <polygon points="1080,130 1020,200 1060,220 1085,180 1120,220 1160,190 1200,225 1240,195" opacity="0.95" />
              <path
                d="M 1080 130 L 1090 260 M 1060 220 L 1040 310 M 1120 220 L 1145 320 M 380 180 L 360 280 M 920 190 L 940 300"
                stroke="#FFFFFF"
                strokeWidth="2.5"
                strokeOpacity="0.75"
                fill="none"
              />
            </g>
          )}
        </g>

        {/* Layer 2: Rolling Sea of Valley Clouds / Mountain Fog */}
        <g id="layer-valley-clouds" opacity={isMist ? 0.85 : isGoldenDawn ? 0.75 : 0.5}>
          <ellipse cx="640" cy="350" rx="520" ry={isMist ? 85 : 60} fill="url(#valley-fog-grad)" />
          <ellipse cx="1120" cy="330" rx="400" ry={isMist ? 70 : 48} fill="url(#valley-fog-grad)" />
          <ellipse cx="260" cy="370" rx="360" ry={isMist ? 65 : 42} fill="url(#valley-fog-grad)" />
        </g>

        {/* Layer 3: Mid-ground Mountain Massif & Canyon Escarpment */}
        <g id="layer-mid-mountains">
          <path
            d="M 0 310 Q 220 210, 410 320 Q 640 430, 890 380 Q 1140 280, 1440 460 L 1440 900 L 0 900 Z"
            fill="url(#mid-ridge-grad)"
          />

          {/* Storm Gorge River Canyon */}
          {isStorm && (
            <path
              d="M 720 380 Q 750 490, 710 610 Q 670 720, 690 850"
              fill="none"
              stroke="#5D8AB8"
              strokeWidth="5"
              strokeOpacity="0.45"
              filter="blur(1px)"
            />
          )}
        </g>

        {/* Layer 4: Foreground Mountain Plateau & Basotho Foothills */}
        <path
          d="M 0 540 Q 280 460, 620 530 Q 980 610, 1440 520 L 1440 900 L 0 900 Z"
          fill={sky.bot}
        />

        {/* Layer 5: Volumetric Sunbeams / God-Rays (Golden Dawn) */}
        {isGoldenDawn && (
          <g opacity={sunbeamIntensity} style={{ mixBlendMode: 'screen' }}>
            <polygon points="290,110 330,110 820,900 580,900" fill="url(#god-ray-beam)" />
            <polygon points="310,120 350,120 1160,900 920,900" fill="url(#god-ray-beam)" opacity="0.7" />
            <polygon points="280,100 310,100 480,900 320,900" fill="url(#god-ray-beam)" opacity="0.6" />
          </g>
        )}
      </svg>
    </div>
  );
};
