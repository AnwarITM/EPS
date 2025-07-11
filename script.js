// ====================== VARIABEL GLOBAL ======================
let tabs = [{ id: 0, name: 'Tab 1', data: [] }];
let currentTab = 0;
let editIndex = -1;
let pendingAction = null;
let loader = null;

const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// ====================== LOADER DINAMIS ======================
function createLoader() {
    const loader = document.createElement('div');
    loader.id = 'dynamic-loader';
    loader.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 9999;
        border: 5px solid #f3f3f3;
        border-top: 5px solid #3498db;
        border-radius: 50%;
        width: 50px;
        height: 50px;
        animation: spin 1s linear infinite;
        display: none;
    `;

    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin {
            0% { transform: translate(-50%, -50%) rotate(0deg); }
            100% { transform: translate(-50%, -50%) rotate(360deg); }
        }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(loader);
    return loader;
}

function showLoader(show) {
    if (!loader) loader = createLoader();
    loader.style.display = show ? 'block' : 'none';
    document.body.style.pointerEvents = show ? 'none' : '';
    document.body.style.cursor = show ? 'wait' : '';
}

// ====================== INISIALISASI APLIKASI ======================
function initializeData() {
    try {
        const savedTheme = localStorage.getItem('theme') || 'light';
        const themeLink = document.getElementById('theme-link');
        themeLink.href = savedTheme === 'dark' ? 'theme-dark.css' : 'theme-light.css';

        if (savedTheme === 'dark') {
            document.body.classList.add('dark');
        } else {
            document.body.classList.remove('dark');
        }

        if (!localStorage.getItem('tabs')) {
            tabs[0].data = [
                { machineData: 'Machine A', period: 'Jan', status: 'Done', notes: 'Initial check' },
                { machineData: 'Machine B', period: 'Feb', status: 'Outstanding', notes: '' }
            ];
            saveToLocalStorage();
        } else {
            loadFromLocalStorage();
        }

        renderTabs();
        renderTable();
        updateStats();
        updateRemoveTabButton();
        updateHeaderTitle();
        
        // Pre-create loader
        loader = createLoader();
    } catch (error) {
        console.error('Error initializing data:', error);
        showAlertModal('Failed to initialize data. Check console for details.');
    }
}

// ====================== MANAJEMEN TAB ======================
function addTab() {
    if (tabs.length >= 5) {
        showAlertModal('Maximum 5 tabs allowed!');
        return;
    }
    const newTab = { id: tabs.length, name: `Tab ${tabs.length + 1}`, data: [] };
    tabs.push(newTab);
    switchTab(tabs.length - 1);
    saveToLocalStorage();
}

function removeTab() {
    if (currentTab === 0) {
        showAlertModal('Cannot delete first tab!');
        return;
    }
    
    showConfirmModal(
        'Delete this tab and all its data?',
        () => {
            tabs.splice(currentTab, 1);
            switchTab(0);
            saveToLocalStorage();
        },
        {
            btnText: 'Delete Tab',
            title: 'Delete Tab',
            btnClass: 'danger-btn'
        }
    );
}

function switchTab(index) {
    currentTab = index;
    renderTabs();
    renderTable();
    updateStats();
    updateRemoveTabButton();
    updateHeaderTitle();
}

// ====================== RENDER UI ======================
function renderTabs() {
    const tabsContainer = document.getElementById('tabs');
    tabsContainer.innerHTML = '';
    tabs.forEach((tab, index) => {
        const tabElement = document.createElement('div');
        tabElement.className = `tab ${currentTab === index ? 'active' : ''}`;
        tabElement.textContent = tab.name;
        tabElement.onclick = () => switchTab(index);
        tabsContainer.appendChild(tabElement);
    });
}

function renderTable() {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';
    tabs[currentTab].data.forEach((item, index) => {
        if (!item || !item.machineData || !item.period || !item.status) return;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>
                <span class="machine-data ${item.notes && item.notes.trim() ? 'has-notes' : ''}"
                    onclick="showEditModal(${index})"
                    title="Click to edit machine name & notes">
                    ${item.machineData}
                </span>
                ${item.notes && item.notes.trim() ? `<span class="notes-marquee">${item.notes}</span>` : ''}
            </td>
            <td>
                <select onchange="updatePeriod(${index}, this.value)">
                    ${monthOrder.map(month => `<option value="${month}" ${item.period === month ? 'selected' : ''}>${month}</option>`).join('')}
                </select>
            </td>
            <td>
                <select onchange="updateStatus(${index}, this.value)" class="status-${item.status.toLowerCase()}">
                    <option value="Done" ${item.status === 'Done' ? 'selected' : ''}>Done</option>
                    <option value="Outstanding" ${item.status === 'Outstanding' ? 'selected' : ''}>Outstanding</option>
                </select>
            </td>
            <td>
                <button class="delete-btn" onclick="deleteData(${index})" title="Delete Data">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function updateStats() {
    const data = tabs[currentTab].data;
    const total = data.length;
    const done = data.filter(item => item.status === 'Done').length;
    const outstanding = total - done;

    document.getElementById('totalStat').textContent = total;
    document.getElementById('doneStat').textContent = done;
    document.getElementById('outstandingStat').textContent = outstanding;
}

// ====================== MANAJEMEN DATA ======================
function showAddModal() {
    editIndex = -1;
    document.getElementById('addModal').style.display = 'flex';
    document.getElementById('modalTitle').textContent = 'Add Data';
    document.getElementById('machineData').value = '';
    document.getElementById('notes').value = '';
    document.getElementById('machineData').disabled = false;
}

function saveData() {
    const loader = document.getElementById('loader');
    loader.style.display = 'block';
    setTimeout(() => {
        const machineData = document.getElementById('machineData').value;
        const notes = document.getElementById('notes').value;

        if (!machineData && editIndex === -1) {
            showAlertModal('Machine Data is required!');
            loader.style.display = 'none';
            return;
        }

        if (editIndex === -1) {
            tabs[currentTab].data.push({
                machineData,
                period: 'Jan',
                status: 'Outstanding',
                notes
            });
        } else {
            tabs[currentTab].data[editIndex].machineData = machineData;
            tabs[currentTab].data[editIndex].notes = notes;
        }

        saveToLocalStorage();
        renderTable();
        updateStats();
        closeModal();
        loader.style.display = 'none';
    }, 500);
}

// ====================== IMPORT/EXPORT (PERBAIKAN) ======================
function resetAndOpenImport() {
    const fileInput = document.getElementById('importFile');
    fileInput.value = '';
    fileInput.click();
}

async function importData(event) {
    showLoader(true);
    
    try {
        const file = event.target.files[0];
        if (!file) return;

        const fileName = file.name.toLowerCase();
        
        if (!fileName.endsWith('.json') && !fileName.endsWith('.xlsx')) {
            throw new Error("Only .json or .xlsx files are supported");
        }

        const fileData = await readFile(file);
        const parsedData = fileName.endsWith('.json') 
            ? await parseJson(fileData) 
            : await parseExcel(fileData);

        tabs[currentTab].data = parsedData;
        saveToLocalStorage();
        renderTable();
        updateStats();
        
        showAlertModal(`Import successful! ${parsedData.length} items added.`);
    } catch (error) {
        console.error("Import error:", error);
        showAlertModal(`Import failed: ${error.message}`);
    } finally {
        showLoader(false);
        event.target.value = '';
    }
}

// Helper functions untuk import
function readFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader[file.name.endsWith('.json') ? 'readAsText' : 'readAsArrayBuffer'](file);
    });
}

function parseJson(jsonStr) {
    const data = JSON.parse(jsonStr);
    if (!Array.isArray(data)) throw new Error("Invalid JSON format");
    return data.map(item => ({
        machineData: item.machineData || '',
        period: item.period || 'Jan',
        status: item.status === 'Done' ? 'Done' : 'Outstanding',
        notes: item.notes || ''
    }));
}

function parseExcel(arrayBuffer) {
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    
    return jsonData.map(row => {
        const status = row.Status || row.status;
        return {
            machineData: row['Data Mesin'] || row.machineData || '',
            period: row.Plan || row.period || 'Jan',
            status: status && status.toString().toLowerCase() === 'done' ? 'Done' : 'Outstanding',
            notes: row.Notes || row.notes || ''
        };
    });
}

// ====================== FUNGSI TAMBAHAN ======================
function showAlertModal(message) {
    alert(message); // Ganti dengan modal custom jika tersedia
}

// Inisialisasi aplikasi
document.addEventListener('DOMContentLoaded', initializeData);
