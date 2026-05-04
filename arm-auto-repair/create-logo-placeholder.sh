#!/bin/bash
# Create an SVG placeholder logo with ARM branding

cat > /tmp/arm-logo.svg << 'LOGOSVG'
<svg width="500" height="500" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      .badge { fill: #1E3A5F; }
      .accent { fill: #C8102E; }
      .text { fill: #F4EDE4; font-family: 'Arial Black', sans-serif; font-weight: 900; }
    </style>
  </defs>
  
  <!-- Outer circle - Blue -->
  <circle cx="250" cy="250" r="240" class="badge" stroke="#F4EDE4" stroke-width="8"/>
  
  <!-- Red arc top -->
  <path d="M 250 10 A 240 240 0 0 1 490 250 L 460 250 A 210 210 0 0 0 250 40 Z" class="accent"/>
  
  <!-- Inner circle -->
  <circle cx="250" cy="250" r="180" fill="none" stroke="#F4EDE4" stroke-width="4"/>
  
  <!-- ARM text -->
  <text x="250" y="280" text-anchor="middle" font-size="120" class="text" letter-spacing="-5">ARM</text>
  
  <!-- AUTO REPAIR text (top arc) -->
  <path id="topArc" d="M 100,150 A 150,150 0 0,1 400,150" fill="none"/>
  <text class="text" font-size="32" letter-spacing="8">
    <textPath href="#topArc" startOffset="50%" text-anchor="middle">
      AUTO REPAIR
    </textPath>
  </text>
  
  <!-- AND MAINTENANCE text (bottom arc) -->
  <path id="bottomArc" d="M 100,350 A 150,150 0 0,0 400,350" fill="none"/>
  <text class="text" font-size="28" letter-spacing="4">
    <textPath href="#bottomArc" startOffset="50%" text-anchor="middle">
      AND MAINTENANCE
    </textPath>
  </text>
  
  <!-- Wrench icons -->
  <g transform="translate(180, 240) rotate(-45)" fill="#F4EDE4">
    <rect x="-3" y="-40" width="6" height="80" rx="2"/>
    <circle cx="0" cy="-45" r="12"/>
  </g>
  <g transform="translate(320, 240) rotate(45)" fill="#F4EDE4">
    <rect x="-3" y="-40" width="6" height="80" rx="2"/>
    <circle cx="0" cy="-45" r="12"/>
  </g>
</svg>
LOGOSVG

# Convert to PNG
convert /tmp/arm-logo.svg -resize 500x500 /tmp/arm-logo.png 2>/dev/null || \
  cp /tmp/arm-logo.svg /tmp/arm-logo.png

echo "Logo created at /tmp/arm-logo.png"
