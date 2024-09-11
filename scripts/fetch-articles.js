async function fetchArticles() {
    const response = await fetch('/admin/config.yml');
    const config = await response.yaml(); // You'll need a YAML parser
    const articles = config.collections.find(c => c.name === 'blog').files;
    
    // Process and display articles
    articles.forEach(article => {
        console.log(article);
      // Create HTML elements, populate with article data, etc.
    });
  }
  
  fetchArticles();