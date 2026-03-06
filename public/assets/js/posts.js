import { posts } from './storage.js'; // Assuming you have a storage.js to manage localStorage

export function createPostIt() {
    const title = document.getElementById('wishTitle').value;
    const content = document.getElementById('wishContent').value;
    const selectedColor = document.querySelector('.color-swatch.selected').dataset.color;
    const fileInput = document.getElementById('wishFile');
    const username = localStorage.getItem('username') || 'Anonymous';

    if (title === '' || content === '' || !selectedColor) {
        alert('Please fill in all fields and select a color.');
        return;
    }

    const post = {
        id: Date.now(),
        title,
        content,
        color: selectedColor,
        username,
        image: ''
    };

    if (fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
            post.image = e.target.result;
            posts.push(post);
            localStorage.setItem('posts', JSON.stringify(posts));
            displayPost(post);
            clearForm();
        };
        reader.readAsDataURL(fileInput.files[0]);
    } else {
        posts.push(post);
        localStorage.setItem('posts', JSON.stringify(posts));
        displayPost(post);
        clearForm();
    }
}

export function displayPost(post) {
    const postItContainer = document.getElementById('postItContainer');
    const postIt = document.createElement('div');
    postIt.className = 'post-it';
    postIt.style.backgroundColor = post.color;
    postIt.innerHTML = `
        <h3>${post.title}</h3>
        <p>${post.content}</p>
        ${post.image ? `<img class="post-image" src="${post.image}" alt="Post Image">` : ''}
        <div class="username">Posted by: ${post.username}</div>
        <button class="like-button" onclick="likePost(${post.id})">Like <span class="like-counter">0</span></button>
        <button class="comment-button" onclick="commentPost(${post.id})">Comment <span class="comment-counter">0</span></button>
    `;
    postIt.onclick = () => openPostModal(post.id);
    postItContainer.appendChild(postIt);
}

export function openPostModal(postId) {
    const post = posts.find(p => p.id === postId);
    const modal = document.getElementById('commentModal');
    const modalContent = document.getElementById('modalContent');
    modalContent.innerHTML = `
        <span class="close" onclick="closePostModal()">&times;</span>
        <h3>${post.title}</h3>
        <p>${post.content}</p>
        ${post.image ? `<img class="post-image" src="${post.image}" alt="Post Image">` : ''}
        <div class="username">Posted by: ${post.username}</div>
        <button onclick="editPost(${post.id})">Edit</button>
        <button onclick="deletePost(${post.id})">Delete</button>
    `;
    modal.style.display = 'flex';
}

export function closePostModal() {
    document.getElementById('commentModal').style.display = 'none';
}

export function editPost(postId) {
    // Edit post logic here
}

export function deletePost(postId) {
    const index = posts.findIndex(p => p.id === postId);
    if (index !== -1) {
        posts.splice(index, 1);
        localStorage.setItem('posts', JSON.stringify(posts));
        document.getElementById('postItContainer').innerHTML = '';
        posts.forEach(displayPost);
        closePostModal();
    }
}

export function likePost(postId) {
    // Like post logic here
}

export function commentPost(postId) {
    // Comment post logic here
}

export function removeImage() {
    document.getElementById('wishFile').value = '';
}

function clearForm() {
    document.getElementById('wishTitle').value = '';
    document.getElementById('wishContent').value = '';
    document.getElementById('wishFile').value = '';
    document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('selected'));
    document.querySelector('.color-swatch[data-color="#FFF9C4"]').classList.add('selected');
}
