// Grocery List App Script
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
    knownStores.add(item.store);
    knownCategories.add(item.category);
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
  let sorted = [...groceryList];

  if (filterMode.value === 'store') {
    sorted.sort((a, b) => a.store.localeCompare(b.store));
  } else if (filterMode.value === 'category') {
    sorted.sort((a, b) => a.category.localeCompare(b.category));
  } else {
    sorted.sort((a, b) => a.checked - b.checked);
  }

  sorted.forEach((item, index) => {
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
    storeTag.contentEditable = true;
    storeTag.addEventListener('blur', () => {
      item.store = storeTag.textContent.trim();
      saveList();
    });

    const categoryTag = document.createElement('span');
    categoryTag.className = 'pill category';
    categoryTag.textContent = item.category;
    categoryTag.contentEditable = true;
    categoryTag.addEventListener('blur', () => {
      item.category = categoryTag.textContent.trim();
      saveList();
    });

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

    const handle = document.createElement('span');
    handle.className = 'drag-handle';
    handle.innerHTML = '&#8942;&#8942;';

    const actions = document.createElement('div');
    actions.className = 'actions';
    actions.appendChild(deleteBtn);
    actions.appendChild(handle);

    li.appendChild(checkbox);
    li.appendChild(content);
    li.appendChild(actions);
    listEl.appendChild(li);
  });

  Sortable.create(listEl, {
    animation: 200,
    handle: '.drag-handle',
    ghostClass: '', // no visual ghost
    chosenClass: 'sortable-chosen',
    dragClass: '',
    onEnd: e => {
      const unchecked = groceryList.filter(i => !i.checked);
      const checked = groceryList.filter(i => i.checked);
      const [moved] = unchecked.splice(e.oldIndex, 1);
      unchecked.splice(e.newIndex, 0, moved);
      groceryList = [...unchecked, ...checked.sort((a, b) => a.store.localeCompare(b.store) || a.category.localeCompare(b.category))];
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

addItemBtn.addEventListener('click', () => addItemModal.classList.remove('hidden'));
closeAddModalBtn.addEventListener('click', () => addItemModal.classList.add('hidden'));
settingsBtn.addEventListener('click', () => settingsModal.classList.remove('hidden'));
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