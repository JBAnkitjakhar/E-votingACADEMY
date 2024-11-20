// scripts/deploy.ts
import { ethers } from "hardhat";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { CANDIDATES } from "../src/constants";

async function main() {
    execSync("npx hardhat compile", { stdio: "inherit" });

    const VOTING_DURATION_MINUTES = 10;

    // Prepare candidate data arrays for constructor
    const candidateIds = CANDIDATES.map(c => c.id);
    const names = CANDIDATES.map(c => c.name);
    const positions = CANDIDATES.map(c => c.position);
    const departments = CANDIDATES.map(c => c.department);
    const years = CANDIDATES.map(c => c.year);

    const eVoting = await ethers.deployContract( "EVoting", [
        VOTING_DURATION_MINUTES,
        candidateIds,
        names,
        positions,
        departments,
        years
    ]);

    await eVoting.waitForDeployment();

    const contractAddress = await eVoting.getAddress();

    const artifactPath = path.join(__dirname, "../artifacts/contracts/EVoting.sol/EVoting.json");
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

    const constantsPath = path.join(__dirname, "../src/constants/index.ts");
    const constantsContent = fs.readFileSync(constantsPath, "utf8");

    let updatedConstants = constantsContent.replace(
        /export const VOTING_CONTRACT_ADDRESS = ".*";/,
        `export const VOTING_CONTRACT_ADDRESS = "${contractAddress}";`
    );

    const abiMatch = updatedConstants.match(/export const VOTING_CONTRACT_ABI = \[[\s\S]*?\];/);
    if (abiMatch) {
        updatedConstants = updatedConstants.replace(
            abiMatch[0],
            `export const VOTING_CONTRACT_ABI = ${JSON.stringify(artifact.abi, null, 2)};`
        );
    } else {
        updatedConstants = updatedConstants.replace(
            /export const VOTING_CONTRACT_ABI = \[\];/,
            `export const VOTING_CONTRACT_ABI = ${JSON.stringify(artifact.abi, null, 2)};`
        );
    }

    fs.writeFileSync(constantsPath, updatedConstants);
}
console.log("successfully deploy")
main().catch((error) => {
    console.error(error);
    process.exit(1);
});