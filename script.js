// Grocery List App Script - Rev2
let groceryList = JSON.parse(localStorage.getItem('groceryList')) || [];
let knownStores = new Set();
let knownCategories = new Set();

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
  updateSuggestions();
  renderList();
}

function updateSuggestions() {
  knownStores.clear();
  knownCategories.clear();
  groceryList.forEach(item => {
    if (item.store) knownStores.add(item.store);
    if (item.category) knownCategories.add(item.category);
  });

  const storeDatalist = document.getElementById('store-suggestions');
  const categoryDatalist = document.getElementById('category-suggestions');
  storeDatalist.innerHTML = '';
  categoryDatalist.innerHTML = '';

  knownStores.forEach(store => {
    const opt = document.createElement('option');
    opt.value = store;
    storeDatalist.appendChild(opt);
  });
  knownCategories.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    categoryDatalist.appendChild(opt);
  });
}

function createEditableField(value, onSave) {
  const span = document.createElement('span');
  span.className = 'editable';
  span.contentEditable = true;
  span.textContent = value;
  span.addEventListener('blur', () => onSave(span.textContent.trim()));
  span.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      span.blur();
    }
  });
  return span;
}

function renderList() {
  listEl.innerHTML = '';

  const unchecked = groceryList.filter(i => i.checked === false);
  const checked = groceryList.filter(i => i.checked === true)
    .sort((a, b) =>
      a.store.localeCompare(b.store) ||
      a.category.localeCompare(b.category) ||
      a.name.localeCompare(b.name)
    );

  [...unchecked, ...checked].forEach((item, index) => {
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
    const nameField = createEditableField(item.name, newVal => {
      item.name = newVal;
      saveList();
    });

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

    const actions = document.createElement('div');
    actions.className = 'actions';

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.innerHTML = '<strong>X</strong>';
    deleteBtn.addEventListener('click', () => {
      groceryList.splice(index, 1);
      saveList();
    });
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
    animation: 180,
    handle: '.drag-handle',
    filter: '.checked',
    onEnd: evt => {
      const newOrder = [];
      [...listEl.children].forEach(li => {
        const name = li.querySelector('.editable').textContent.trim();
        const item = groceryList.find(i => i.name === name && !i.checked);
        if (item) newOrder.push(item);
      });
      const checkedItems = groceryList.filter(i => i.checked);
      groceryList = [...newOrder, ...checkedItems];
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

updateSuggestions();
renderList();