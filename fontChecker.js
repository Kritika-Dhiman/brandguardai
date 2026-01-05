/**
 * Font Compliance Checker
 * Checks document fonts against brand guidelines and auto-fixes violations
 */

class FontChecker {
    constructor(brandRules) {
        this.brandRules = brandRules;
        this.approvedFonts = brandRules.fonts.approved.map(f => 
            f.name.toLowerCase().trim()
        );
        this.defaultFont = brandRules.fonts.default;
    }

    /**
     * Normalize font name for comparison
     */
    normalizeFontName(fontName) {
        if (!fontName) return '';
        return fontName.toLowerCase().trim().replace(/\s+/g, ' ');
    }

    /**
     * Check if a font is approved
     */
    isFontApproved(fontName) {
        const normalized = this.normalizeFontName(fontName);
        
        // Check exact match
        if (this.approvedFonts.includes(normalized)) {
            return true;
        }

        // Check if font name contains any approved font name
        for (const approvedFont of this.approvedFonts) {
            if (normalized.includes(approvedFont) || approvedFont.includes(normalized)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Extract all fonts from the document
     */
    async extractDocumentFonts() {
        try {
            const document = await window.express.document.getDocument();
            const fonts = new Set();
            const fontViolations = [];

            // Get all layers
            const layers = await document.getLayers();
            
            for (const layer of layers) {
                if (layer.type === 'text' && layer.fontFamily) {
                    const fontName = layer.fontFamily;
                    fonts.add(fontName);
                    
                    if (!this.isFontApproved(fontName)) {
                        fontViolations.push({
                            layerId: layer.id,
                            layerName: layer.name || 'Unnamed Text',
                            currentFont: fontName,
                            replacementFont: this.defaultFont.name
                        });
                    }
                }
            }

            return {
                allFonts: Array.from(fonts),
                violations: fontViolations,
                isCompliant: fontViolations.length === 0
            };
        } catch (error) {
            console.error('Error extracting document fonts:', error);
            // Fallback for demo purposes
            return this.getMockFontData();
        }
    }

    /**
     * Fix font violations by replacing with default brand font
     */
    async fixFontViolations() {
        try {
            const fontData = await this.extractDocumentFonts();
            let fixedCount = 0;

            if (fontData.violations.length === 0) {
                return { fixed: 0, message: 'No font violations found' };
            }

            const document = await window.express.document.getDocument();
            const layers = await document.getLayers();

            for (const violation of fontData.violations) {
                const layer = layers.find(l => l.id === violation.layerId);
                if (!layer || layer.type !== 'text') continue;

                try {
                    await layer.setFontFamily(this.defaultFont.name);
                    fixedCount++;
                } catch (error) {
                    console.warn(`Could not fix font for layer ${violation.layerName}:`, error);
                }
            }

            return {
                fixed: fixedCount,
                message: `Fixed ${fixedCount} font violation(s)`
            };
        } catch (error) {
            console.error('Error fixing font violations:', error);
            // Fallback for demo
            return this.getMockFixResult('fonts');
        }
    }

    /**
     * Mock data for demo purposes
     */
    getMockFontData() {
        const mockViolations = [
            {
                layerId: 'text1',
                layerName: 'Heading',
                currentFont: 'Comic Sans MS',
                replacementFont: this.defaultFont.name
            }
        ];

        return {
            allFonts: ['Comic Sans MS', 'Roboto'],
            violations: mockViolations,
            isCompliant: false
        };
    }

    getMockFixResult(type) {
        return {
            fixed: 1,
            message: `Fixed 1 ${type} violation (demo mode)`
        };
    }
}

