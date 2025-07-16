// Grocery List App Script
let groceryList = JSON.parse(localStorage.getItem('groceryList')) || [];
let knownStores = new Set();
let knownCategories = new Set();

const listEl = document.getElementById('grocery-list');
const form = document.getElementById('item-form');
const filterMode = document.getElementById('filter-mode');
const clearCheckedBtn = document.getElementById('clear-checked');
const downloadBtn = document.getElementById('download-list');
const uploadInput = document.getElementById('upload-list');

function saveList() {
  try {
    localStorage.setItem('groceryList', JSON.stringify(groceryList));
    updateSuggestions();
    renderList();
  } catch (e) {
    console.error("Error saving list:", e);
  }
}

form.addEventListener('submit', e => {
  e.preventDefault();
  try {
    const name = document.getElementById('item-name').value.trim();
    const quantity = document.getElementById('item-quantity').value.trim();
    const store = document.getElementById('item-store').value.trim();
    const category = document.getElementById('item-category').value.trim();
    if (!name || !quantity || !store || !category) return;
    groceryList.push({ name, quantity, store, category, checked: false });
    form.reset();
    saveList();
  } catch (e) {
    console.error("Error adding item:", e);
  }
});

function renderList() {
  try {
    listEl.innerHTML = '';

    let uncheckedItems = groceryList.filter(item => !item.checked);
    let checkedItems = groceryList.filter(item => item.checked);

    // Sort checked items by store then category
    checkedItems.sort((a, b) => {
      const storeDiff = a.store.localeCompare(b.store);
      return storeDiff !== 0 ? storeDiff : a.category.localeCompare(b.category);
    });

    const fullList = [...uncheckedItems, ...checkedItems];

    fullList.forEach((item, displayIndex) => {
      const li = document.createElement('li');
      li.className = item.checked ? 'checked' : '';
      li.dataset.index = groceryList.indexOf(item);

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = item.checked;
      checkbox.addEventListener('change', () => {
        item.checked = checkbox.checked;
        saveList();
      });

      const content = document.createElement('div');
      content.className = 'content';

      const nameInput = createEditableField(item.name, newVal => {
        item.name = newVal;
        saveList();
      });

      const qtyInput = createEditableField(item.quantity, newVal => {
        item.quantity = newVal;
        saveList();
      });

      const storeInput = createEditableField(item.store, newVal => {
        item.store = newVal;
        saveList();
      });

      const tags = document.createElement('div');
      tags.className = 'tags';
      tags.innerHTML = `
        Quantity: <span class="pill">${qtyInput.outerHTML}</span>
        Store: <span class="pill">${storeInput.outerHTML}</span>
        Category: <span class="pill">${item.category}</span>
      `;

      content.appendChild(nameInput);
      content.appendChild(tags);

      const delBtn = document.createElement('button');
      delBtn.className = 'delete-btn';
      delBtn.innerHTML = '<strong>X</strong>';
      delBtn.addEventListener('click', () => {
        groceryList.splice(groceryList.indexOf(item), 1);
        saveList();
      });

      const handle = document.createElement('span');
      handle.className = 'drag-handle';
      handle.innerHTML = '&#8942;&#8942;';

      const actions = document.createElement('div');
      actions.className = 'actions';
      if (!item.checked) actions.appendChild(handle);
      actions.appendChild(delBtn);

      li.appendChild(checkbox);
      li.appendChild(content);
      li.appendChild(actions);
      listEl.appendChild(li);
    });

    Sortable.create(listEl, {
      animation: 150,
      handle: '.drag-handle',
      filter: '.checked',
      draggable: 'li:not(.checked)',
      onEnd: evt => {
        const unchecked = groceryList.filter(item => !item.checked);
        const checked = groceryList.filter(item => item.checked);
        const [movedItem] = unchecked.splice(evt.oldIndex, 1);
        unchecked.splice(evt.newIndex, 0, movedItem);
        groceryList = [...unchecked, ...checked];
        saveList();
      }
    });
  } catch (e) {
    console.error("Error rendering list:", e);
  }
}

function updateSuggestions() {
  try {
    const storeDatalist = document.getElementById('store-suggestions');
    const categoryDatalist = document.getElementById('category-suggestions');

    storeDatalist.innerHTML = '';
    categoryDatalist.innerHTML = '';

    knownStores.clear();
    knownCategories.clear();

    groceryList.forEach(item => {
      knownStores.add(item.store);
      knownCategories.add(item.category);
    });

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
  } catch (e) {
    console.error("Error updating suggestions:", e);
  }
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

filterMode.addEventListener('change', renderList);

clearCheckedBtn.addEventListener('click', () => {
  try {
    groceryList.forEach(item => item.checked = false);
    saveList();
  } catch (e) {
    console.error("Error clearing checked:", e);
  }
});

downloadBtn.addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(groceryList)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'grocery_list_backup.json';
  a.click();
  URL.revokeObjectURL(url);
});

uploadInput.addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = event => {
    try {
      const parsed = JSON.parse(event.target.result);
      if (Array.isArray(parsed)) {
        groceryList = parsed;
        saveList();
      }
    } catch (err) {
      alert("Invalid file format");
    }
  };
  reader.readAsText(file);
});

updateSuggestions();
renderList();