const { create: actualCreate, createStore } = jest.requireActual('zustand');
const { act } = require('react-dom/test-utils');

/**a variable to hold reset functions for all stores declared in the app */
const storeResetFns = new Set();

const create = (createState) => {
  const store = actualCreate(createState);

  /**
   * if createState is empty, store won't have a getState function
   * then we need to skip associating this value
   * This happens whenever we use the following syntax
   * create()(...) to help TS auto completion
   */
  if (typeof store.getState === 'function') {
    /** when creating a store, we get its initial state, create a reset function and add it in the set */
    const initialState = store.getState();
    storeResetFns.add(() => store.setState(initialState, true));
  }

  return store;
};

/** Reset all stores after each test run */
beforeEach(() => {
  act(() => storeResetFns.forEach((resetFn) => resetFn()));
});

/** exporting the newly mocked create function */
exports.create = create;
/** exporting createStore since it's used by zundo */
exports.createStore = createStore;
