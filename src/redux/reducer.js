import { combineReducers } from "redux";

const face = {
  list: []
};

const faceReducer = (state = face, action) => {
  switch (action.type) {
    case "Submit Face":
      state = {
        ...state,
        list: action.value,
      };
      break;

    default:
      break;
  }
  return state;
};

export default combineReducers({
  faceReducer,
});
