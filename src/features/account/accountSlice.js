import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Account initial state
const initialState = {
    balance: 0,
    loan: 0,
    loanPurpose: "",
    isLoading: false,
};

// Define the async thunk using createAsyncThunk
export const depositAsync = createAsyncThunk(
    "account/deposit",
    async (params, { dispatch, getState }) => {
        const { amount, currency } = params;

        if (currency === "USD") {
            return amount;
        }

        const res = await fetch(
            `https://api.frankfurter.dev/v1/latest?base=${currency}&symbols=USD`
        );

        const data = await res.json();
        const convertedAmount = data.rates.USD;

        return convertedAmount;
    }
);

const accountSlice = createSlice({
    name: "account",
    initialState,
    reducers: {
        deposit(state, action) {
            state.balance += action.payload;
            state.isLoading = false
        },
        withdraw(state, action) {
            state.balance -= action.payload;
        },
        requestLoan: {
            prepare(amount, purpose) {
                return {
                    payload: { amount, purpose },
                };
            },
            reducer(state, action) {
                if (state.loan > 0) return;
                state.loan = action.payload.amount;
                state.loanPurpose = action.payload.purpose;
                state.balance += action.payload.amount;
            },
        },
        payLoan(state) {
            state.balance -= state.loan;
            state.loan = 0;
            state.loanPurpose = "";
        },
        convertCurrency(state) {
            state.isLoading = true;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(depositAsync.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(depositAsync.fulfilled, (state, action) => {
                state.balance += action.payload;
                state.isLoading = false;
                console.log("fulfilled");
            })
            .addCase(depositAsync.rejected, (state) => {
                state.isLoading = false;
                console.log("rejected");
            });
    },
});

export const { deposit, withdraw, requestLoan, payLoan, convertCurrency } =
    accountSlice.actions;

export default accountSlice.reducer;