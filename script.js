// Grocery List App Script – Rev3 Final
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

function saveList() {
  localStorage.setItem('groceryList', JSON.stringify(groceryList));
  renderList();
}

function renderList() {
  listEl.innerHTML = '';

  const unchecked = groceryList.filter(item => !item.checked);
  const checked = groceryList.filter(item => item.checked)
    .sort((a, b) => a.store.localeCompare(b.store) || a.category.localeCompare(b.category) || a.name.localeCompare(b.name));

  let sortedUnchecked = [...unchecked];
  if (filterMode.value === 'store') {
    sortedUnchecked.sort((a, b) => a.store.localeCompare(b.store));
  } else if (filterMode.value === 'category') {
    sortedUnchecked.sort((a, b) => a.category.localeCompare(b.category));
  }

  [...sortedUnchecked, ...checked].forEach((item, index) => {
    const li = document.createElement('li');
    if (item.checked) li.classList.add('checked');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = item.checked;
    checkbox.addEventListener('change', () => {
      item.checked = checkbox.checked;
      saveList();
    });

    const content = document.createElement('div');
    content.className = 'content';

    const nameField = document.createElement('span');
    nameField.textContent = item.name;
    nameField.className = 'item-name';

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
    content.appendChild(nameField);
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
    actions.appendChild(deleteBtn);

    if (!item.checked) {
      const handle = document.createElement('span');
      handle.className = 'drag-handle';
      handle.innerHTML = '&#8942;&#8942;';
      actions.appendChild(handle);
    }

    li.appendChild(checkbox);
    li.appendChild(content);
    li.appendChild(actions);
    listEl.appendChild(li);
  });

  Sortable.create(listEl, {
    animation: 200,
    handle: '.drag-handle',
    filter: '.checked',
    ghostClass: 'sortable-ghost',
    onEnd: e => {
      const uncheckedItems = groceryList.filter(i => !i.checked);
      const checkedItems = groceryList.filter(i => i.checked);
      const [moved] = uncheckedItems.splice(e.oldIndex, 1);
      uncheckedItems.splice(e.newIndex, 0, moved);
      groceryList = [...uncheckedItems, ...checkedItems];
      saveList();
    }
  });
}

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

addItemBtn.addEventListener('click', () => {
  if (addItemModal.classList.contains('hidden')) {
    addItemModal.classList.remove('hidden');
  } else {
    form.reset();
    addItemModal.classList.add('hidden');
  }
});

closeAddModalBtn.addEventListener('click', () => {
  form.reset();
  addItemModal.classList.add('hidden');
});

settingsBtn.addEventListener('click', () => {
  settingsModal.classList.toggle('hidden');
});

closeSettingsBtn.addEventListener('click', () => {
  settingsModal.classList.add('hidden');
});

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

renderList();