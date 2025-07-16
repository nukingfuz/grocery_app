// Grocery List App Script (Rev3 – Bulletproof Logic)

let groceryList = JSON.parse(localStorage.getItem('groceryList')) || [];

const listEl = document.getElementById('grocery-list');
const form = document.getElementById('item-form');
const nameInput = document.getElementById('item-name');
const storeInput = document.getElementById('item-store');
const categoryInput = document.getElementById('item-category');
const addItemBtn = document.getElementById('add-item-btn');
const addItemModal = document.getElementById('add-item-modal');
const closeAddModalBtn = document.getElementById('close-add-modal');
const settingsBtn = document.getElementById('settings-btn');
const settingsModal = document.getElementById('settings-modal');
const closeSettingsBtn = document.getElementById('close-settings');
const filterMode = document.getElementById('filter-mode');
const clearCheckedBtn = document.getElementById('clear-checked');
const downloadBtn = document.getElementById('download-list');
const uploadInput = document.getElementById('upload-list');

function saveList() {
  localStorage.setItem('groceryList', JSON.stringify(groceryList));
  renderList();
}

function renderList() {
  listEl.innerHTML = '';

  let unchecked = groceryList.filter(item => !item.checked);
  let checked = groceryList.filter(item => item.checked);

  // Sorting checked items by store > category > name
  checked.sort((a, b) =>
    a.store.localeCompare(b.store) ||
    a.category.localeCompare(b.category) ||
    a.name.localeCompare(b.name)
  );

  const filter = filterMode.value;
  if (filter === 'store') {
    unchecked.sort((a, b) => a.store.localeCompare(b.store));
  } else if (filter === 'category') {
    unchecked.sort((a, b) => a.category.localeCompare(b.category));
  }

  const allItems = [...unchecked, ...checked];

  allItems.forEach((item, index) => {
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

    // Content section
    const content = document.createElement('div');
    content.className = 'content';
    const name = document.createElement('span');
    name.textContent = item.name;
    content.appendChild(name);

    // Tags
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
    const dragHandle = document.createElement('span');
    dragHandle.className = 'drag-handle';
    dragHandle.innerHTML = '&#8942;&#8942;';

    const actions = document.createElement('div');
    actions.className = 'actions';
    actions.appendChild(deleteBtn);
    if (!item.checked) actions.appendChild(dragHandle);

    li.appendChild(checkbox);
    li.appendChild(content);
    li.appendChild(actions);
    listEl.appendChild(li);
  });

  // Drag-and-drop setup
  new Sortable(listEl, {
    animation: 150,
    handle: '.drag-handle',
    draggable: 'li:not(.checked)',
    onEnd: evt => {
      const uncheckedItems = groceryList.filter(item => !item.checked);
      const from = evt.oldIndex;
      const to = evt.newIndex;
      const movedItem = uncheckedItems.splice(from, 1)[0];
      uncheckedItems.splice(to, 0, movedItem);

      const newList = [...uncheckedItems, ...groceryList.filter(item => item.checked)];
      groceryList = newList;
      saveList();
    }
  });
}

// Form submission
form.addEventListener('submit', e => {
  e.preventDefault();
  const name = nameInput.value.trim();
  const store = storeInput.value.trim();
  const category = categoryInput.value.trim();
  if (!name || !store || !category) return;

  groceryList.push({ name, store, category, checked: false });
  form.reset();
  addItemModal.classList.add('hidden');
  saveList();
});

// Modal toggles
addItemBtn.addEventListener('click', () => {
  addItemModal.classList.toggle('hidden');
  form.reset();
});

closeAddModalBtn.addEventListener('click', () => {
  addItemModal.classList.add('hidden');
});

settingsBtn.addEventListener('click', () => {
  settingsModal.classList.toggle('hidden');
});

closeSettingsBtn.addEventListener('click', () => {
  settingsModal.classList.add('hidden');
});

// Clear Checked
clearCheckedBtn.addEventListener('click', () => {
  groceryList.forEach(item => item.checked = false);
  saveList();
});

// Upload backup
uploadInput.addEventListener('change', e => {
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
        alert('Invalid file format');
      }
    } catch {
      alert('Could not parse file');
    }
  };
  reader.readAsText(file);
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

// Filter
filterMode.addEventListener('change', renderList);

// Initial render
renderList();