let groceryList = JSON.parse(localStorage.getItem('groceryList')) || [];

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
const clearCheckedBtn = document.getElementById('clear-checked');
const downloadBtn = document.getElementById('download-list');
const uploadInput = document.getElementById('upload-list');
const uncheckedList = document.getElementById('unchecked-list');
const checkedList = document.getElementById('checked-list');

function generateId() {
  return '_' + Math.random().toString(36).substr(2, 9);
}

function saveList() {
  localStorage.setItem('groceryList', JSON.stringify(groceryList));
  renderList();
}

function sortItems(list) {
  return list.sort((a, b) =>
    a.store.localeCompare(b.store) ||
    a.category.localeCompare(b.category) ||
    a.name.localeCompare(b.name)
  );
}

function renderList() {
  uncheckedList.innerHTML = '';
  checkedList.innerHTML = '';

  const unchecked = sortItems(groceryList.filter(item => !item.checked));
  const checked = sortItems(groceryList.filter(item => item.checked));

  const render = (target, items) => {
    for (const item of items) {
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

      const actions = document.createElement('div');
      actions.className = 'actions';

      if (!item.checked) {
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '<strong>X</strong>';
        deleteBtn.addEventListener('click', () => {
          groceryList = groceryList.filter(i => i.id !== item.id);
          saveList();
        });
        actions.appendChild(deleteBtn);
      }

      li.appendChild(checkbox);
      li.appendChild(content);
      li.appendChild(actions);
      target.appendChild(li);
    }
  };

  render(uncheckedList, unchecked);
  render(checkedList, checked);
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
        groceryList = data.map(item => ({ ...item, id: item.id || generateId() }));
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