var ENTER_KEY = 13;
var ESCAPE_KEY = 27;


var util = {
	store: function (namespace, data) {
		if(arguments.length > 1) {
			return localStorage.setItem(namespace, JSON.stringify(data))
		}
		else {
			var store = localStorage.getItem(namespace);
			return (store && JSON.parse(store)) || [];
		}
	}
}

var model = {
	todos: util.store('todos-list'),
	addTodo: function(title) {
		this.todos.push({
			title: title,
			completed: false
		})
	},
	deleteTodo: function(position) {
		this.todos.splice(position, 1);
	},
	toggle: function(position) {
		var todo = 	this.todos[position];
		todo.completed = !todo.completed;
	},
	toggleAll: function() {
		var totalTodos = this.todos.length;
		var completedTodos = 0;

		for (var i = 0; i < totalTodos; i++) {
			if(this.todos[i].completed === true) {
				completedTodos++;
			}
		} 

		for (var i = 0; i < totalTodos; i++) {
			if(totalTodos === completedTodos) {
				this.todos[i].completed = false;
			}
			else {
				this.todos[i].completed = true;
			}
		}
	},
	changeTodo: function(position, newValue) {
		this.todos[position].title = newValue;
	}

}




var controller = {
	addTodo: function(e) {
		var input = e.target;
		var inputValue = input.value;
		var val = inputValue.trim();

		if(e.which !== ENTER_KEY || !val) {
			return;
		}

		model.addTodo(val);
		input.value = '';
		view.displayTodos();
	},
	deleteTodo: function(e) {
		model.deleteTodo(e);
		view.displayTodos();
	},
	toggle: function(e) {
		model.toggle(e);
		view.displayTodos();
	},
	toggleAll: function() {
		model.toggleAll();
		view.displayTodos();
	},
	editTodo: function(e) {
		var label = e;
		var liId = label.closest('li');
		liId.classList.add('editing');
		var edit = liId.children[1];
		edit.value = label.textContent;
		edit.focus();
	},
	editKeyup: function(e) {
		var edit = e.target;

		if(e.which === ENTER_KEY) {
			edit.blur();
		}
		if(e.which === ESCAPE_KEY) {
			edit.setAttribute("id", "esc");
			edit.blur();
		}
	},
	update: function(e) {
		var edit = e;
		var val = edit.value;
		var valTrim = val.trim(); 

		var li = edit.closest('li');
		var liId = li.id;

		if (edit.id === 'esc') {
			valTrim = model.todos[liId].title; 
		}
		else if (!valTrim) {
			this.deleteTodo(e);
			return;
		}

		else {
			model.changeTodo(liId, valTrim);
		}

		view.displayTodos();
	},
	destroyCompleted: function() {
		for (var i = model.todos.length - 1; i >= 0; i--) {
			if(model.todos[i].completed === true) {
				model.todos.splice(i, 1);
			}
		}
		view.displayTodos();
	},
	pluralize: function() {
		var todoCountText = document.querySelector('#todo-count strong');
		var totalTodos = model.todos.length;
		var completedTodos = 0;
		for (var i = 0; i < totalTodos; i++) {
			if(model.todos[i].completed === true) {
				completedTodos++;
			}
		}

		var activeTodos = totalTodos - completedTodos;
		if(activeTodos === 1) {
			todoCountText.innerHTML = activeTodos + ' item';
		}
		else {
			todoCountText.innerHTML = activeTodos + ' items';
		}

	},
	getActiveTodos: function () {
		return model.todos.filter(function (todo) {
			return !todo.completed;
		});
	},
	getCompletedTodos: function () {
		return model.todos.filter(function (todo) {
			return todo.completed;
		});
	},
	getFilteredTodos: function () {
		if (view.filter === 'active') {
			return this.getActiveTodos();
		}

		if (view.filter === 'completed') {
			return this.getCompletedTodos();
		}

		return model.todos;
	},
}







var view = {
	displayTodos: function() {
		var todosUl = document.getElementById('todo-list');
		todosUl.innerHTML = '';
		var newTodo = document.getElementById('new-todo');

	 	var todos = controller.getFilteredTodos();

		for (var i = 0; i < todos.length; i++) {
			var todoLi = document.createElement('li');
			todoLi.id = i;
			var todoLiView = document.createElement('div');
			todoLiView.id = i;
			todoLiView.className = 'view';
			var todoLiLabel = document.createElement('label');
			var toggleInput = document.createElement('input');
			toggleInput.type = 'checkbox';
			toggleInput.className = 'toggle';
			var deleteButton = document.createElement('button');
			deleteButton.className = 'destroy';
			var editInput = document.createElement('input');
			editInput.className = 'edit';

			var todoLiText = '';

			if(todos[i].completed === true) {
				todoLiText = todos[i].title;
				toggleInput.checked = true;
				todoLi.classList.add('completed');
			}
			else {
				todoLiText = todos[i].title;
				toggleInput.checked = false;
				todoLi.classList.remove('completed');
			}

			todoLiLabel.textContent = todoLiText;
			todoLiView.appendChild(toggleInput);
			todoLiView.appendChild(todoLiLabel);
			todoLiView.appendChild(deleteButton);
			todoLi.appendChild(todoLiView);
			todoLi.appendChild(editInput);
			todosUl.appendChild(todoLi);
		}

		this.toggleTodoList();
		controller.pluralize();
		newTodo.focus();
		util.store('todos-list', model.todos);
	},
	setUpEventListeners: function() {
		new Router({
			'/:filter': function (filter) {
				view.filter = filter;
				view.displayTodos();
			}
		}).init('/all');

		var newTodo = document.getElementById('new-todo');
		newTodo.addEventListener('keyup', controller.addTodo.bind(controller));

		var todosUl = document.getElementById('todo-list');
		todosUl.addEventListener('click', function(e) {
			var eventTarget  = e.target;
			if(eventTarget.className === 'destroy'){
				controller.deleteTodo(eventTarget.parentNode.id);
			}
			if(eventTarget.className === 'toggle') {
				controller.toggle(eventTarget.parentNode.id);
			}
			if(eventTarget.tagName === 'LABEL') {
				controller.editTodo(event.target);
			}
		});

		todosUl.addEventListener('keyup', function() {
			if(event.target.className === 'edit') {
				controller.editKeyup(event);
			}
		});

		todosUl.addEventListener('focusout', function() {
			if(event.target.className === 'edit') {
				controller.update(event.target);
			}
		});

		var toggleAllButton = document.getElementById('toggle-all');
		toggleAllButton.addEventListener('click', controller.toggleAll.bind(controller));

		var filters = document.getElementById('filters');
		filters.addEventListener('click', function() {
			if(event.target.nodeName === 'A') {
				if(event.target.parentNode.nodeName === 'LI') {
					var nodeLi = event.target.parentNode;

					for (var i = 0; i < nodeLi.parentNode.children.length; i++) {
						nodeLi.parentNode.children[i].classList.remove('selected');
					}
					nodeLi.classList.add('selected');
				}	
			}
		
		})
	},
	toggleTodoList: function() {
		var toggleAllButton = document.getElementById('toggle-all');
		var footerTemplate = document.getElementById('footer');
		var destroyCompletedButton = document.getElementById('clear-completed');
		var totalTodos = model.todos.length;
		var completedTodos = 0;

		if(totalTodos > 0) {
			toggleAllButton.classList.remove('hide');
			footerTemplate.classList.remove('hide');

			for (var i = 0; i < totalTodos; i++) {
				if(model.todos[i].completed === true) {
					completedTodos++;
				}
			}

			if(totalTodos === completedTodos) {
				toggleAllButton.checked = true;
			}
			else {
				toggleAllButton.checked = false;
			}

			if(completedTodos > 0) {
				destroyCompletedButton.classList.remove('hide');
			}	
			else {
				destroyCompletedButton.classList.add('hide');
			}
		}

		else {
			toggleAllButton.classList.add('hide');
			footerTemplate.classList.add('hide');
		}
	}
}


view.setUpEventListeners();