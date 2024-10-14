import { parseMarkdown } from './markdownParser.js';
import DOMPurify from 'https://cdn.skypack.dev/dompurify';

function createContentElementMarkdown(item, isTruncated = false, contentType) {
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

    const textElement = document.createElement('div');
    if (isTruncated) {
        textElement.innerHTML = item.content.slice(0, 500) + '...';
        
        const readMoreLink = document.createElement('a');
        readMoreLink.href = `/../${contentType}.html`;
        readMoreLink.textContent = 'Read More';
        readMoreLink.className = 'read-more';
        
        textElement.appendChild(readMoreLink);
    } else {
        textElement.innerHTML = DOMPurify.sanitize(item.content);
    }
    contentElement.appendChild(textElement);

    return contentElement;
}

function loadContentMd(contentType, isTruncated = false) {
    console.log(`Loading content for type: ${contentType}, isTruncated: ${isTruncated}`);
    const containerSelector = isTruncated ? `latest-${contentType}` : `${contentType}-container`;
    const contentContainer = document.getElementById(containerSelector);

    if (!contentContainer) {
        console.error(`Container not found: ${containerSelector}`);
        return;
    }

    fetch(`/content/${contentType}.json`)
        .then(response => response.json())
        .then(async fileList => {
            console.log(`File list loaded:`, fileList);
            fileList.sort((a, b) => new Date(b.date) - new Date(a.date));

            // If truncated or if we're on the recaps page, want to load only the first item
            if (isTruncated || contentType === 'recaps') {
                const fileToLoad = fileList[0];
                console.log(`Attempting to load file: ${fileToLoad.filename}`);
                const item = await fetchMarkdownFile(contentType, fileToLoad.filename);
                console.log(`Loaded item:`, item);
                const itemElement = createContentElementMarkdown(item, isTruncated, contentType);
                contentContainer.appendChild(itemElement);

                if (contentType === 'recaps' && !isTruncated) {
                    loadRecapNavigation(fileList);
                }
            }
            // Else, want to load everything
            else (
                fileList.forEach(async file => {
                    const item = await fetchMarkdownFile(contentType, file.filename);
                    const itemElement = createContentElementMarkdown(item, isTruncated, contentType);
                    contentContainer.appendChild(itemElement);
                })
            )
        })
        .catch(error => {
            console.error(`Error in loadContent for ${contentType}:`, error);
        });
}
const fetchMarkdownFile = async (contentType, filename) => {
    const url = `/content/${contentType}/${filename}`;
    console.log(`Attempting to fetch Markdown file from: ${url}`);
    try {
        const response = await fetch(url);
        console.log(`Fetch response status: ${response.status}`);
        console.log(`Fetch response headers:`, Object.fromEntries(response.headers));
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} for ${url}`);
        }
        
        const text = await response.text();
        console.log(`Successfully fetched ${filename}. First 100 characters:`, text.substring(0, 100));
        
        const parsed = parseMarkdown(text);
        console.log(`Parsed markdown:`, parsed);
        
        return parsed;
    } catch (error) {
        console.error(`Error fetching ${filename}:`, error);
        console.log('Full URL:', new URL(url, window.location.href).href);
        throw error;
    }
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
        .then(async data => {
            const recap = data.find(item => item.id === parseInt(recapId));
            if (recap) {
                console.log("Found recap with id " + recapId);
                const container = document.getElementById('recap-container');
                const item = await fetchMarkdownFile("recaps", recap.filename);
                console.log(`Loaded item:`, item);
                const itemElement = createContentElementMarkdown(item, false, "recap");
                container.appendChild(itemElement);
            }
            else {
                console.log("Did not find recap with id " + recapId);
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
        loadContentMd('news', true);
    }
    if (document.getElementById('latest-recaps')) {
        loadContentMd('recaps', true);
    }

    // Check if we're on the full news page
    if (document.getElementById('news-container')) {
        loadContentMd('news');
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