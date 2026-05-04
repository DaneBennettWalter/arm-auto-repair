# ARM Auto Repair Website

Professional website for ARM Auto Repair and Mechanical - ASE Certified auto repair serving Robstown and the Coastal Bend region of Texas.

## Project Overview

**Domain:** armautotx.com  
**Business:** ARM Auto Repair and Mechanical  
**Location:** 601 E Main St, Robstown, TX 78380  
**Phone:** (361) 220-1629

## Design Philosophy

- **Vintage Americana meets modern brutalism** - Bold, unique, memorable
- **Custom CSS** - No Bootstrap templates, fully custom design
- **Mobile-first** - Tap-to-call priority, optimized for on-the-go customers
- **SEO-focused** - Extensive services page, regional targeting across Coastal Bend

## Tech Stack

- **HTML5** - Semantic markup
- **CSS3** - Custom styles with CSS Grid and Flexbox
- **Vanilla JavaScript** - Minimal, purposeful interactions
- **Google Fonts** - Bebas Neue (display) + Inter (body)
- **Formspree** - Contact form handling (free tier)

## Project Structure

```
src/
├── index.html          # Homepage
├── services.html       # Extensive services page (30+ services)
├── css/
│   └── styles.css      # Custom styles
├── js/
│   └── script.js       # Mobile menu, smooth scroll, tracking
└── images/
    └── logo.png        # ARM logo (to be added)
```

## Pages

### Home (`index.html`)
- Hero with aerial footage background
- Services overview (6 key services)
- ASE certification section
- Service area (Coastal Bend cities)
- Contact section with form
- Mobile sticky call button

### Services (`services.html`)
- **7 service categories:**
  - Engine Services (6 services)
  - Brake Services (6 services)
  - Maintenance Services (6 services)
  - Electrical Services (6 services)
  - Transmission Services (5 services)
  - Suspension & Steering (5 services)
  - Heating & Cooling (5 services)
  - Specialty Services (4 services)
- **37 total services** with descriptions and "when you need this" details

## SEO Strategy

### Target Keywords
- Auto repair Robstown TX
- ASE certified mechanic Robstown
- Diesel repair Coastal Bend
- Car repair Corpus Christi
- Brake service Portland TX

### Service Area Coverage
**Primary:** Robstown, Corpus Christi, Portland, Ingleside, Aransas Pass  
**Extended:** Port Aransas, Rockport, Fulton, Kingsville, Alice  
**Also serving:** Sinton, Odem, Bishop, Driscoll, Gregory, Taft, Mathis, Calallen, Flour Bluff

## To-Do Before Launch

### Content
- [ ] Add ARM logo to `/src/images/logo.png`
- [ ] Extract still from aerial footage for hero background
- [ ] Set up Formspree account and update form action URL
- [ ] Verify business hours are correct

### Technical
- [ ] Optimize logo (WebP format, multiple sizes)
- [ ] Add favicon
- [ ] Set up Google Analytics (optional)
- [ ] Test on real mobile devices
- [ ] Lighthouse performance audit

### Deployment
- [ ] Choose hosting (DigitalOcean App Platform or Namecheap)
- [ ] Upload files
- [ ] Configure DNS (armautotx.com → hosting)
- [ ] Verify SSL certificate
- [ ] Submit sitemap to Google
- [ ] Set up Google Business Profile

## Deployment Options

### Option 1: DigitalOcean App Platform (Recommended)
- Static site hosting
- Automatic SSL
- Easy deployment from GitHub
- $5/month

### Option 2: Namecheap Hosting
- Domain + hosting in one place
- cPanel + FTP
- Upload files directly
- ~$3-5/month

## Local Development

Simply open `src/index.html` in a browser. No build process required.

For live reload during development:
```bash
# Using Python 3
cd src
python -m http.server 8000

# Using Node.js
npx http-server src -p 8000
```

Then visit `http://localhost:8000`

## Browser Support

- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)
- Mobile Safari (iOS 12+)
- Chrome Mobile (Android 8+)

## Performance Targets

- Lighthouse Score: 90+ on all metrics
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- Mobile-friendly: 100/100

## Contact Form Setup

The contact form uses Formspree. To activate:

1. Sign up at [formspree.io](https://formspree.io)
2. Create a new form
3. Copy your form endpoint
4. Update `index.html` line 240:
   ```html
   <form action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
   ```

## Future Enhancements

- [ ] Google Business Profile integration
- [ ] Customer testimonials section
- [ ] Photo gallery of real shop/work
- [ ] Blog for SEO (auto maintenance tips)
- [ ] Online appointment booking
- [ ] Service history for returning customers

## License

© 2026 ARM Auto Repair and Mechanical. All rights reserved.

## Credits

**Design & Development:** Built with OpenClaw  
**Fonts:** Google Fonts (Bebas Neue, Inter)  
**Aerial Footage:** https://www.youtube.com/watch?v=t7uc4SevP10
