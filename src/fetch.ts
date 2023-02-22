import axios, { AxiosRequestConfig } from "axios";
import * as fs from "fs";
import { promises } from "fs";
import * as path from "path";
import { IVerificationInput } from "./types";

const serverUrl: string = "https://sourcify.dev/server";
// const repositoryUrl: string = "https://repo.sourcify.dev";

async function getSourceFiles(address: string, chainId: number) {
  const config: AxiosRequestConfig = {
    method: "get",
    url: `${serverUrl}/files/any/${chainId}/${address}`,
  };

  // TODO: check that the contracts are on IPFS via localhost:5000 or localhost:5001, etc
  try {
    const response = await axios(config);
    return response.data;
  } catch (e) {
    throw new Error(
      `${e.message} ${e.response.data}... Please make sure your contracts in "custom" field of package.json are verified on Sourcify`
    );
  }
}

async function findFileInDirectory(
  baseDir: string,
  relativeDir: string,
  fileName: string
) {
  // find file in directory and return path relative to baseDir
  const files = await promises.readdir(baseDir);
  for (const file of files) {
    const filePath = path.join(baseDir, file);
    // console.log('filePath', filePath)
    if ((await promises.stat(path.join(baseDir, file))).isDirectory()) {
      const result = await findFileInDirectory(filePath, relativeDir, fileName);
      if (result) {
        return result;
      }
    } else if (file === fileName) {
      const fullPath = filePath;
      const relPath = path.relative(relativeDir, fullPath);
      return relPath;
    }
  }
  return null;
}

export const acceptedChainIds = [
  1, // Mainnet
  5, // Goerli
  11155111, // Sepolia
];

export function fetchContractAddressesFromPackageJson() {
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), "package.json"), "utf8")
  );
  // only add cut if acceptedChainIds contains cuts
  let cuts = [];
  for (const chainId of acceptedChainIds) {
    if (packageJson.custom?.[chainId]?.cuts) {
      cuts = cuts.concat(
        packageJson.custom?.[chainId]?.cuts.map((cut: any) => {
          return { address: cut.target, chainId: chainId };
        })
      );
    }
  }
  return cuts;
}

export async function fetchAndWrite(
  pathName: string,
  facets?: IVerificationInput[]
) {
  if (!facets) {
    facets = fetchContractAddressesFromPackageJson();
  }

  const generatedDir = path.join(process.cwd(), pathName);

  if (!fs.existsSync(generatedDir)) {
    fs.mkdirSync(generatedDir);
  }

  // fetch metadata for each facet
  for (const facet of facets) {
    const basePath = "/home/data/repository/contracts/full_match";

    // create `contracts` folder in `./generated` if it doesn't exist
    const sourcesDir = path.join(process.cwd(), pathName, "sources");
    if (!fs.existsSync(sourcesDir)) {
      fs.mkdirSync(sourcesDir);
    }

    //get files tree
    const res = await getSourceFiles(facet.address, facet.chainId);

    // write empty .sol files into `./generated/sources`
    for (const file of res.files) {
      if (file.name.endsWith(".sol")) {
        const filePath = path.join(
          sourcesDir,
          file.path.replace(
            `${basePath}/${facet.chainId}/${facet.address}/sources`,
            ""
          )
        );
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        if (!fs.existsSync(filePath)) {
          await promises.appendFile(filePath, "");
        }
      } else if (file.name === "metadata.json") {
        // write metadata to `./generated/metadata/`
        const metadata = JSON.parse(file.content);
        const contractName = Object.values(
          metadata.settings.compilationTarget
        )[0];
        const metadataDir = path.join(process.cwd(), pathName, "metadata");
        if (!fs.existsSync(metadataDir)) {
          fs.mkdirSync(metadataDir);
        }
        const metadataPath = path.join(metadataDir, `${contractName}.json`);
        if (!fs.existsSync(metadataPath)) {
          await promises.appendFile(
            metadataPath,
            JSON.stringify(metadata.output, null, 2)
          );
        }

        // write deployments to `./generated/deployments.json`
        if (!fs.existsSync(path.join(generatedDir, "deployments.json"))) {
          await promises.appendFile(
            path.join(generatedDir, "deployments.json"),
            "{}"
          );
        }
        const deployments = JSON.parse(
          fs.readFileSync(path.join(generatedDir, "deployments.json"), "utf8")
        );
        if (!deployments[facet.chainId]) {
          deployments[facet.chainId] = {};
        }
        deployments[facet.chainId][`${contractName}`] = {
          address: facet.address,
          abi: metadata.output.abi,
        };
        await promises.writeFile(
          path.join(generatedDir, "deployments.json"),
          JSON.stringify(deployments, null, 2)
        );
      }
    }

    // match imports with existing files in `./generated/sources`
    for (const file of res.files) {
      if (file.name.endsWith(".sol")) {
        const filePath = path.join(
          sourcesDir,
          file.path.replace(
            `${basePath}/${facet.chainId}/${facet.address}/sources`,
            ""
          )
        );
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }

        const imports = file.content.match(
          new RegExp(
            `import\\s+(?:\\{.*\\}\\s+from\\s+)?['"](.*)\\.(sol)['"];?`,
            "g"
          )
        );

        if (imports) {
          for (const imp of imports) {
            // get import file name
            const importFileName = imp
              .match(/['"](.*)\.sol['"]/)[1]
              .split("/")
              .pop();

            // find importFileName in sourcesDir
            let relativePath = await findFileInDirectory(
              sourcesDir,
              dir,
              `${importFileName}.sol`
            );
            !relativePath.startsWith(".")
              ? (relativePath = `./${relativePath}`)
              : null;
            file.content = file.content.replace(
              imp,
              imp.replace(/['"](.*)\.sol['"]/, `'${relativePath}'`)
            );
          }
        }

        //write file.content to filePath
        await promises.writeFile(filePath, file.content);
      }
    }
  }
}
