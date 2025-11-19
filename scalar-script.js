// Global variables
let companiesData = [];
let filteredCompanies = [];

// Load companies data
async function loadCompaniesData() {
    try {
        const response = await fetch('data/scalar-companies.json');
        const data = await response.json();
        companiesData = data.companies;
        filteredCompanies = [...companiesData];
        return companiesData;
    } catch (error) {
        console.error('Error loading companies data:', error);
        return [];
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    await loadCompaniesData();
    initializeNavigation();
    initializePage();
});

// Navigation
function initializeNavigation() {
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    const searchBtn = document.getElementById('searchBtn');

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.nav-container')) {
                navMenu.classList.remove('active');
                if (menuToggle) {
                    menuToggle.classList.remove('active');
                }
            }
        });
    }

    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            const searchTerm = prompt('Search companies:');
            if (searchTerm) {
                window.location.href = `companies.html?search=${encodeURIComponent(searchTerm)}`;
            }
        });
    }
}

// Page-specific initialization
function initializePage() {
    const currentPage = window.location.pathname.split('/').pop() || 'scalar-index.html';

    if (currentPage === 'scalar-index.html' || currentPage === '') {
        initializeHomepage();
    } else if (currentPage === 'companies.html') {
        initializeCompaniesPage();
    } else if (currentPage === 'compare.html') {
        initializeComparePage();
    }
}

// Homepage initialization
function initializeHomepage() {
    animateStats();
    displayFeaturedCompanies();
}

// Animate stats counter
function animateStats() {
    const statNumbers = document.querySelectorAll('.stat-number');
    
    statNumbers.forEach(stat => {
        const target = parseInt(stat.getAttribute('data-target'));
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;

        const updateCounter = () => {
            current += increment;
            if (current < target) {
                stat.textContent = Math.floor(current);
                requestAnimationFrame(updateCounter);
            } else {
                stat.textContent = target;
            }
        };

        updateCounter();
    });
}

// Display featured companies
function displayFeaturedCompanies() {
    const carousel = document.getElementById('featuredCarousel');
    if (!carousel) return;

    // Get top 6 companies (or all if less than 6)
    const featured = companiesData.slice(0, 6);

    carousel.innerHTML = featured.map(company => `
        <div class="company-card">
            <h3>${company.name}</h3>
            <p class="company-meta">${company.industry} • ${company.location || 'N/A'}</p>
            <p class="company-description">${getCompanyDescription(company)}</p>
            <div class="company-tags">
                <span class="company-tag">${company.technologyFocus}</span>
                <span class="company-tag">${company.growthStage}</span>
            </div>
            <a href="company-${company.slug}.html" class="btn-hero" style="margin-top: 20px; display: inline-block; padding: 12px 24px; font-size: 14px;">Learn More</a>
        </div>
    `).join('');
}

// Get company description
function getCompanyDescription(company) {
    if (company.vision) return company.vision;
    if (company.mission) return company.mission;
    if (company.focus) return company.focus;
    if (company.description) return company.description;
    return `${company.name} - ${company.industry}`;
}

// Companies page initialization
function initializeCompaniesPage() {
    const searchInput = document.getElementById('searchInput');
    const filterTags = document.querySelectorAll('.filter-tag');
    const companiesGrid = document.getElementById('companiesGrid');
    const noResults = document.getElementById('noResults');

    // Check URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');
    const filterParam = urlParams.get('filter');

    if (searchParam) {
        searchInput.value = searchParam;
        filterCompanies(searchParam, null);
    }

    if (filterParam) {
        const filterTag = Array.from(filterTags).find(tag => tag.dataset.filter === filterParam);
        if (filterTag) {
            filterTag.click();
        }
    }

    // Search input handler
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const activeFilter = document.querySelector('.filter-tag.active')?.dataset.filter;
            filterCompanies(searchTerm, activeFilter === 'all' ? null : activeFilter);
        });
    }

    // Filter tags handler
    filterTags.forEach(tag => {
        tag.addEventListener('click', () => {
            filterTags.forEach(t => t.classList.remove('active'));
            tag.classList.add('active');
            
            const filter = tag.dataset.filter === 'all' ? null : tag.dataset.filter;
            const searchTerm = searchInput?.value.toLowerCase() || '';
            filterCompanies(searchTerm, filter);
        });
    });

    // Initial display
    displayCompanies(companiesData);
}

// Filter companies
function filterCompanies(searchTerm, category) {
    filteredCompanies = companiesData.filter(company => {
        const matchesSearch = !searchTerm || 
            company.name.toLowerCase().includes(searchTerm) ||
            company.industry.toLowerCase().includes(searchTerm) ||
            company.technologyFocus.toLowerCase().includes(searchTerm) ||
            (company.location && company.location.toLowerCase().includes(searchTerm));

        const matchesCategory = !category || company.category === category;

        return matchesSearch && matchesCategory;
    });

    displayCompanies(filteredCompanies);
}

// Display companies
function displayCompanies(companies) {
    const companiesGrid = document.getElementById('companiesGrid');
    const noResults = document.getElementById('noResults');

    if (!companiesGrid) return;

    if (companies.length === 0) {
        companiesGrid.innerHTML = '';
        if (noResults) noResults.style.display = 'block';
        return;
    }

    if (noResults) noResults.style.display = 'none';

    companiesGrid.innerHTML = companies.map(company => `
        <a href="company-${company.slug}.html" class="company-card">
            <h3>${company.name}</h3>
            <p class="company-meta">${company.industry} • ${company.location || 'N/A'}</p>
            <p class="company-description">${getCompanyDescription(company)}</p>
            <div class="company-tags">
                <span class="company-tag">${company.technologyFocus}</span>
                <span class="company-tag">${company.growthStage}</span>
            </div>
        </a>
    `).join('');
}

// Compare page initialization
function initializeComparePage() {
    const companyCheckboxes = document.getElementById('companyCheckboxes');
    const compareBtn = document.getElementById('compareBtn');
    const comparisonTable = document.getElementById('comparisonTable');
    const comparisonBody = document.getElementById('comparisonBody');
    const compareEmpty = document.getElementById('compareEmpty');

    if (!companyCheckboxes) return;

    // Create checkboxes
    companyCheckboxes.innerHTML = companiesData.map(company => `
        <label class="company-checkbox">
            <input type="checkbox" value="${company.id}" data-company='${JSON.stringify(company)}'>
            <span>${company.name}</span>
        </label>
    `).join('');

    // Compare button handler
    if (compareBtn) {
        compareBtn.addEventListener('click', () => {
            const selected = Array.from(document.querySelectorAll('.company-checkbox input:checked'))
                .map(cb => JSON.parse(cb.dataset.company));

            if (selected.length === 0) {
                if (comparisonTable) comparisonTable.style.display = 'none';
                if (compareEmpty) compareEmpty.style.display = 'block';
                return;
            }

            displayComparison(selected);
        });
    }
}

// Display comparison table
function displayComparison(companies) {
    const comparisonTable = document.getElementById('comparisonTable');
    const comparisonBody = document.getElementById('comparisonBody');
    const compareEmpty = document.getElementById('compareEmpty');

    if (!comparisonTable || !comparisonBody) return;

    // Hide empty message
    if (compareEmpty) compareEmpty.style.display = 'none';
    comparisonTable.style.display = 'table';

    // Build table header
    const headerRow = comparisonTable.querySelector('thead tr');
    headerRow.innerHTML = '<th>Feature</th>' + 
        companies.map(c => `<th>${c.name}</th>`).join('');

    // Build comparison rows
    const features = [
        { label: 'Industry', key: 'industry' },
        { label: 'Location', key: 'location' },
        { label: 'Technology Focus', key: 'technologyFocus' },
        { label: 'Growth Stage', key: 'growthStage' },
        { label: 'Website', key: 'website', type: 'link' }
    ];

    comparisonBody.innerHTML = features.map(feature => {
        const cells = companies.map(company => {
            let value = company[feature.key] || 'N/A';
            if (feature.type === 'link' && value !== 'N/A') {
                value = `<a href="${value}" target="_blank" rel="noopener noreferrer" style="color: var(--secondary-color);">${value}</a>`;
            }
            return `<td>${value}</td>`;
        }).join('');

        return `<tr><td><strong>${feature.label}</strong></td>${cells}</tr>`;
    }).join('');

    // Add products/services row if available
    const hasProducts = companies.some(c => c.products || c.services);
    if (hasProducts) {
        const productsRow = companies.map(company => {
            const items = company.products || company.services || company.capabilities || [];
            const value = items.length > 0 ? items.slice(0, 3).join(', ') : 'N/A';
            return `<td>${value}</td>`;
        }).join('');
        comparisonBody.innerHTML += `<tr><td><strong>Products/Services</strong></td>${productsRow}</tr>`;
    }
}

// Smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#' && href.length > 1) {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                const offsetTop = target.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        }
    });
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.querySelectorAll('.company-card, .opportunity-card, .resource-card, .category-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

