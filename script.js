// Grocery List App – Rev3: Final Stable Version (Drag + Checkbox Fixed)

let groceryList = JSON.parse(localStorage.getItem('groceryList')) || [];

const listEl = document.getElementById('grocery-list');
const form = document.getElementById('item-form');
const filterMode = document.getElementById('filter-mode');
const addItemBtn = document.getElementById('add-item-btn');
const addItemModal = document.getElementById('add-item-modal');
const closeAddModalBtn = document.getElementById('close-add-modal');
const settingsBtn = document.getElementById('settings-btn');
const settingsModal = document.getElementById('settings-modal');
const closeSettingsBtn = document.getElementById('close-settings');
const clearCheckedBtn = document.getElementById('clear-checked');
const downloadBtn = document.getElementById('download-list');
const uploadInput = document.getElementById('upload-list');

// Save and persist
function saveList() {
  localStorage.setItem('groceryList', JSON.stringify(groceryList));
  renderList();
}

// Rendering logic
function renderList() {
  listEl.innerHTML = '';

  let unchecked = groceryList.filter(item => !item.checked);
  let checked = groceryList.filter(item => item.checked);

  // Apply optional filtering
  const filter = filterMode.value;
  if (filter === 'store') {
    unchecked.sort((a, b) => a.store.localeCompare(b.store));
  } else if (filter === 'category') {
    unchecked.sort((a, b) => a.category.localeCompare(b.category));
  }

  // Sort checked items by store → category → name
  checked.sort((a, b) => {
    return a.store.localeCompare(b.store) ||
           a.category.localeCompare(b.category) ||
           a.name.localeCompare(b.name);
  });

  const fullList = [...unchecked, ...checked];

  fullList.forEach((item, index) => {
    const li = document.createElement('li');
    if (item.checked) li.classList.add('checked');

    // Checkbox
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = item.checked;
    checkbox.addEventListener('change', () => {
      item.checked = checkbox.checked;
      saveList();
    });

    // Item content
    const content = document.createElement('div');
    content.className = 'content';

    const name = document.createElement('span');
    name.textContent = item.name;
    content.appendChild(name);

    const tags = document.createElement('div');
    tags.className = 'tags';

    const storeTag = document.createElement('span');
    storeTag.className = 'pill store';
    storeTag.textContent = item.store;
    const categoryTag = document.createElement('span');
    categoryTag.className = 'pill category';
    categoryTag.textContent = item.category;

    tags.appendChild(storeTag);
    tags.appendChild(categoryTag);
    content.appendChild(tags);

    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.innerHTML = '<strong>X</strong>';
    deleteBtn.addEventListener('click', () => {
      groceryList.splice(index, 1);
      saveList();
    });

    // Drag handle (only for unchecked)
    const actions = document.createElement('div');
    actions.className = 'actions';
    actions.appendChild(deleteBtn);
    if (!item.checked) {
      const dragHandle = document.createElement('span');
      dragHandle.className = 'drag-handle';
      dragHandle.innerHTML = '&#8942;&#8942;';
      actions.appendChild(dragHandle);
    }

    li.appendChild(checkbox);
    li.appendChild(content);
    li.appendChild(actions);
    listEl.appendChild(li);
  });

  // Apply drag-and-drop for unchecked items only
  new Sortable(listEl, {
    animation: 150,
    handle: '.drag-handle',
    draggable: 'li:not(.checked)',
    filter: '.checked',
    onEnd: (e) => {
      const uncheckedItems = groceryList.filter(i => !i.checked);
      const movedItem = uncheckedItems.splice(e.oldIndex, 1)[0];
      uncheckedItems.splice(e.newIndex, 0, movedItem);

      // Rebuild groceryList with reordered unchecked followed by checked
      groceryList = [...uncheckedItems, ...groceryList.filter(i => i.checked)];
      saveList();
    }
  });
}

// Add Item Logic
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('item-name').value.trim();
  const store = document.getElementById('item-store').value.trim();
  const category = document.getElementById('item-category').value.trim();

  if (!name || !store || !category) return;

  groceryList.push({ name, store, category, checked: false });
  form.reset();
  addItemModal.classList.add('hidden');
  saveList();
});

// Modal Controls
addItemBtn.addEventListener('click', () => {
  const wasOpen = !addItemModal.classList.contains('hidden');
  closeAllModals();
  if (!wasOpen) addItemModal.classList.remove('hidden');
});

closeAddModalBtn.addEventListener('click', () => {
  addItemModal.classList.add('hidden');
  form.reset();
});

settingsBtn.addEventListener('click', () => {
  const wasOpen = !settingsModal.classList.contains('hidden');
  closeAllModals();
  if (!wasOpen) settingsModal.classList.remove('hidden');
});

closeSettingsBtn.addEventListener('click', () => {
  settingsModal.classList.add('hidden');
});

function closeAllModals() {
  addItemModal.classList.add('hidden');
  settingsModal.classList.add('hidden');
}

// Filter change
filterMode.addEventListener('change', renderList);

// Clear all checked items
clearCheckedBtn.addEventListener('click', () => {
  groceryList.forEach(item => item.checked = false);
  saveList();
});

// Download backup
downloadBtn.addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(groceryList, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'grocery_list.json';
  a.click();
  URL.revokeObjectURL(url);
});

// Upload backup
uploadInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (Array.isArray(data)) {
        groceryList = data;
        saveList();
      } else {
        alert('Invalid file format.');
      }
    } catch {
      alert('Failed to read the file.');
    }
  };
  reader.readAsText(file);
});

renderList();