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

function loadContentJson(contentType, isTruncated = false) {
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

function loadContentMd(contentType, isTruncated = false) {
    const containerSelector = isTruncated ? `latest-${contentType}` : `${contentType}-container`;
    const contentContainer = document.getElementById(containerSelector);

    if (!contentContainer) {
        console.error(`Container not found: ${containerSelector}`);
        return;
    }

    const listUrl = `/../content/${contentType}.json`;
    console.log(`Attempting to fetch list from: ${listUrl}`);

    fetch(listUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status} for ${listUrl}`);
            }
            return response.json();
        })
        .then(async fileList => {
            console.log(`Successfully fetched file list for ${contentType}:`, fileList);
            fileList.sort((a, b) => new Date(b.date) - new Date(a.date));

            if (isTruncated || contentType === 'recaps') {
                const fileToLoad = fileList[0];
                console.log(`Attempting to fetch file: ${fileToLoad.filename}`);
                const item = await fetchMarkdownFile(fileToLoad.filename);
                const itemElement = createContentElement(item, isTruncated, contentType);
                contentContainer.appendChild(itemElement);

                if (contentType === 'recaps' && !isTruncated) {
                    loadRecapNavigation(fileList);
                }
            } else if (contentType === 'news') {
                for (const file of fileList) {
                    console.log(`Attempting to fetch file: ${file.filename}`);
                    const item = await fetchMarkdownFile(file.filename);
                    const itemElement = createContentElement(item, false, contentType);
                    contentContainer.appendChild(itemElement);
                }
            }
        })
        .catch(error => {
            console.error(`Error in loadContent for ${contentType}:`, error);
            console.log('Stack trace:', error.stack);
        });
}
   // Function to fetch and parse a single Markdown file
   const fetchMarkdownFile = async (filename) => {
    const url = `/../content/${filename}`;
    console.log(`Attempting to fetch Markdown file from: ${url}`);
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} for ${url}`);
        }
        const text = await response.text();
        console.log(`Successfully fetched ${filename}`);
        return parseMarkdown(text);
    } catch (error) {
        console.error(`Error fetching ${filename}:`, error);
        console.log('Full URL:', new URL(url, window.location.href).href);
        throw error;
    }
};

// Function to parse Markdown and extract metadata
const parseMarkdown = (markdown) => {
    const lines = markdown.split('\n');
    const metadata = {};
    let content = '';
    let inMetadata = false;

    for (const line of lines) {
        if (line.trim() === '---') {
            inMetadata = !inMetadata;
            continue;
        }
        if (inMetadata) {
            const [key, value] = line.split(':').map(s => s.trim());
            metadata[key] = value;
        } else {
            content += line + '\n';
        }
    }

    return { ...metadata, content: content.trim() };
};

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
        loadContentJson('news', true);
    }
    if (document.getElementById('latest-recaps')) {
        loadContentMd('recaps', true);
    }

    // Check if we're on the full news page
    if (document.getElementById('news-container')) {
        loadContentJson('news');
    }

    // Check if we're on the recaps page
    if (document.getElementById('recaps-container')) {
        loadContentMd('recaps');
    }

    // Check if we're on a single recap page
    const urlParams = new URLSearchParams(window.location.search);
    const recapId = urlParams.get('id');
    if (recapId && document.getElementById('recap-container')) {
        loadSingleRecap(recapId);
    }
});