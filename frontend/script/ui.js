// UI Helper Functions

// Toast Notification
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container') || createToastContainer();
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span>${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span>
        <span>${message}</span>
    `;
    container.appendChild(toast);

    // Remove after 3 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
    return container;
}

// Drag & Drop Handling
function setupDragAndDrop(dropZoneId, fileInputId, fileListId) {
    const dropZone = document.getElementById(dropZoneId);
    const fileInput = document.getElementById(fileInputId);
    const fileList = document.getElementById(fileListId);

    if (!dropZone || !fileInput) return;

    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });

    // Highlight drop zone when item is dragged over it
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, unhighlight, false);
    });

    // Handle dropped files
    dropZone.addEventListener('drop', handleDrop, false);
    dropZone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFiles);

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    function highlight(e) {
        dropZone.classList.add('dragover');
    }

    function unhighlight(e) {
        dropZone.classList.remove('dragover');
    }

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        fileInput.files = files; // Update input files
        updateFileList(files);
    }

    function handleFiles() {
        updateFileList(this.files);
    }

    function updateFileList(files) {
        fileList.innerHTML = '';
        if (files.length === 0) return;

        Array.from(files).forEach(file => {
            const item = document.createElement('div');
            item.className = 'file-item';
            item.innerHTML = `
                <span class="name">${file.name}</span>
                <span class="size">${formatBytes(file.size)}</span>
            `;
            fileList.appendChild(item);
        });

        // Update drop zone text
        const dropText = dropZone.querySelector('.drop-zone-text');
        if (dropText) dropText.textContent = `${files.length} file(s) selected`;
    }
}

function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Password Visibility Toggle
function setupPasswordToggle(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;

    // Create toggle button wrapper
    const wrapper = document.createElement('div');
    wrapper.style.position = 'relative';
    input.parentNode.insertBefore(wrapper, input);
    wrapper.appendChild(input);

    const toggle = document.createElement('span');
    toggle.innerHTML = '👁️';
    toggle.style.position = 'absolute';
    toggle.style.right = '10px';
    toggle.style.top = '50%';
    toggle.style.transform = 'translateY(-50%)';
    toggle.style.cursor = 'pointer';
    toggle.style.opacity = '0.7';

    toggle.onclick = () => {
        const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
        input.setAttribute('type', type);
        toggle.innerHTML = type === 'password' ? '👁️' : '🔒';
    };

    wrapper.appendChild(toggle);
}

// Loading State
function setLoading(buttonId, isLoading, text = 'Processing...') {
    const btn = document.getElementById(buttonId);
    if (!btn) return;

    if (isLoading) {
        btn.dataset.originalText = btn.innerHTML;
        btn.innerHTML = `<span class="spinner"></span> ${text}`;
        btn.disabled = true;
    } else {
        btn.innerHTML = btn.dataset.originalText || 'Submit';
        btn.disabled = false;
    }
}
