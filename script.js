// Grocery List App Script (Rev3 – Bulletproof Logic with ID-based Toggle)

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

function generateId() {
  return '_' + Math.random().toString(36).substr(2, 9);
}

function saveList() {
  localStorage.setItem('groceryList', JSON.stringify(groceryList));
  renderList();
}

function renderList() {
  listEl.innerHTML = '';

  let unchecked = groceryList.filter(item => !item.checked);
  let checked = groceryList.filter(item => item.checked);

  // Sort checked by store > category > name
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

    // Actions
    const actions = document.createElement('div');
    actions.className = 'actions';

    if (!item.checked) {
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'delete-btn';
      deleteBtn.innerHTML = '<strong>X</strong>';
      deleteBtn.addEventListener('click', () => {
        groceryList.splice(index, 1);
        saveList();
      });

      const dragHandle = document.createElement('span');
      dragHandle.className = 'drag-handle';
      dragHandle.innerHTML = '&#8942;&#8942;';

      actions.appendChild(deleteBtn);
      actions.appendChild(dragHandle);
    }

    li.appendChild(checkbox);
    li.appendChild(content);
    li.appendChild(actions);
    listEl.appendChild(li);
  });

  // Refined Drag-and-drop (Unchecked only, clean reflow)
  new Sortable(listEl, {
    animation: 200,
    handle: '.drag-handle',
    draggable: 'li:not(.checked)',
    ghostClass: 'sortable-ghost',
    chosenClass: 'sortable-chosen',
    onEnd: evt => {
      const uncheckedItems = groceryList.filter(item => !item.checked);
      const checkedItems = groceryList.filter(item => item.checked);

      const from = evt.oldIndex;
      const to = evt.newIndex;

      if (from === to || from == null || to == null) return;

      const movedItem = uncheckedItems.splice(from, 1)[0];
      uncheckedItems.splice(to, 0, movedItem);

      groceryList = [...uncheckedItems, ...checkedItems];
      saveList();
    }
  });
}

form.addEventListener('submit', e => {
  e.preventDefault();
  const name = nameInput.value.trim();
  const store = storeInput.value.trim();
  const category = categoryInput.value.trim();
  if (!name || !store || !category) return;

  groceryList.push({ id: generateId(), name, store, category, checked: false });
  form.reset();
  addItemModal.classList.add('hidden');
  saveList();
});

addItemBtn.addEventListener('click', () => {
  addItemModal.classList.toggle('hidden');
  form.reset();
});
closeAddModalBtn.addEventListener('click', () => addItemModal.classList.add('hidden'));
settingsBtn.addEventListener('click', () => settingsModal.classList.toggle('hidden'));
closeSettingsBtn.addEventListener('click', () => settingsModal.classList.add('hidden'));
filterMode.addEventListener('change', renderList);

clearCheckedBtn.addEventListener('click', () => {
  groceryList.forEach(item => item.checked = false);
  saveList();
});

downloadBtn.addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(groceryList, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'grocery_list.json';
  a.click();
  URL.revokeObjectURL(url);
});

uploadInput.addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (Array.isArray(data)) {
        groceryList = data.map(item => ({
          ...item,
          id: item.id || generateId()
        }));
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

renderList();