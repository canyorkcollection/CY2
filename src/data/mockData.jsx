import React from "react";

export const artSVGs = [
  <svg viewBox="0 0 500 420" xmlns="http://www.w3.org/2000/svg">
    <rect width="500" height="420" fill="#1a0a00"/>
    <ellipse cx="250" cy="210" rx="220" ry="180" fill="#B22222" opacity="0.7"/>
    <ellipse cx="180" cy="160" rx="140" ry="110" fill="#FF4500" opacity="0.6"/>
    <ellipse cx="320" cy="280" rx="160" ry="120" fill="#FF6B00" opacity="0.5"/>
    <ellipse cx="250" cy="210" rx="80" ry="60" fill="#FFD700" opacity="0.4"/>
    <rect x="0" y="340" width="500" height="80" fill="#0d0400" opacity="0.6"/>
    <line x1="0" y1="210" x2="500" y2="210" stroke="#FF8C00" strokeWidth="1.5" opacity="0.3"/>
    <line x1="250" y1="0" x2="250" y2="420" stroke="#FF8C00" strokeWidth="1.5" opacity="0.3"/>
  </svg>,

  <svg viewBox="0 0 500 420" xmlns="http://www.w3.org/2000/svg">
    <rect width="500" height="420" fill="#000814"/>
    <rect x="0" y="0" width="500" height="420" fill="url(#b2g)" opacity="1"/>
    <defs>
      <radialGradient id="b2g" cx="40%" cy="50%">
        <stop offset="0%" stopColor="#0047AB" stopOpacity="0.9"/>
        <stop offset="60%" stopColor="#001f5c" stopOpacity="0.7"/>
        <stop offset="100%" stopColor="#000814" stopOpacity="1"/>
      </radialGradient>
    </defs>
    <circle cx="200" cy="200" r="150" fill="none" stroke="#4488FF" strokeWidth="1" opacity="0.4"/>
    <circle cx="200" cy="200" r="100" fill="none" stroke="#4488FF" strokeWidth="1" opacity="0.3"/>
    <circle cx="200" cy="200" r="50" fill="#6699FF" opacity="0.2"/>
    <rect x="300" y="50" width="2" height="320" fill="#88AAFF" opacity="0.5"/>
    <rect x="350" y="80" width="2" height="260" fill="#88AAFF" opacity="0.3"/>
    <rect x="400" y="120" width="2" height="180" fill="#88AAFF" opacity="0.2"/>
  </svg>,

  <svg viewBox="0 0 500 420" xmlns="http://www.w3.org/2000/svg">
    <rect width="500" height="420" fill="#2C1A0E"/>
    {[0,1,2,3,4,5,6].map(i => (
      <rect key={i} x={i*72} y="0" width="36" height="420" fill={["#8B4513","#D4A017","#6B3A2A","#C68B2F","#5C2E00","#B8860B","#7A3B1E"][i]} opacity="0.7"/>
    ))}
    <rect x="0" y="160" width="500" height="40" fill="#1a0a00" opacity="0.5"/>
    <rect x="0" y="220" width="500" height="40" fill="#D4A017" opacity="0.3"/>
    <rect x="0" y="0" width="500" height="420" fill="#2C1A0E" opacity="0.35"/>
    <polygon points="250,60 310,180 190,180" fill="#FFD700" opacity="0.3"/>
    <polygon points="250,360 310,240 190,240" fill="#FFD700" opacity="0.3"/>
  </svg>,

  <svg viewBox="0 0 500 420" xmlns="http://www.w3.org/2000/svg">
    <rect width="500" height="420" fill="#050510"/>
    {[...Array(12)].map((_,i) => (
      <path key={i} d={`M${i*45},0 Q${i*45+80},210 ${i*45},420`} fill="none" stroke={`hsl(${200+i*12},90%,60%)`} strokeWidth="1.5" opacity={0.15+i*0.04}/>
    ))}
    {[...Array(8)].map((_,i) => (
      <ellipse key={i} cx="250" cy="210" rx={40+i*28} ry={25+i*18} fill="none" stroke={`hsl(${180+i*15},80%,55%)`} strokeWidth="1" opacity={0.2}/>
    ))}
    <circle cx="250" cy="210" r="20" fill="#00FFFF" opacity="0.5"/>
    <circle cx="250" cy="210" r="8" fill="#ffffff" opacity="0.8"/>
  </svg>,

  <svg viewBox="0 0 500 420" xmlns="http://www.w3.org/2000/svg">
    <rect width="500" height="420" fill="#E8EEF4"/>
    <rect x="0" y="280" width="500" height="140" fill="#C8D8E8" opacity="0.6"/>
    {[...Array(6)].map((_,i) => (
      <rect key={i} x={i*90-20} y={180+i%2*40} width="70" height={100+i*10} fill="#B0C4DE" opacity={0.3+i*0.05}/>
    ))}
    <rect x="0" y="0" width="500" height="420" fill="url(#arctic)" opacity="0.4"/>
    <defs>
      <linearGradient id="arctic" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9"/>
        <stop offset="100%" stopColor="#4A7AAF" stopOpacity="0.3"/>
      </linearGradient>
    </defs>
    {[...Array(20)].map((_,i) => (
      <circle key={i} cx={Math.sin(i*137)*200+250} cy={Math.cos(i*97)*150+210} r={2+i%4} fill="#0047AB" opacity={0.08+i%3*0.04}/>
    ))}
  </svg>,
];

export const artworks = [
  { id: 1, title: "Resonancia Ígnea", year: "2021", artist: "Marta Solà", technique: "Óleo sobre lienzo", dimensions: "180 × 240 cm", svgIdx: 0, description: "Una exploración de la energía latente en la materia orgánica. Solà trabaja con capas densas de pigmento mineral para invocar la sensación de calor contenido, de lava que aguarda bajo la superficie de lo cotidiano. La obra pertenece a su serie 'Telúrica', donde el cuerpo humano y el paisaje geológico se funden en una sola entidad palpitante. El espectador es invitado a acercarse hasta que los bordes del lienzo desaparezcan de su campo visual, quedando inmerso en una textura que respira." },
  { id: 2, title: "Umbrales del Azul", year: "2019", artist: "Jordi Puig", technique: "Acrílico y resina", dimensions: "150 × 150 cm", svgIdx: 1, description: "Puig construye capas semitransparentes de resina pigmentada para crear una profundidad óptica que desafía la bidimensionalidad del plano pictórico. Inspirado en los escritos de Yves Klein sobre el azul como dimensión espiritual, cada capa agrega un velo de silencio. La obra tardó once meses en completarse, ya que cada estrato de resina requería un secado de tres semanas antes de poder aplicar el siguiente. El resultado es una ventana hacia una interioridad azul sin fondo." },
  { id: 3, title: "Fractura y Gracia", year: "2022", artist: "Amina Osei", technique: "Técnica mixta sobre madera", dimensions: "200 × 130 cm", svgIdx: 2, description: "Osei incorpora fragmentos de tela kente desintegrada junto con carbón vegetal y pigmento dorado. La dicotomía entre la ruptura y la elegancia es el nervio central de toda su práctica: lo que se rompe puede reorganizarse en algo más honesto que su forma original. Esta pieza específica fue creada tras la pérdida de su estudio en un incendio; los materiales rescatados del siniestro forman parte del soporte. La madera carbonizada visible en los bordes es un archivo de esa memoria." },
  { id: 4, title: "Campo Magnético #7", year: "2020", artist: "Lea Brandt", technique: "Pintura digital impresa en aluminio", dimensions: "120 × 180 cm", svgIdx: 3, description: "Brandt genera sus obras mediante algoritmos de simulación de campos electromagnéticos, convirtiendo datos invisibles en paisajes cromáticos. 'Campo Magnético #7' es el resultado de visualizar el campo magnético de Barcelona durante el solsticio de verano de 2020. Las líneas de fuerza se traducen en flujos de color que recuerdan tanto a la pintura gestual como a la fotografía de larga exposición. La impresión sobre aluminio añade un brillo metálico que cambia según el ángulo de visión del espectador." },
  { id: 5, title: "Noche Blanca", year: "2023", artist: "Irina Voss", technique: "Encáustica sobre tabla", dimensions: "90 × 120 cm", svgIdx: 4, description: "La encáustica, técnica de pigmentos en cera caliente usada desde la antigüedad, es el vehículo elegido por Voss para hablar de lo efímero y lo permanente. 'Noche Blanca' surge de sus residencias en Laponia, donde la ausencia de oscuridad durante el verano ártico generó en ella una profunda desorientación temporal. La superficie de cera acumula marcas de espátula, soplete y dedos; un diario táctil de semanas sin atardecer. La paleta monocroma evoca esa quietud ambigua entre el sueño y la vigilia." },
];