/**
 * EPS Premium Custom Dialogs (Universal Alert & Confirm)
 * Designed to completely replace the native alert() and confirm() methods,
 * removing website URL leakage from standard browser popups.
 */

(function () {
    // Create custom Alert function
    window.customAlert = function (message) {
        return new Promise((resolve) => {
            const backdrop = document.createElement('div');
            backdrop.className = 'custom-dialog-backdrop';
            
            const box = document.createElement('div');
            box.className = 'custom-dialog-box';
            
            box.innerHTML = `
                <div class="custom-dialog-header">🚀 Notifikasi Sistem</div>
                <div class="custom-dialog-body">${message}</div>
                <div class="custom-dialog-footer">
                    <button class="custom-dialog-btn primary-btn">OK</button>
                </div>
            `;
            
            backdrop.appendChild(box);
            document.body.appendChild(backdrop);
            
            // Animation Trigger
            setTimeout(() => {
                backdrop.classList.add('active');
                box.classList.add('active');
            }, 10);
            
            const closeBtn = box.querySelector('.primary-btn');
            closeBtn.onclick = function () {
                backdrop.classList.remove('active');
                box.classList.remove('active');
                setTimeout(() => {
                    document.body.removeChild(backdrop);
                    resolve();
                }, 200);
            };
        });
    };
    
    // Create custom Confirm function (returns Promise<boolean>)
    window.customConfirm = function (message) {
        return new Promise((resolve) => {
            const backdrop = document.createElement('div');
            backdrop.className = 'custom-dialog-backdrop';
            
            const box = document.createElement('div');
            box.className = 'custom-dialog-box';
            
            box.innerHTML = `
                <div class="custom-dialog-header">❓ Konfirmasi Tindakan</div>
                <div class="custom-dialog-body">${message}</div>
                <div class="custom-dialog-footer">
                    <button class="custom-dialog-btn secondary-btn cancel-btn">Batal</button>
                    <button class="custom-dialog-btn primary-btn confirm-btn">Lanjutkan</button>
                </div>
            `;
            
            backdrop.appendChild(box);
            document.body.appendChild(backdrop);
            
            // Animation Trigger
            setTimeout(() => {
                backdrop.classList.add('active');
                box.classList.add('active');
            }, 10);
            
            const cancelBtn = box.querySelector('.cancel-btn');
            const confirmBtn = box.querySelector('.confirm-btn');
            
            cancelBtn.onclick = function () {
                backdrop.classList.remove('active');
                box.classList.remove('active');
                setTimeout(() => {
                    document.body.removeChild(backdrop);
                    resolve(false);
                }, 200);
            };
            
            confirmBtn.onclick = function () {
                backdrop.classList.remove('active');
                box.classList.remove('active');
                setTimeout(() => {
                    document.body.removeChild(backdrop);
                    resolve(true);
                }, 200);
            };
        });
    };
    
    // Override window.alert globally
    window.alert = function (message) {
        window.customAlert(message);
    };
})();
