#!/usr/bin/env node
import * as fs from "fs";
import { fetchAndWrite } from "./fetch";
import { IVerificationInput } from "./types";

const usage = () => {
  console.log(`
  Usage:

  usedapp-generate-hooks ./dist/<build file>
  `);
};

if (!process.env.SOURCIFY_HARDHAT_FETCH_OUTPUT_PATH) {
  usage();
  process.exit(-1);
}

async function main() {
  let contracts: IVerificationInput[] = null;
  const contractsJSONPath =
    process.env.SOURCIFY_HARDHAT_FETCH_CONTRACTS_JSON_INPUT_PATH || "";
  if (contractsJSONPath !== "") {
    const contractsJson = fs.readFileSync(contractsJSONPath, "utf8");
    contracts = JSON.parse(contractsJson)?.contracts;
  }

  const outputPath = process.env.SOURCIFY_HARDHAT_FETCH_OUTPUT_PATH;

  // facets: IVerificationInput[]
  try {
    await fetchAndWrite(outputPath, contracts);
  } catch (e) {
    console.error(e);
  }
}

main();
