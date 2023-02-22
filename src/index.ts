#!/usr/bin/env node
import * as fs from "fs";
import { fetchAndWrite } from "./fetch";

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

async function main(contractsJSONPath?: string) {
  const contractsJson = fs.readFileSync(contractsJSONPath, "utf8") || null;
  const contracts = JSON.parse(contractsJson)?.contracts || null;

  const outputPath = process.env.SOURCIFY_HARDHAT_FETCH_OUTPUT_PATH;

  // facets: IVerificationInput[]
  try {
    await fetchAndWrite(outputPath, contracts || null);
  } catch (e) {
    console.error(e);
  }
}

var args = process.argv.slice(2);
main(args?.[0]);
