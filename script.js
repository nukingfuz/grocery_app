// Grocery List App Script (Rev 3 – Drag-and-Drop Fixed)
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
  const uncheckedItems = groceryList.filter(item => !item.checked);
  const checkedItems = groceryList
    .filter(item => item.checked)
    .sort((a, b) => a.store.localeCompare(b.store) || a.category.localeCompare(b.category) || a.name.localeCompare(b.name));

  const combinedList = [...uncheckedItems, ...checkedItems];
  combinedList.forEach((item, index) => {
    const li = document.createElement('li');
    li.className = item.checked ? 'checked' : '';
    li.setAttribute('data-id', index);

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = item.checked;
    checkbox.addEventListener('change', () => {
      item.checked = checkbox.checked;
      saveList();
    });

    const content = document.createElement('div');
    content.className = 'content';

    const nameEl = document.createElement('span');
    nameEl.className = 'editable';
    nameEl.textContent = item.name;

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
    content.appendChild(nameEl);
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

    const dragHandle = document.createElement('span');
    dragHandle.className = 'drag-handle';
    dragHandle.innerHTML = '&#8942;&#8942;';
    if (!item.checked) actions.appendChild(dragHandle);
    actions.appendChild(deleteBtn);

    li.appendChild(checkbox);
    li.appendChild(content);
    li.appendChild(actions);

    listEl.appendChild(li);
  });

  // Apply sortable to unchecked items only
  const uncheckedLis = [...listEl.querySelectorAll('li:not(.checked)')];
  const sortable = Sortable.create(listEl, {
    animation: 200,
    handle: '.drag-handle',
    ghostClass: 'sortable-ghost',
    chosenClass: 'sortable-chosen',
    dragClass: 'sortable-drag',
    filter: '.checked',
    onEnd: evt => {
      if (evt.oldIndex === evt.newIndex) return;
      const item = uncheckedItems.splice(evt.oldIndex, 1)[0];
      uncheckedItems.splice(evt.newIndex, 0, item);
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

renderList();