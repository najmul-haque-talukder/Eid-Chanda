import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "@supabase/supabase-js";

interface AuthState {
    user: User | null;
    profile: any | null;
    loading: boolean;
}

const initialState: AuthState = {
    user: null,
    profile: null,
    loading: true,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<User | null>) => {
            state.user = action.payload;
            state.loading = false;
        },
        setProfile: (state, action: PayloadAction<any | null>) => {
            state.profile = action.payload;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
    },
});

export const { setUser, setProfile, setLoading } = authSlice.actions;
export default authSlice.reducer;
