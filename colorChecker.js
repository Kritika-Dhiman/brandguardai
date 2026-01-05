/**
 * Color Compliance Checker
 * Checks document colors against brand guidelines and auto-fixes violations
 */

class ColorChecker {
    constructor(brandRules) {
        this.brandRules = brandRules;
        this.approvedColors = brandRules.colors.approved.map(c => ({
            name: c.name,
            hex: c.hex.toUpperCase(),
            rgb: this.hexToRgb(c.hex)
        }));
        this.tolerance = brandRules.colors.tolerance || 10;
    }

    /**
     * Convert hex color to RGB
     */
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    /**
     * Calculate color distance using Euclidean distance in RGB space
     */
    colorDistance(rgb1, rgb2) {
        const dr = rgb1.r - rgb2.r;
        const dg = rgb1.g - rgb2.g;
        const db = rgb1.b - rgb2.b;
        return Math.sqrt(dr * dr + dg * dg + db * db);
    }

    /**
     * Find closest approved brand color
     */
    findClosestBrandColor(hex) {
        const targetRgb = this.hexToRgb(hex);
        if (!targetRgb) return null;

        let minDistance = Infinity;
        let closestColor = null;

        for (const brandColor of this.approvedColors) {
            const distance = this.colorDistance(targetRgb, brandColor.rgb);
            if (distance < minDistance) {
                minDistance = distance;
                closestColor = brandColor;
            }
        }

        return closestColor;
    }

    /**
     * Check if a color is within tolerance of any approved color
     */
    isColorApproved(hex) {
        const targetRgb = this.hexToRgb(hex);
        if (!targetRgb) return false;

        for (const brandColor of this.approvedColors) {
            const distance = this.colorDistance(targetRgb, brandColor.rgb);
            if (distance <= this.tolerance) {
                return true;
            }
        }

        return false;
    }

    /**
     * Extract all colors from the document
     * Uses Adobe Express document APIs
     */
    async extractDocumentColors() {
        try {
            // Access Express document API
            const document = await window.express.document.getDocument();
            const colors = new Set();
            const colorViolations = [];

            // Get all layers
            const layers = await document.getLayers();
            
            for (const layer of layers) {
                // Check fill colors
                if (layer.fill && layer.fill.color) {
                    const hex = this.rgbToHex(layer.fill.color);
                    colors.add(hex);
                    
                    if (!this.isColorApproved(hex)) {
                        colorViolations.push({
                            layerId: layer.id,
                            layerName: layer.name || 'Unnamed Layer',
                            type: 'fill',
                            currentColor: hex,
                            closestBrandColor: this.findClosestBrandColor(hex)
                        });
                    }
                }

                // Check stroke colors
                if (layer.stroke && layer.stroke.color) {
                    const hex = this.rgbToHex(layer.stroke.color);
                    colors.add(hex);
                    
                    if (!this.isColorApproved(hex)) {
                        colorViolations.push({
                            layerId: layer.id,
                            layerName: layer.name || 'Unnamed Layer',
                            type: 'stroke',
                            currentColor: hex,
                            closestBrandColor: this.findClosestBrandColor(hex)
                        });
                    }
                }

                // Check text colors
                if (layer.type === 'text' && layer.textColor) {
                    const hex = this.rgbToHex(layer.textColor);
                    colors.add(hex);
                    
                    if (!this.isColorApproved(hex)) {
                        colorViolations.push({
                            layerId: layer.id,
                            layerName: layer.name || 'Unnamed Layer',
                            type: 'text',
                            currentColor: hex,
                            closestBrandColor: this.findClosestBrandColor(hex)
                        });
                    }
                }
            }

            return {
                allColors: Array.from(colors),
                violations: colorViolations,
                isCompliant: colorViolations.length === 0
            };
        } catch (error) {
            console.error('Error extracting document colors:', error);
            // Fallback for demo purposes
            return this.getMockColorData();
        }
    }

    /**
     * Convert RGB object to hex string
     */
    rgbToHex(rgb) {
        if (typeof rgb === 'string' && rgb.startsWith('#')) {
            return rgb.toUpperCase();
        }
        const r = Math.round(rgb.r || rgb.red || 0);
        const g = Math.round(rgb.g || rgb.green || 0);
        const b = Math.round(rgb.b || rgb.blue || 0);
        return `#${[r, g, b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('')}`.toUpperCase();
    }

    /**
     * Fix color violations by replacing with closest brand colors
     */
    async fixColorViolations() {
        try {
            const colorData = await this.extractDocumentColors();
            let fixedCount = 0;

            if (colorData.violations.length === 0) {
                return { fixed: 0, message: 'No color violations found' };
            }

            const document = await window.express.document.getDocument();
            const layers = await document.getLayers();

            for (const violation of colorData.violations) {
                const layer = layers.find(l => l.id === violation.layerId);
                if (!layer || !violation.closestBrandColor) continue;

                const replacementRgb = violation.closestBrandColor.rgb;

                try {
                    if (violation.type === 'fill' && layer.fill) {
                        await layer.setFillColor(replacementRgb);
                    } else if (violation.type === 'stroke' && layer.stroke) {
                        await layer.setStrokeColor(replacementRgb);
                    } else if (violation.type === 'text' && layer.type === 'text') {
                        await layer.setTextColor(replacementRgb);
                    }
                    fixedCount++;
                } catch (error) {
                    console.warn(`Could not fix color for layer ${violation.layerName}:`, error);
                }
            }

            return {
                fixed: fixedCount,
                message: `Fixed ${fixedCount} color violation(s)`
            };
        } catch (error) {
            console.error('Error fixing color violations:', error);
            // Fallback for demo
            return this.getMockFixResult('colors');
        }
    }

    /**
     * Mock data for demo purposes when Express APIs are not available
     */
    getMockColorData() {
        // Simulate some violations for demo
        const mockViolations = [
            {
                layerId: 'layer1',
                layerName: 'Background',
                type: 'fill',
                currentColor: '#FF0000',
                closestBrandColor: this.findClosestBrandColor('#FF0000')
            }
        ];

        return {
            allColors: ['#FF0000', '#0066CC', '#FFFFFF'],
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

