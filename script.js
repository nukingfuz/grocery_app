let groceryList = JSON.parse(localStorage.getItem('groceryList')) || [];

const listEl = document.getElementById('grocery-list');
const form = document.getElementById('item-form');
const filterMode = document.getElementById('filter-mode');
const clearCheckedBtn = document.getElementById('clear-checked');
const downloadBtn = document.getElementById('download-list');
const uploadInput = document.getElementById('upload-list');

// Modal elements
const addItemModal = document.getElementById('add-item-modal');
const settingsModal = document.getElementById('settings-modal');
const addItemBtn = document.getElementById('add-item-btn');
const settingsBtn = document.getElementById('settings-btn');
const closeAddBtn = document.getElementById('close-add-modal');
const closeSettingsBtn = document.getElementById('close-settings');

function saveList() {
  localStorage.setItem('groceryList', JSON.stringify(groceryList));
  renderList();
}

function renderList() {
  listEl.innerHTML = '';
  let unchecked = groceryList.filter(item => !item.checked);
  let checked = groceryList.filter(item => item.checked);

  // Apply sorting to unchecked list based on filter
  if (filterMode.value === 'store') {
    unchecked.sort((a, b) => a.store.localeCompare(b.store));
  } else if (filterMode.value === 'category') {
    unchecked.sort((a, b) => a.category.localeCompare(b.category));
  }

  // Sort checked items by store > category > name
  checked.sort((a, b) =>
    a.store.localeCompare(b.store) ||
    a.category.localeCompare(b.category) ||
    a.name.localeCompare(b.name)
  );

  const combinedList = [...unchecked, ...checked];

  combinedList.forEach((item, index) => {
    const li = document.createElement('li');
    li.className = item.checked ? 'checked' : '';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = item.checked;
    checkbox.addEventListener('change', () => {
      item.checked = checkbox.checked;
      saveList();
    });

    const content = document.createElement('div');
    content.className = 'content';
    const name = document.createElement('span');
    name.textContent = item.name;
    name.className = 'item-name';
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

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.innerHTML = '<strong>X</strong>';
    deleteBtn.addEventListener('click', () => {
      groceryList.splice(index, 1);
      saveList();
    });

    const actions = document.createElement('div');
    actions.className = 'actions';

    if (!item.checked) {
      const handle = document.createElement('span');
      handle.className = 'drag-handle';
      handle.innerHTML = '&#8942;&#8942;';
      actions.appendChild(handle);
    }

    actions.appendChild(deleteBtn);

    li.appendChild(checkbox);
    li.appendChild(content);
    li.appendChild(actions);
    listEl.appendChild(li);
  });

  // Only allow drag for unchecked items
  const draggableItems = Array.from(listEl.children).filter(
    li => !li.classList.contains('checked')
  );

  Sortable.create(listEl, {
    animation: 200,
    handle: '.drag-handle',
    ghostClass: 'sortable-ghost',
    chosenClass: 'sortable-chosen',
    dragClass: 'sortable-drag',
    filter: '.checked',
    onEnd: e => {
      const from = e.oldIndex;
      const to = e.newIndex;
      const active = groceryList.filter(item => !item.checked);
      const moved = active.splice(from, 1)[0];
      active.splice(to, 0, moved);

      const inactive = groceryList.filter(item => item.checked);
      inactive.sort((a, b) =>
        a.store.localeCompare(b.store) ||
        a.category.localeCompare(b.category) ||
        a.name.localeCompare(b.name)
      );

      groceryList = [...active, ...inactive];
      saveList();
    }
  });
}

// Form submission (Add Item)
form.addEventListener('submit', e => {
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

// Filter mode
filterMode.addEventListener('change', renderList);

// Clear checked items (unchecks them)
clearCheckedBtn.addEventListener('click', () => {
  groceryList.forEach(item => item.checked = false);
  saveList();
});

// Download JSON list
downloadBtn.addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(groceryList, null, 2)], {
    type: 'application/json'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'grocery_list.json';
  a.click();
  URL.revokeObjectURL(url);
});

// Upload JSON list
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
        alert('Invalid file format.');
      }
    } catch {
      alert('Failed to parse file.');
    }
  };
  reader.readAsText(file);
});

// --- MODAL TOGGLE LOGIC ---

addItemBtn.addEventListener('click', () => {
  const isVisible = !addItemModal.classList.contains('hidden');
  addItemModal.classList.toggle('hidden', isVisible);
  if (!isVisible) {
    form.reset();
  }
});

closeAddBtn.addEventListener('click', () => {
  addItemModal.classList.add('hidden');
  form.reset();
});

settingsBtn.addEventListener('click', () => {
  const isVisible = !settingsModal.classList.contains('hidden');
  settingsModal.classList.toggle('hidden', isVisible);
});

closeSettingsBtn.addEventListener('click', () => {
  settingsModal.classList.add('hidden');
});

// --- Initialize ---
renderList();