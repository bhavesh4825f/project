# OGSP Logo and Brand Guidelines

## Logo Files Created

### 1. Full Logo (`ogsp-logo.svg`)
- **Dimensions**: 200x80px
- **Usage**: Headers, official documents, large displays
- **Contains**: Complete government building, service icons, full text, quality indicators
- **Colors**: 
  - Primary Blue: #1e40af
  - Success Green: #059669
  - Warning Yellow: #fbbf24
  - Purple: #8b5cf6
  - Red: #ef4444
  - Cyan: #06b6d4
  - Indigo: #6366f1

### 2. Icon Logo (`ogsp-icon.svg`)
- **Dimensions**: 60x60px
- **Usage**: Navbar, favicons, small displays, mobile
- **Contains**: Simplified government building with minimal service indicators
- **Colors**: Same as full logo but simplified

## Logo Symbolism

### Central Government Building
- **Pillars**: Represent the strong foundation of government services
- **Roof**: Triangle symbolizes stability and trust
- **Door**: Open access to government services for all citizens

### Service Icons
1. **Document (Yellow)**: PAN Card and certificate services
2. **Person (Green)**: Birth certificate and identity services  
3. **Award (Purple)**: Caste and category certificates
4. **Currency (Red)**: Income certificate and financial documents
5. **Headset (Cyan)**: Customer support and contact services
6. **Shield (Blue)**: Admin and management security

### Quality Indicators
- **Green Circle**: Secure and government-grade security
- **Yellow Circle**: Fast processing and quick service
- **Blue Circle**: 24/7 reliable availability
- **Cyan Circle**: User-friendly interface

## Color Palette

### Primary Colors
- **Government Blue**: #1e40af (Trust, Authority, Reliability)
- **Success Green**: #059669 (Growth, Security, Approval)
- **Warning Yellow**: #fbbf24 (Speed, Attention, Processing)

### Secondary Colors
- **Purple**: #8b5cf6 (Premium services, Certificates)
- **Red**: #ef4444 (Important documents, Financial)
- **Cyan**: #06b6d4 (Support, Communication)
- **Indigo**: #6366f1 (Management, Administration)

### Neutral Colors
- **Dark Gray**: #374151 (Text, Professional)
- **Light Gray**: #6b7280 (Subtitles, Secondary text)
- **White**: #ffffff (Background, Clean space)

## Usage Guidelines

### DO:
- ✅ Use SVG format for scalable displays
- ✅ Maintain original proportions
- ✅ Use on white or light backgrounds
- ✅ Keep minimum clear space around logo
- ✅ Use official color codes

### DON'T:
- ❌ Stretch or distort the logo
- ❌ Change colors arbitrarily
- ❌ Use on busy backgrounds
- ❌ Remove elements from the logo
- ❌ Use pixelated or low-quality versions

## Technical Implementation

### HTML Usage
```html
<!-- Navbar -->
<img src="ogsp-icon.svg" alt="OGSP Logo" width="50" height="50" />

<!-- Footer -->
<img src="ogsp-logo.svg" alt="OGSP Complete Logo" width="200" height="80" />
```

### CSS Classes
```css
.logotext {
  background: linear-gradient(45deg, #1e40af, #059669);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

## File Structure
```
public/
├── logo.png (old - can be removed)
├── ogsp-icon.svg (new - navbar use)
└── ogsp-logo.svg (new - full display)
```

## Accessibility
- All logos include proper alt text
- High contrast ratios maintained
- SVG format ensures scalability
- Color combinations are colorblind-friendly

## Brand Message
"OGSP - Your trusted digital gateway to all government services. Fast, secure, and available 24/7 for every citizen's needs."