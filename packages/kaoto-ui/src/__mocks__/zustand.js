const { create: actualCreate, createStore } = jest.requireActual('zustand');
const { act } = require('react-dom/test-utils');
const cloneDeep = require('lodash.clonedeep');

/**a variable to hold reset functions for all stores declared in the app */
const storeResetFns = new Set();

const create = (createState) => {
  /**
   * If createState is empty, store won't have a getState function
   * and it will be the real createImpl function.
   *
   * In this situation, we need to make sure to return the function
   * itself to be able to intercept the original createState function
   * and be able to reset the store after each test.
   *
   * This happens whenever we use the following syntax
   * create()(...) to help TS auto completion
   */
  if (createState === undefined) {
    return create;
  }

  const store = actualCreate(createState);

  if (typeof store.getState === 'function') {
    /** when creating a store, we get its initial state, create a reset function and add it in the set */
    const initialState = store.getState();
    storeResetFns.add(() => store.setState(cloneDeep(initialState), true));
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
