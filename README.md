# BrandGuard AI - Adobe Express Add-on

**Automated brand governance inside Adobe Express**

BrandGuard AI is an Adobe Express Add-on that automatically checks whether your designs follow company brand guidelines (colors, fonts, logo usage) and fixes violations in real-time.

## 🎯 Overview

BrandGuard AI helps maintain brand consistency by:
- **Detecting** brand guideline violations in your Adobe Express designs
- **Scoring** overall compliance (0-100)
- **Auto-fixing** violations with one click
- **Validating** logo placement, size, and aspect ratio

## ✨ Features

### Color Compliance
- Extracts all colors from your document
- Compares against approved brand color palette
- Automatically replaces non-brand colors with the closest approved color
- Uses color distance algorithms for intelligent matching

### Font Compliance
- Detects all text layers and their fonts
- Validates against approved font list
- Auto-replaces non-approved fonts with brand default

### Logo Validation
- Identifies logo layers by name or identifier
- Validates:
  - Minimum size requirements
  - Aspect ratio constraints
  - Allowed placement positions
  - Minimum distance from edges
- Auto-fixes placement and scaling issues

### Compliance Score
- Real-time score calculation (0-100)
- Visual progress indicator
- Breakdown by category (Colors, Fonts, Logo)
- Updates automatically after fixes

## 📁 Project Structure

```
brandguardai/
├── manifest.json          # Add-on configuration
├── index.html             # Side panel UI
├── styles.css             # Adobe Express native styling
├── brandRules.json        # Brand configuration (customizable)
├── colorChecker.js        # Color compliance logic
├── fontChecker.js         # Font compliance logic
├── logoChecker.js         # Logo validation logic
├── complianceChecker.js   # Score calculation & orchestration
├── main.js                # UI controller & Express API integration
└── README.md              # This file
```

## 🚀 Setup & Installation

### Prerequisites
- Adobe Express account
- Adobe Express Add-on development environment
- Basic knowledge of JavaScript

### Installation Steps

1. **Clone or download this repository**
   ```bash
   git clone <repository-url>
   cd brandguardai
   ```

2. **Load the add-on in Adobe Express**
   - Open Adobe Express
   - Go to Add-ons → Manage Add-ons
   - Click "Load Add-on" or "Install from File"
   - Select the `manifest.json` file from this project

3. **Open the side panel**
   - Once installed, the "BrandGuard AI" panel will appear in your add-ons list
   - Click to open the side panel

## 🎨 Brand Configuration

The add-on uses `brandRules.json` to define your brand guidelines. Customize this file to match your brand:

### Color Rules
```json
{
  "colors": {
    "approved": [
      {
        "name": "Primary Blue",
        "hex": "#0066CC",
        "usage": "primary"
      }
    ],
    "tolerance": 10
  }
}
```

- **approved**: Array of approved brand colors (hex format)
- **tolerance**: Color matching tolerance (0-255, lower = stricter)

### Font Rules
```json
{
  "fonts": {
    "approved": [
      { "name": "Roboto", "fallback": "sans-serif" }
    ],
    "default": {
      "name": "Roboto",
      "fallback": "sans-serif"
    }
  }
}
```

- **approved**: List of approved font families
- **default**: Font to use when replacing violations

### Logo Rules
```json
{
  "logo": {
    "identifier": "logo",
    "minWidth": 100,
    "minHeight": 50,
    "aspectRatio": {
      "min": 1.5,
      "max": 3.0
    },
    "allowedPositions": ["top-left", "top-right"],
    "minDistanceFromEdge": 20
  }
}
```

- **identifier**: Layer name pattern to identify logo (e.g., "logo", "brand")
- **minWidth/minHeight**: Minimum logo dimensions in pixels
- **aspectRatio**: Allowed width/height ratio range
- **allowedPositions**: Where logo can be placed
- **minDistanceFromEdge**: Minimum padding from document edges

## 🎬 Demo Instructions

### For Judges/Demo

1. **Open Adobe Express** and create a new design

2. **Add some test content:**
   - Add a shape with a non-brand color (e.g., bright red #FF0000)
   - Add text with a non-approved font (e.g., Comic Sans)
   - Add a logo layer (name it "logo") that's too small or in the wrong position

3. **Open BrandGuard AI panel:**
   - The panel shows initial compliance score
   - Review the breakdown showing violations

4. **Demonstrate auto-fix:**
   - Click "Fix Colors" to see color replacement
   - Click "Fix Fonts" to see font replacement
   - Click "Fix Logo" to see logo adjustment
   - Or click "Fix All" to apply all fixes at once

5. **Watch the score update:**
   - Score increases as violations are fixed
   - Visual indicator (ring) updates in real-time
   - Status messages confirm actions

### Key Demo Points
- ✅ **Automated detection** - No manual checking needed
- ✅ **One-click fixes** - Instant compliance
- ✅ **Measurable results** - Clear score and breakdown
- ✅ **Enterprise-ready** - Configurable brand rules

## 🔧 Technical Details

### Adobe Express APIs Used
- `window.express.document.getDocument()` - Access document
- `document.getLayers()` - Get all layers
- `layer.setFillColor()` - Update fill colors
- `layer.setFontFamily()` - Update fonts
- `layer.setBounds()` - Update position/size

### Architecture
- **Modular design**: Separate checkers for each compliance type
- **Client-side only**: No backend, all logic runs locally
- **UXP-compatible**: Uses UXP JavaScript APIs
- **Error handling**: Graceful fallbacks for demo mode

### Color Matching Algorithm
Uses Euclidean distance in RGB color space:
```
distance = √((r1-r2)² + (g1-g2)² + (b1-b2)²)
```
Finds closest approved color within tolerance threshold.

## 🎯 Use Cases

- **Marketing teams** ensuring brand consistency across campaigns
- **Design agencies** maintaining client brand guidelines
- **Enterprise** enforcing brand standards at scale
- **Content creators** quickly fixing brand violations

## 🚧 Limitations & Future Enhancements

### Current MVP Limitations
- Demo mode fallbacks when Express APIs unavailable
- Logo detection relies on layer naming convention
- Font matching is case-sensitive

### Potential Enhancements
- AI-powered logo detection (image recognition)
- Custom violation rules (e.g., spacing, alignment)
- Brand rule templates for common industries
- Export compliance reports
- Batch processing multiple documents

## 📝 Development Notes

### Code Quality
- Clean, modular JavaScript
- Comprehensive error handling
- Clear comments explaining Express-specific logic
- Production-ready structure

### Extensibility
- Easy to add new compliance checkers
- Brand rules are JSON-configurable
- UI follows Adobe Express design patterns

## 🤝 Contributing

This is a hackathon MVP. For production use, consider:
- Adding unit tests
- Implementing proper Express API error handling
- Adding user preferences/settings
- Creating brand rule templates

## 📄 License

This project is created for demonstration purposes.

## 🙏 Acknowledgments

Built for Adobe Express Add-on development using:
- Adobe Express Add-on SDK
- UXP APIs
- Express document editing APIs

---

**BrandGuard AI** - Automated brand governance inside Adobe Express
