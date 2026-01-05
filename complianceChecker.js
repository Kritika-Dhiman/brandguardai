/**
 * Compliance Score Calculator
 * Orchestrates all compliance checks and calculates overall score
 */

class ComplianceChecker {
    constructor(brandRules) {
        this.brandRules = brandRules;
        this.colorChecker = new ColorChecker(brandRules);
        this.fontChecker = new FontChecker(brandRules);
        this.logoChecker = new LogoChecker(brandRules);
    }

    /**
     * Run all compliance checks
     */
    async checkAll() {
        const [colorData, fontData, logoData] = await Promise.all([
            this.colorChecker.extractDocumentColors(),
            this.fontChecker.extractDocumentFonts(),
            this.logoChecker.validateLogo()
        ]);

        return {
            colors: {
                isCompliant: colorData.isCompliant,
                violations: colorData.violations,
                violationCount: colorData.violations.length,
                details: colorData.isCompliant 
                    ? 'All colors match brand guidelines'
                    : `${colorData.violations.length} color violation(s) found`
            },
            fonts: {
                isCompliant: fontData.isCompliant,
                violations: fontData.violations,
                violationCount: fontData.violations.length,
                details: fontData.isCompliant
                    ? 'All fonts are brand-approved'
                    : `${fontData.violations.length} font violation(s) found`
            },
            logo: {
                isCompliant: logoData.isCompliant,
                violations: logoData.violations || [],
                violationCount: logoData.found ? (logoData.violations?.length || 0) : 1,
                details: !logoData.found
                    ? 'Logo not found in document'
                    : logoData.isCompliant
                        ? 'Logo placement and size are correct'
                        : `${logoData.violations?.length || 0} logo violation(s) found`
            }
        };
    }

    /**
     * Calculate compliance score (0-100)
     */
    calculateScore(complianceData) {
        let score = 100;
        const deductionPerViolation = 10; // Deduct 10 points per violation category

        // Deduct points for each category with violations
        if (!complianceData.colors.isCompliant) {
            score -= Math.min(deductionPerViolation * Math.ceil(complianceData.colors.violationCount / 2), 30);
        }

        if (!complianceData.fonts.isCompliant) {
            score -= Math.min(deductionPerViolation * Math.ceil(complianceData.fonts.violationCount / 2), 30);
        }

        if (!complianceData.logo.isCompliant) {
            score -= Math.min(deductionPerViolation * Math.ceil(complianceData.logo.violationCount / 2), 30);
        }

        // Ensure score doesn't go below 0
        return Math.max(0, Math.round(score));
    }

    /**
     * Get score description
     */
    getScoreDescription(score) {
        if (score >= 90) return 'Excellent';
        if (score >= 70) return 'Good';
        if (score >= 50) return 'Needs Improvement';
        if (score >= 30) return 'Poor';
        return 'Critical';
    }

    /**
     * Fix all violations
     */
    async fixAll() {
        const results = {
            colors: null,
            fonts: null,
            logo: null,
            totalFixed: 0
        };

        try {
            // Fix colors
            results.colors = await this.colorChecker.fixColorViolations();
            results.totalFixed += results.colors.fixed || 0;

            // Fix fonts
            results.fonts = await this.fontChecker.fixFontViolations();
            results.totalFixed += results.fonts.fixed || 0;

            // Fix logo
            results.logo = await this.logoChecker.fixLogoViolations();
            results.totalFixed += results.logo.fixed || 0;

            return results;
        } catch (error) {
            console.error('Error fixing all violations:', error);
            return results;
        }
    }
}

