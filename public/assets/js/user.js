export function initializeUserControls() {
    const setUsernameBtn = document.getElementById('setUsernameBtn');
    const clearUsernameBtn = document.getElementById('clearUsernameBtn');
    const usernameDisplay = document.getElementById('usernameDisplay');

    setUsernameBtn.onclick = () => {
        const username = prompt('Enter your username:');
        if (username) {
            localStorage.setItem('username', username);
            usernameDisplay.textContent = `Username: ${username}`;
        }
    };

    clearUsernameBtn.onclick = () => {
        localStorage.removeItem('username');
        usernameDisplay.textContent = 'Username: Anonymous';
    };

    const savedUsername = localStorage.getItem('username');
    if (savedUsername) {
        usernameDisplay.textContent = `Username: ${savedUsername}`;
    }
}
