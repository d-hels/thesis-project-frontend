import React, {
    createContext,
    useContext,
    useReducer,
    useEffect
} from "react";
import { SET_USER, REMOVE_USER } from "./actionTypes";
import type { ReactNode, Dispatch } from "react";

interface User {
    id?: string;
    name?: string;
    surname?: string;
    email?: string;
    role?: string;
    phone?: string;
    address?: string;
    token?: string;
    timestamp?: number;
}

interface State {
    user: User | null;
}

interface Action {
    type: string;
    payload?: User;
}

//hours when the auth will end
const TWELVE_HOURS = 12 * 60 * 60 * 1000;

const getUserFromLocalStorage = (): User | null => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.timestamp && Date.now() - user.timestamp < TWELVE_HOURS) {
        return user;
    }
    localStorage.removeItem("user");
    localStorage.removeItem("avatarColor");
    return null;
};

const initialState: State = {
    user: getUserFromLocalStorage(),
};

const AuthContext = createContext<{ state: State; dispatch: Dispatch<Action> }>(
    {
        state: initialState,
        dispatch: () => null,
    }
);

const reducer = (state: State, action: Action): State => {
    switch (action.type) {
        case SET_USER:
            if (action.payload) {
                const userWithTimestamp = {
                    ...action.payload,
                    timestamp: new Date().getTime(),
                };
                localStorage.setItem("user", JSON.stringify(userWithTimestamp));
                return {
                    ...state,
                    user: userWithTimestamp,
                };
            }
            return state;
        case REMOVE_USER:
            localStorage.removeItem("user");
            return {
                ...state,
                user: null,
            };
        default:
            return state;
    }
};

interface StoreProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<StoreProviderProps> = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, initialState);

    useEffect(() => {
        const interval = setInterval(() => {
            if (state.user && state.user.timestamp) {
                if (Date.now() - state.user.timestamp >= TWELVE_HOURS) {
                    dispatch({ type: REMOVE_USER });
                }
            }
        }, 10000);

        return () => clearInterval(interval);
    }, [state.user]);

    return (
        <AuthContext.Provider value={{ state, dispatch }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
