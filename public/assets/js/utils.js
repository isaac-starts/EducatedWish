export function clearInputs() {
    document.getElementById('wishTitle').value = '';
    document.getElementById('wishContent').value = '';
    document.getElementById('wishFile').value = '';
    document.querySelectorAll('.color-swatch').forEach((swatch) => {
        swatch.classList.remove('selected');
    });
    document.querySelector('.color-swatch[data-color="#FFF9C4"]').classList.add('selected'); // Default to yellow
}

export function openModal() {
    document.getElementById('commentModal').style.display = 'flex';
}

export function closeModal() {
    document.getElementById('commentModal').style.display = 'none';
}
