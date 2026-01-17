import {
    SET_USER,
    REMOVE_USER,
} from "./actionTypes";

export const setUser = (payload: any) => {
    return {
        type: SET_USER,
        payload,
    };
};

export const removeUser = () => {
    return {
       type: REMOVE_USER,
    };
};
