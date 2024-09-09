function createContentElement(item, isTruncated = false, contentType) {
    const contentElement = document.createElement('article');
    contentElement.className = `${contentType}-item`;

    const titleElement = document.createElement('h2');
    titleElement.textContent = item.title;
    contentElement.appendChild(titleElement);

    const dateElement = document.createElement('p');
    dateElement.className = 'item-date';
    const date = new Date(item.date);
    dateElement.textContent = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    contentElement.appendChild(dateElement);

    const textElement = document.createElement('p');
    if (isTruncated) {
        textElement.textContent = item.content.slice(0, 150) + '...';
        
        const readMoreLink = document.createElement('a');
        readMoreLink.href = `/../${contentType}.html`;
        readMoreLink.textContent = 'Read More';
        readMoreLink.className = 'read-more';
        
        textElement.appendChild(document.createElement('br'));
        textElement.appendChild(readMoreLink);
    } else {
        textElement.textContent = item.content;
    }
    contentElement.appendChild(textElement);

    return contentElement;
}

function loadContent(contentType, isTruncated = false) {
    fetch(`/../content/${contentType}.json`)
        .then(response => response.json())
        .then(data => {
            // Sort items by date, most recent first
            data.sort((a, b) => new Date(b.date) - new Date(a.date));
            
            const containerSelector = isTruncated ? `latest-${contentType}` : `${contentType}-container`;
            const contentContainer = document.getElementById(containerSelector);
            
            if (contentContainer) {
                if (isTruncated) {
                    // For homepage, only show the latest item
                    const latestItem = data[0];
                    const itemElement = createContentElement(latestItem, true, contentType);
                    contentContainer.appendChild(itemElement);
                } else if (contentType === 'news') {
                    // For full news page, show all items
                    data.forEach(item => {
                        const itemElement = createContentElement(item, false, contentType);
                        contentContainer.appendChild(itemElement);
                    });
                } else if (contentType === 'recaps') {
                    // For recaps page, show only the latest recap
                    const latestRecap = data[0];
                    const recapElement = createContentElement(latestRecap, false, contentType);
                    contentContainer.appendChild(recapElement);
                    loadRecapNavigation(data);
                }
            }
        })
        .catch(error => console.error(`Error loading ${contentType}:`, error));
}

function loadRecapNavigation(data) {
    const navMenu = document.getElementById('recap-nav');
    if (navMenu) {
        navMenu.innerHTML = ''; // Clear existing content
        data.forEach((recap, index) => {
            const navItem = document.createElement('a');
            navItem.href = `recap.html?id=${recap.id}`;
            navItem.textContent = `${recap.title}`;
            navMenu.appendChild(navItem);
        });
    }
}

function loadSingleRecap(recapId) {
    fetch('/../content/recaps.json')
        .then(response => response.json())
        .then(data => {
            const recap = data.find(item => item.id === parseInt(recapId));
            if (recap) {
                const container = document.getElementById('recap-container');
                const recapElement = createContentElement(recap, false, 'recaps');
                container.appendChild(recapElement);
            }

            // Load navigation for single recap page
            loadRecapNavigation(data);
        })
        .catch(error => console.error('Error loading recap:', error));
}

// Load content when the DOM is fully loaded
window.addEventListener('DOMContentLoaded', () => {
    // Check if we're on the homepage
    if (document.getElementById('latest-news')) {
        loadContent('news', true);
    }
    if (document.getElementById('latest-recaps')) {
        loadContent('recaps', true);
    }

    // Check if we're on the full news page
    if (document.getElementById('news-container')) {
        loadContent('news');
    }

    // Check if we're on the recaps page
    if (document.getElementById('recaps-container')) {
        loadContent('recaps');
    }

    // Check if we're on a single recap page
    const urlParams = new URLSearchParams(window.location.search);
    const recapId = urlParams.get('id');
    if (recapId && document.getElementById('recap-container')) {
        loadSingleRecap(recapId);
    }
});