export function initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    const sortSelect = document.getElementById('sortSelect');

    searchInput.addEventListener('input', () => filterPosts());
    sortSelect.addEventListener('change', () => filterPosts());

    filterPosts();
}

function filterPosts() {
    const searchValue = document.getElementById('searchInput').value.toLowerCase();
    const sortValue = document.getElementById('sortSelect').value;
    const postsContainer = document.getElementById('postsContainer');
    const posts = Array.from(postsContainer.children);

    let filteredPosts = posts.filter(post => {
        const title = post.querySelector('h3').textContent.toLowerCase();
        const content = post.querySelector('p').textContent.toLowerCase();
        return title.includes(searchValue) || content.includes(searchValue);
    });

    if (sortValue === 'newest') {
        filteredPosts.sort((a, b) => new Date(b.dataset.date) - new Date(a.dataset.date));
    } else if (sortValue === 'oldest') {
        filteredPosts.sort((a, b) => new Date(a.dataset.date) - new Date(b.dataset.date));
    } else if (sortValue === 'mostLiked') {
        filteredPosts.sort((a, b) => b.querySelector('.like-btn span').textContent - a.querySelector('.like-btn span').textContent);
    } else if (sortValue === 'mostCommented') {
        filteredPosts.sort((a, b) => b.querySelector('.comment-btn span').textContent - a.querySelector('.comment-btn span').textContent);
    }

    postsContainer.innerHTML = '';
    filteredPosts.forEach(post => postsContainer.appendChild(post));
}
