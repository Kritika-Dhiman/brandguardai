/**
 * Logo Compliance Checker
 * Validates logo placement, size, and aspect ratio against brand guidelines
 */

class LogoChecker {
    constructor(brandRules) {
        this.brandRules = brandRules;
        this.logoRules = brandRules.logo;
        this.identifier = this.logoRules.identifier || 'logo';
    }

    /**
     * Check if a layer is a logo based on name or identifier
     */
    isLogoLayer(layer) {
        if (!layer || !layer.name) return false;
        
        const layerName = layer.name.toLowerCase();
        const identifier = this.identifier.toLowerCase();
        
        return layerName.includes(identifier) || 
               layerName === 'logo' || 
               layerName === 'brand';
    }

    /**
     * Calculate aspect ratio
     */
    getAspectRatio(width, height) {
        if (!height || height === 0) return 0;
        return width / height;
    }

    /**
     * Check if position is within allowed positions
     */
    isPositionAllowed(bounds, documentWidth, documentHeight) {
        const rules = this.logoRules;
        const minDistance = rules.minDistanceFromEdge || 20;
        
        const centerX = bounds.x + bounds.width / 2;
        const centerY = bounds.y + bounds.height / 2;
        
        const isTop = centerY < documentHeight / 3;
        const isBottom = centerY > (documentHeight * 2) / 3;
        const isLeft = centerX < documentWidth / 3;
        const isRight = centerX > (documentWidth * 2) / 3;

        const position = 
            (isTop && isLeft) ? 'top-left' :
            (isTop && isRight) ? 'top-right' :
            (isBottom && isLeft) ? 'bottom-left' :
            (isBottom && isRight) ? 'bottom-right' : 'center';

        const allowed = rules.allowedPositions || [];
        
        // Check if position is allowed
        if (!allowed.includes(position)) {
            return { allowed: false, position, reason: 'Position not in allowed list' };
        }

        // Check minimum distance from edges
        const distanceFromLeft = bounds.x;
        const distanceFromRight = documentWidth - (bounds.x + bounds.width);
        const distanceFromTop = bounds.y;
        const distanceFromBottom = documentHeight - (bounds.y + bounds.height);

        if (distanceFromLeft < minDistance || 
            distanceFromRight < minDistance ||
            distanceFromTop < minDistance ||
            distanceFromBottom < minDistance) {
            return { allowed: false, position, reason: 'Too close to edge' };
        }

        return { allowed: true, position };
    }

    /**
     * Find and validate logo in document
     */
    async validateLogo() {
        try {
            const document = await window.express.document.getDocument();
            const layers = await document.getLayers();
            
            // Find logo layer
            const logoLayer = layers.find(layer => this.isLogoLayer(layer));
            
            if (!logoLayer) {
                return {
                    found: false,
                    isCompliant: false,
                    violations: ['Logo not found in document'],
                    message: 'No logo layer detected. Name a layer "logo" to enable validation.'
                };
            }

            const violations = [];
            const rules = this.logoRules;

            // Check size
            const bounds = logoLayer.bounds || {};
            const width = bounds.width || 0;
            const height = bounds.height || 0;

            if (width < rules.minWidth) {
                violations.push(`Logo width (${Math.round(width)}px) is below minimum (${rules.minWidth}px)`);
            }

            if (height < rules.minHeight) {
                violations.push(`Logo height (${Math.round(height)}px) is below minimum (${rules.minHeight}px)`);
            }

            // Check aspect ratio
            const aspectRatio = this.getAspectRatio(width, height);
            if (aspectRatio < rules.aspectRatio.min || aspectRatio > rules.aspectRatio.max) {
                violations.push(
                    `Logo aspect ratio (${aspectRatio.toFixed(2)}) is outside allowed range ` +
                    `(${rules.aspectRatio.min} - ${rules.aspectRatio.max})`
                );
            }

            // Check position
            const docBounds = document.bounds || { width: 1920, height: 1080 };
            const positionCheck = this.isPositionAllowed(
                bounds,
                docBounds.width || 1920,
                docBounds.height || 1080
            );

            if (!positionCheck.allowed) {
                violations.push(`Logo position (${positionCheck.position}) is not allowed: ${positionCheck.reason}`);
            }

            return {
                found: true,
                isCompliant: violations.length === 0,
                violations,
                logoLayer,
                bounds,
                aspectRatio,
                position: positionCheck.position
            };
        } catch (error) {
            console.error('Error validating logo:', error);
            // Fallback for demo
            return this.getMockLogoData();
        }
    }

    /**
     * Fix logo violations
     */
    async fixLogoViolations() {
        try {
            const validation = await this.validateLogo();
            let fixedCount = 0;
            const fixes = [];

            if (!validation.found) {
                return { fixed: 0, message: validation.message };
            }

            if (validation.isCompliant) {
                return { fixed: 0, message: 'Logo is already compliant' };
            }

            const logoLayer = validation.logoLayer;
            const rules = this.logoRules;
            const bounds = validation.bounds;

            // Fix size if needed
            let newWidth = bounds.width;
            let newHeight = bounds.height;

            if (bounds.width < rules.minWidth) {
                newWidth = rules.minWidth;
                fixes.push('width');
            }

            if (bounds.height < rules.minHeight) {
                newHeight = rules.minHeight;
                fixes.push('height');
            }

            // Fix aspect ratio if needed
            let aspectRatio = this.getAspectRatio(newWidth, newHeight);
            if (aspectRatio < rules.aspectRatio.min) {
                newHeight = newWidth / rules.aspectRatio.min;
                fixes.push('aspect ratio');
            } else if (aspectRatio > rules.aspectRatio.max) {
                newWidth = newHeight * rules.aspectRatio.max;
                fixes.push('aspect ratio');
            }

            // Apply size fixes
            if (fixes.length > 0) {
                try {
                    await logoLayer.setBounds({
                        width: newWidth,
                        height: newHeight,
                        x: bounds.x,
                        y: bounds.y
                    });
                    fixedCount++;
                } catch (error) {
                    console.warn('Could not fix logo size:', error);
                }
            }

            // Fix position if needed
            const docBounds = logoLayer.document?.bounds || { width: 1920, height: 1080 };
            const positionCheck = this.isPositionAllowed(
                { ...bounds, width: newWidth, height: newHeight },
                docBounds.width,
                docBounds.height
            );

            if (!positionCheck.allowed) {
                // Move to top-left as default allowed position
                const minDistance = rules.minDistanceFromEdge || 20;
                try {
                    await logoLayer.setBounds({
                        x: minDistance,
                        y: minDistance,
                        width: newWidth,
                        height: newHeight
                    });
                    fixedCount++;
                    fixes.push('position');
                } catch (error) {
                    console.warn('Could not fix logo position:', error);
                }
            }

            return {
                fixed: fixedCount,
                message: fixedCount > 0 
                    ? `Fixed logo: ${fixes.join(', ')}`
                    : 'Could not fix logo violations'
            };
        } catch (error) {
            console.error('Error fixing logo violations:', error);
            return this.getMockFixResult('logo');
        }
    }

    /**
     * Mock data for demo purposes
     */
    getMockLogoData() {
        return {
            found: true,
            isCompliant: false,
            violations: ['Logo size is below minimum', 'Logo position is not in allowed area'],
            bounds: { width: 50, height: 30, x: 10, y: 10 },
            aspectRatio: 1.67,
            position: 'center'
        };
    }

    getMockFixResult(type) {
        return {
            fixed: 1,
            message: `Fixed 1 ${type} violation (demo mode)`
        };
    }
}

