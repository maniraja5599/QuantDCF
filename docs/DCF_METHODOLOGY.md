# DCF Valuation Methodology & Mathematical Proofs

## 1. Free Cash Flow to Firm (FCFF) Formula

For forecast year $t \in [1, N]$:

$$
\text{Revenue}_t = \text{Revenue}_{t-1} \times (1 + \text{Revenue Growth}_t)
$$

$$
\text{EBIT}_t = \text{Revenue}_t \times \text{EBIT Margin}_t
$$

$$
\text{Operating Taxes}_t = \max(0, \text{EBIT}_t) \times \text{Effective Tax Rate}_t
$$

$$
\text{NOPAT}_t = \text{EBIT}_t - \text{Operating Taxes}_t
$$

$$
\text{FCFF}_t = \text{NOPAT}_t + \text{D\&A}_t - \text{CapEx}_t - \Delta \text{NWC}_t
$$

Where:
- $\text{D\&A}_t$: Depreciation and Amortization expense.
- $\text{CapEx}_t$: Capital Expenditure reinvestment.
- $\Delta \text{NWC}_t$: Incremental Change in Non-Cash Net Working Capital.

---

## 2. Weighted Average Cost of Capital (WACC)

### Cost of Equity ($K_e$) via Capital Asset Pricing Model (CAPM)

$$
K_e = R_f + \beta \times \text{ERP}
$$

Where:
- $R_f$: Indian 10-Year Government Securities (G-Sec) Benchmark Yield (default **7.10%**).
- $\text{ERP}$: Historical Equity Risk Premium for Indian Equities (default **6.50%**).
- $\beta$: Levered Beta reflecting the systematic covariance with the Nifty 50 / Sensex.

### After-Tax Cost of Debt ($K_d$)

$$
K_{d,\text{after-tax}} = K_{d,\text{pre-tax}} \times (1 - \text{Effective Tax Rate})
$$

### Capital Structure Weighting

$$
\text{WACC} = \left( W_e \times K_e \right) + \left( W_d \times K_{d,\text{after-tax}} \right)
$$

Constraint: $W_e + W_d = 100\%$.

---

## 3. Discounting & Present Value

For Year $t$:

$$
\text{Discount Factor}_t = \frac{1}{(1 + \text{WACC})^t}
$$

$$
\text{PV}(\text{FCFF}_t) = \text{FCFF}_t \times \text{Discount Factor}_t
$$

---

## 4. Perpetual Terminal Value (Gordon Growth Model)

$$
\text{Terminal Value} = \frac{\text{FCFF}_N \times (1 + g)}{\text{WACC} - g}
$$

$$
\text{PV}(\text{Terminal Value}) = \frac{\text{Terminal Value}}{(1 + \text{WACC})^N}
$$

### Mathematical Validation:
- $\text{WACC} > g$ is strictly required. If $\text{WACC} \le g$, the denominator becomes $\le 0$, resulting in an undefined or mathematically absurd negative/infinite valuation.
- $g$ is capped at realistic long-term nominal Indian GDP growth (**4.5% - 6.0%**).

---

## 5. Enterprise Value to Equity Value Bridge

$$
\text{Enterprise Value} = \sum_{t=1}^N \text{PV}(\text{FCFF}_t) + \text{PV}(\text{Terminal Value})
$$

$$
\text{Equity Value} = \text{Enterprise Value} + \text{Cash} - \text{Total Debt} - \text{Minority Interest} - \text{Other Senior Claims}
$$

$$
\text{Intrinsic Value per Diluted Share} = \frac{\text{Equity Value}}{\text{Diluted Shares Outstanding}}
$$

---

## 6. Regulatory Disclaimer

This DCF valuation model is an analytical decision-support framework intended strictly for educational, research, and financial analysis purposes. Intrinsic value outputs do not constitute investment advice, solicitations, or target prices.
