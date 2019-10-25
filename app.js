const StorageCtrl = (function() {
	return {
		storeItem: function(item) {
			let items;
			if (localStorage.getItem('items') === null) {
				items = [];
				items.push(item);
				localStorage.setItem('items', JSON.stringify(items));
			} else {
				items = JSON.parse(localStorage.getItem('items'));
				items.push(item);
				localStorage.setItem('items', JSON.stringify(items));
			}
		},
		updateItemStorage: function(updatedItem) {
			let items = StorageCtrl.getItemsFromStorage();
			items.forEach((item, i) => {
				if (updatedItem.id === item.id) {
					items.splice(i, 1, updatedItem);
				}
			});
			localStorage.setItem('items', JSON.stringify(items));
		},
		deleteItemFromStorage: function(id) {
			let items = StorageCtrl.getItemsFromStorage();
			items.forEach((item, i) => {
				if (id === item.id) {
					items.splice(i, 1);
				}
			});
			localStorage.setItem('items', JSON.stringify(items));
		},
		clearItemsFromStorage: function() {
			localStorage.clear();
		},
		getItemsFromStorage: function() {
			let items;
			if (localStorage.getItem('items') === null) {
				items = [];
			} else {
				items = JSON.parse(localStorage.getItem('items'));
			}
			return items;
		}
	};
})();

const ItemCtrl = (function() {
	const Item = function(id, name, calories) {
		this.id = id;
		this.name = name;
		this.calories = calories;
	};

	const state = {
		items: StorageCtrl.getItemsFromStorage(),
		currentItem: null,
		totalCalories: 0
	};

	return {
		getState: function() {
			return state.items;
		},
		addItem: function(name, calories) {
			let ID;
			if (state.items.length > 0) {
				ID = state.items[state.items.length - 1].id + 1;
			} else {
				ID = 0;
			}
			calories = parseInt(calories);
			const newItem = new Item(ID, name, calories);
			state.items.push(newItem);
			return newItem;
		},
		getItemById: function(id) {
			return state.items.filter((item) => item.id === id)[0];
		},
		updateItem: function(name, calories) {
			calories = Number(calories);
			const found = state.items.filter((item) => item.id === state.currentItem.id)[0];
			found.name = name;
			found.calories = calories;
			return found;
		},
		deleteItem: function(id) {
			const ids = state.items.map((item) => item.id);
			const index = ids.indexOf(id);
			state.items.splice(index, 1);
		},
		clearAllItems: function() {
			state.items = [];
		},
		setCurrentItem: function(item) {
			state.currentItem = item;
		},
		getCurrentItem: function() {
			return state.currentItem;
		},
		getTotalCalories: function() {
			const total = state.items.reduce((acc, item) => acc + item.calories, 0);
			state.totalCalories = total;
			return total;
		},
		logData: function() {
			return state;
		}
	};
})();

const UICtrl = (function() {
	const UISelectors = {
		itemList: '#item-list',
		addBtn: '.add-btn',
		updateBtn: '.update-btn',
		deleteBtn: '.delete-btn',
		backBtn: '.back-btn',
		clearBtn: '.clear-btn',
		itemNameInput: '#item-name',
		itemCaloriesInput: '#item-calories',
		itemForm: '#item-form',
		totalCalories: '.total-calories',
		listItems: '#item-list li'
	};
	return {
		populateItemList: function(items) {
			let html = '';
			items.forEach(function(item) {
				html += `
        <li class="collection-item" id="item-${item.id}"><strong>${item.name}: </strong><em>${item.calories} calories</em>
      <a href="#" class="secondary-content"><i class="edit-item fa fa-pencil"></i></a></li>
        `;
			});
			document.querySelector(UISelectors.itemList).innerHTML = html;
		},
		getItemInput: function() {
			return {
				name: document.querySelector(UISelectors.itemNameInput).value,
				calories: document.querySelector(UISelectors.itemCaloriesInput).value
			};
		},
		addListItem: function(item) {
			const li = document.createElement('li');
			li.className = 'collection-item';
			li.id = `item-${item.id}`;
			li.innerHTML = `
				<strong>${item.name}: </strong><em>${item.calories} calories</em>
      <a href="#" class="secondary-content"><i class="edit-item fa fa-pencil"></i></a>
			`;
			document.querySelector(UISelectors.itemList).insertAdjacentElement('beforeend', li);
		},
		updateListItem: function(item) {
			let listItems = document.querySelectorAll(UISelectors.listItems);
			listItems = [ ...listItems ];
			listItems.forEach((listItem) => {
				itemId = listItem.getAttribute('id');
				if (itemId === `item-${item.id}`) {
					document.querySelector(
						`#${itemId}`
					).innerHTML = `<strong>${item.name}: </strong><em>${item.calories} calories</em>
      <a href="#" class="secondary-content"><i class="edit-item fa fa-pencil"></i></a>`;
				}
			});
		},
		deleteListItem: function(id) {
			const itemId = `#item-${id}`;
			document.querySelector(itemId).remove();
		},
		removeItems: function() {
			document.querySelector(UISelectors.itemList).innerHTML = '';
		},
		showTotalCalores: function(totalCalories) {
			document.querySelector(UISelectors.totalCalories).textContent = totalCalories;
		},
		clearInput: function() {
			document.querySelector(UISelectors.itemNameInput).value = '';
			document.querySelector(UISelectors.itemCaloriesInput).value = '';
		},
		addItemToForm: function() {
			document.querySelector(UISelectors.itemNameInput).value = ItemCtrl.getCurrentItem().name;
			document.querySelector(UISelectors.itemCaloriesInput).value = ItemCtrl.getCurrentItem().calories;
			UICtrl.showEditState();
		},
		clearEditState: function() {
			UICtrl.clearInput();
			document.querySelector(UISelectors.addBtn).style.display = 'inline';
			document.querySelector(UISelectors.updateBtn).style.display = 'none';
			document.querySelector(UISelectors.deleteBtn).style.display = 'none';
			document.querySelector(UISelectors.backBtn).style.display = 'none';
		},
		showEditState: function() {
			document.querySelector(UISelectors.addBtn).style.display = 'none';
			document.querySelector(UISelectors.updateBtn).style.display = 'inline';
			document.querySelector(UISelectors.deleteBtn).style.display = 'inline';
			document.querySelector(UISelectors.backBtn).style.display = 'inline';
		},
		getSelectors: function() {
			return UISelectors;
		}
	};
})();

const App = (function(ItemCtrl, UICtrl, StorageCtrl) {
	const loadEventListeners = function() {
		const UISelectors = UICtrl.getSelectors();
		document.querySelector(UISelectors.addBtn).addEventListener('click', itemAddSubmit);
		document.addEventListener('keydown', function(event) {
			if (event.keyCode === 13 || event.which === 13) {
				event.preventDefault();
				return false;
			}
		});
		document.querySelector(UISelectors.itemList).addEventListener('click', itemEditClick);
		document.querySelector(UISelectors.updateBtn).addEventListener('click', itemUpdateSumbit);
		document.querySelector(UISelectors.backBtn).addEventListener('click', UICtrl.clearEditState);
		document.querySelector(UISelectors.deleteBtn).addEventListener('click', itemDeleteSubmit);
		document.querySelector(UISelectors.clearBtn).addEventListener('click', clearAllItemsClick);
	};
	const itemAddSubmit = function(event) {
		const input = UICtrl.getItemInput();
		if (input.name !== '' && input.calories !== '') {
			const newItem = ItemCtrl.addItem(input.name, input.calories);
			UICtrl.addListItem(newItem);
			const totalCalories = ItemCtrl.getTotalCalories();
			UICtrl.showTotalCalores(totalCalories);
			StorageCtrl.storeItem(newItem);
			UICtrl.clearInput();
		}
		event.preventDefault();
	};
	const itemEditClick = function(event) {
		if (event.target.classList.contains('edit-item')) {
			const listId = event.target.parentNode.parentNode.id;
			const listIdArr = listId.split('-');
			const id = Number(listIdArr[1]);
			const itemToEdit = ItemCtrl.getItemById(id);
			ItemCtrl.setCurrentItem(itemToEdit);
			UICtrl.addItemToForm();
		}
		event.preventDefault();
	};
	const itemUpdateSumbit = function(event) {
		const input = UICtrl.getItemInput();
		const updatedItem = ItemCtrl.updateItem(input.name, input.calories);
		UICtrl.updateListItem(updatedItem);
		const totalCalories = ItemCtrl.getTotalCalories();
		UICtrl.showTotalCalores(totalCalories);
		StorageCtrl.updateItemStorage(updatedItem);
		UICtrl.clearEditState();
		event.preventDefault();
	};
	const itemDeleteSubmit = function(event) {
		const currentItem = ItemCtrl.getCurrentItem();
		ItemCtrl.deleteItem(currentItem.id);
		UICtrl.deleteListItem(currentItem.id);
		const totalCalories = ItemCtrl.getTotalCalories();
		UICtrl.showTotalCalores(totalCalories);
		StorageCtrl.deleteItemFromStorage(currentItem.id);
		UICtrl.clearEditState();
		event.preventDefault();
	};
	const clearAllItemsClick = function(event) {
		ItemCtrl.clearAllItems();
		UICtrl.removeItems();
		const totalCalories = ItemCtrl.getTotalCalories();
		UICtrl.showTotalCalores(totalCalories);
		StorageCtrl.clearItemsFromStorage();
		UICtrl.clearEditState();
		event.preventDefault();
	};
	return {
		init: function() {
			UICtrl.clearEditState();
			const items = ItemCtrl.getState();
			UICtrl.populateItemList(items);
			const totalCalories = ItemCtrl.getTotalCalories();
			UICtrl.showTotalCalores(totalCalories);
			loadEventListeners();
		}
	};
})(ItemCtrl, UICtrl, StorageCtrl);

App.init();
