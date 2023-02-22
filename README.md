# Fetch hardhat-compilable contracts directly from sourcify

#### USAGE:

```bash
SOURCIFY_HARDHAT_FETCH_OUTPUT_PATH=./gen SOURCIFY_HARDHAT_FETCH_CONTRACTS_JSON_INPUT_PATH=./test-contracts.json yarn fetch-sourcify
```

... or ...

place the following in your .env file:

```env
SOURCIFY_HARDHAT_FETCH_OUTPUT_PATH=./gen
SOURCIFY_HARDHAT_FETCH_CONTRACTS_JSON_INPUT_PATH=<your input file>
```

... and run ...

```
yarn fetch-sourcify
```

#### HELPFUL TIPS:

> Be sure the input json file is an array of contracts, structured exactly like so. Capitalization is important.

```json
{
  "contracts": [
    {
      "address": "0x70b0468e5276CE0149Ab86975B14148Aa1DCe2a7",
      "chainId": 11155111
    }
  ]
}
```
