export function savePost(post) {
    const posts = JSON.parse(localStorage.getItem('posts')) || [];
    posts.push(post);
    localStorage.setItem('posts', JSON.stringify(posts));
}

export function getPosts() {
    return JSON.parse(localStorage.getItem('posts')) || [];
}

export function updatePost(index, updatedPost) {
    const posts = JSON.parse(localStorage.getItem('posts')) || [];
    posts[index] = updatedPost;
    localStorage.setItem('posts', JSON.stringify(posts));
}

export function deletePost(index) {
    const posts = JSON.parse(localStorage.getItem('posts')) || [];
    posts.splice(index, 1);
    localStorage.setItem('posts', JSON.stringify(posts));
}
