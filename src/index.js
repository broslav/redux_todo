import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import './App.css';
// import App from './App';


const createStore = (reducer) => {

    let state;
    let listeners = [];

    const getState = () => state;

    const dispatch = (action) => {
        state = reducer(state, action);
        listeners.map(listener => listener());
    };

    const subscribe = (listener) => {

        listeners.push(listener);
        return () => {
            listeners = listeners.filter(l => l !== listener);
        }
    };

    dispatch({});

    return {
        getState,
        subscribe,
        dispatch
    }
};


const toggleTodo = (todo) => {
    return {
        ...todo,
        completed: !todo.completed
    }
};

const todo = (state = {}, action) => {
    switch (action.type) {

        case 'ADD_TODO':
            return {
                id: action.id,
                text: action.text,
                completed: false
            };

        case 'TOGGLE_TODO':
            if (state.id !== action.id) {
                return state;
            }
            return {
                ...state,
                completed: !state.completed
            };

        default:
            return state;
    }
};

const todos = (state = [], action) => {
    switch (action.type) {

        case 'ADD_TODO':
            return [
                ...state,
                todo(undefined, action)
            ];
        case 'TOGGLE_TODO':
            return state.map(t => todo(t, action));
        default:
            return state;
    }
};


const visibilityFilter = (state = 'SHOW_ALL', action) => {
    switch (action.type) {
        case 'SET_VISIBILITY_FILTER':
            return action.filter;

        default:
            return state;
    }
};


const combineReducers = (reducers) => {
    return (state = {}, action) => {
        return Object.keys(reducers).reduce((nextState, key) => {
            nextState[key] = reducers[key](state[key], action);
            return nextState;
        }, {})
    }
};

const getVisibleTodos = (todos, filter) => {
    switch (filter) {
        case 'SHOW_COMPLETED':
            return todos.filter(todo => (
                todo.completed
            ));
        case 'SHOW_ACTIVE':
            return todos.filter(todo => (
                !todo.completed
            ));
        default:
            return todos;
    }
};

const todoApp = combineReducers({
    todos,
    visibilityFilter
});


const store = createStore(todoApp);

class AddTodo extends React.Component {
    constructor() {
        super();
        this.state = {title: ""};
        this.nextTodoId = 0;
    }

    handleClick = (e, text, id) => {
        e.preventDefault();
        store.dispatch({
            type: 'ADD_TODO',
            text,
            id
        });
        this.setState({title: ""});
    };

    computeNextTodoId = () => {
        // debugger;
        return this.nextTodoId = this.nextTodoId + 1;
    };

    render() {
        return (
            <div>
                <form onSubmit={(e) => this.handleClick(e, this.state.title, this.computeNextTodoId())}>
                    <input type="text" onChange={(e) => this.setState({title: e.target.value})}
                           placeholder="Type todo title" value={this.state.title}/>
                    <button type="submit">Add task</button>
                </form>
            </div>
        )
    }
};

const TodoItem = ({text, id, todoItemClickHandler, completed}) => {
    return (
        <li className={completed ? 'todo--completed' : 'todo'} onClick={todoItemClickHandler}>
            <span>#{id}</span>
            <span> {text}</span>
        </li>
    )
};

const TodosList = ({todos}) => {
    return (
        <div>
            <ul>
                {todos.map((todo, index) => {
                    return (
                        <TodoItem key={index}
                                  id={todo.id}
                                  text={todo.text}
                                  completed={todo.completed}
                                  todoItemClickHandler={() => store.dispatch({type: 'TOGGLE_TODO', id: todo.id})}/>
                    )
                })}
            </ul>
        </div>
    )
};


const FilterLink = ({filter, children}) => {
    return (
        <a href="#" onClick={(e) => {
            e.preventDefault();
            store.dispatch({type: 'SET_VISIBILITY_FILTER', filter});
        }}>{children}</a>
    );
};


const TodoApp = () => {

    const visibleTodos = getVisibleTodos(store.getState().todos, store.getState().visibilityFilter);

    return (
        <div>
            <AddTodo/>
            <FilterLink filter={'SHOW_ALL'}>All</FilterLink>
            {' '}
            <FilterLink filter={'SHOW_COMPLETED'}>Completed</FilterLink>
            {' '}
            <FilterLink filter={'SHOW_ACTIVE'}>Active</FilterLink>
            <TodosList todos={visibleTodos}/>
        </div>
    )
};


const render = () => {
    // console.log(store.getState());
    ReactDOM.render(<TodoApp/>, document.getElementById('root'));
};

const unsubscribe = store.subscribe(render);

render();



