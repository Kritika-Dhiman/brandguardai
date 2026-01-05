/**
 * Main Application Controller
 * Handles UI updates and Express API integration
 */

// Global state
let brandRules = null;
let complianceChecker = null;
let currentComplianceData = null;

/**
 * Initialize the application
 */
async function init() {
    try {
        // Load brand rules
        const response = await fetch('./brandRules.json');
        brandRules = await response.json();
        
        // Initialize compliance checker
        complianceChecker = new ComplianceChecker(brandRules);
        
        // Set up event listeners
        setupEventListeners();
        
        // Run initial compliance check
        await runComplianceCheck();
        
        console.log('BrandGuard AI initialized');
    } catch (error) {
        console.error('Error initializing BrandGuard AI:', error);
        showStatus('Error loading brand rules. Using default configuration.', 'error');
        
        // Use default rules if file fails to load
        brandRules = getDefaultBrandRules();
        complianceChecker = new ComplianceChecker(brandRules);
        setupEventListeners();
        await runComplianceCheck();
    }
}

/**
 * Set up UI event listeners
 */
function setupEventListeners() {
    document.getElementById('fixColorsBtn').addEventListener('click', handleFixColors);
    document.getElementById('fixFontsBtn').addEventListener('click', handleFixFonts);
    document.getElementById('fixLogoBtn').addEventListener('click', handleFixLogo);
    document.getElementById('fixAllBtn').addEventListener('click', handleFixAll);
}

/**
 * Run compliance check and update UI
 */
async function runComplianceCheck() {
    try {
        showStatus('Checking compliance...', 'info');
        
        currentComplianceData = await complianceChecker.checkAll();
        const score = complianceChecker.calculateScore(currentComplianceData);
        
        updateScoreDisplay(score);
        updateComplianceBreakdown(currentComplianceData);
        
        showStatus('Compliance check complete', 'success');
        setTimeout(() => hideStatus(), 2000);
    } catch (error) {
        console.error('Error running compliance check:', error);
        showStatus('Error checking compliance', 'error');
    }
}

/**
 * Update score display
 */
function updateScoreDisplay(score) {
    const scoreNumber = document.getElementById('scoreNumber');
    const scoreRing = document.getElementById('scoreRing');
    const scoreDescription = document.getElementById('scoreDescription');
    
    scoreNumber.textContent = score;
    
    // Update ring progress (339.292 is circumference for r=54)
    const circumference = 339.292;
    const offset = circumference - (score / 100) * circumference;
    scoreRing.style.strokeDashoffset = offset;
    
    // Update ring color based on score
    scoreRing.classList.remove('warning', 'error');
    if (score < 50) {
        scoreRing.classList.add('error');
    } else if (score < 70) {
        scoreRing.classList.add('warning');
    }
    
    // Update description
    const description = complianceChecker.getScoreDescription(score);
    scoreDescription.textContent = description;
}

/**
 * Update compliance breakdown display
 */
function updateComplianceBreakdown(data) {
    // Update colors
    updateComplianceItem('color', data.colors);
    
    // Update fonts
    updateComplianceItem('font', data.fonts);
    
    // Update logo
    updateComplianceItem('logo', data.logo);
}

/**
 * Update individual compliance item display
 */
function updateComplianceItem(type, data) {
    const item = document.getElementById(`${type}Compliance`);
    const icon = document.getElementById(`${type}Icon`);
    const status = document.getElementById(`${type}Status`);
    const details = document.getElementById(`${type}Details`);
    
    if (data.isCompliant) {
        item.classList.remove('violation');
        icon.textContent = '✓';
        icon.classList.remove('warning');
        status.textContent = 'Compliant';
        details.textContent = data.details;
    } else {
        item.classList.add('violation');
        icon.textContent = '⚠';
        icon.classList.add('warning');
        status.textContent = 'Violation';
        details.textContent = data.details;
    }
}

/**
 * Handle Fix Colors button click
 */
async function handleFixColors() {
    const btn = document.getElementById('fixColorsBtn');
    setButtonLoading(btn, true);
    
    try {
        const result = await complianceChecker.colorChecker.fixColorViolations();
        showStatus(result.message || `Fixed ${result.fixed} color violation(s)`, 'success');
        
        // Recheck compliance
        await runComplianceCheck();
    } catch (error) {
        console.error('Error fixing colors:', error);
        showStatus('Error fixing colors', 'error');
    } finally {
        setButtonLoading(btn, false);
    }
}

/**
 * Handle Fix Fonts button click
 */
async function handleFixFonts() {
    const btn = document.getElementById('fixFontsBtn');
    setButtonLoading(btn, true);
    
    try {
        const result = await complianceChecker.fontChecker.fixFontViolations();
        showStatus(result.message || `Fixed ${result.fixed} font violation(s)`, 'success');
        
        // Recheck compliance
        await runComplianceCheck();
    } catch (error) {
        console.error('Error fixing fonts:', error);
        showStatus('Error fixing fonts', 'error');
    } finally {
        setButtonLoading(btn, false);
    }
}

/**
 * Handle Fix Logo button click
 */
async function handleFixLogo() {
    const btn = document.getElementById('fixLogoBtn');
    setButtonLoading(btn, true);
    
    try {
        const result = await complianceChecker.logoChecker.fixLogoViolations();
        showStatus(result.message || `Fixed ${result.fixed} logo violation(s)`, 'success');
        
        // Recheck compliance
        await runComplianceCheck();
    } catch (error) {
        console.error('Error fixing logo:', error);
        showStatus('Error fixing logo', 'error');
    } finally {
        setButtonLoading(btn, false);
    }
}

/**
 * Handle Fix All button click
 */
async function handleFixAll() {
    const btn = document.getElementById('fixAllBtn');
    setButtonLoading(btn, true);
    
    try {
        const results = await complianceChecker.fixAll();
        const totalFixed = results.totalFixed || 0;
        
        if (totalFixed > 0) {
            showStatus(`Fixed ${totalFixed} violation(s) across all categories`, 'success');
        } else {
            showStatus('No violations found to fix', 'info');
        }
        
        // Recheck compliance
        await runComplianceCheck();
    } catch (error) {
        console.error('Error fixing all violations:', error);
        showStatus('Error fixing violations', 'error');
    } finally {
        setButtonLoading(btn, false);
    }
}

/**
 * Set button loading state
 */
function setButtonLoading(button, loading) {
    if (loading) {
        button.classList.add('loading');
        button.disabled = true;
    } else {
        button.classList.remove('loading');
        button.disabled = false;
    }
}

/**
 * Show status message
 */
function showStatus(message, type = 'info') {
    const statusEl = document.getElementById('statusMessage');
    statusEl.textContent = message;
    statusEl.className = `status-message show ${type}`;
}

/**
 * Hide status message
 */
function hideStatus() {
    const statusEl = document.getElementById('statusMessage');
    statusEl.classList.remove('show');
}

/**
 * Default brand rules fallback
 */
function getDefaultBrandRules() {
    return {
        brandName: "Enterprise Brand",
        colors: {
            approved: [
                { name: "Primary Blue", hex: "#0066CC", usage: "primary" },
                { name: "Secondary Blue", hex: "#003D7A", usage: "secondary" },
                { name: "Accent Orange", hex: "#FF6600", usage: "accent" },
                { name: "Neutral Gray", hex: "#666666", usage: "text" },
                { name: "White", hex: "#FFFFFF", usage: "background" },
                { name: "Black", hex: "#000000", usage: "text" }
            ],
            tolerance: 10
        },
        fonts: {
            approved: [
                { name: "Roboto", fallback: "sans-serif" },
                { name: "Open Sans", fallback: "sans-serif" }
            ],
            default: { name: "Roboto", fallback: "sans-serif" }
        },
        logo: {
            identifier: "logo",
            minWidth: 100,
            minHeight: 50,
            aspectRatio: { min: 1.5, max: 3.0 },
            allowedPositions: ["top-left", "top-right", "bottom-left", "bottom-right"],
            minDistanceFromEdge: 20
        }
    };
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

