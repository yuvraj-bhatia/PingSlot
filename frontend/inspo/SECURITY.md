# Security Notes

## Dependency advisory: `xlsx`
- `npm audit` reports a high-severity advisory for `xlsx`.
- Current usage is for exporting trusted, server-generated data only.
- Do not parse untrusted user uploads with `xlsx` in this repo.
- If future requirements include untrusted file parsing, replace `xlsx` with a safer alternative or add strict validation/sandboxing.
