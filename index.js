#! /usr/bin/env node

const { exec } = require("child_process");
const core = require("@actions/core");
const stripAnsi = require("strip-ansi");

function executeCmd(command) {
	return new Promise((resolve, reject) => {
		exec(command, function(error, stdout) {
			error
				? reject(error)
				: resolve(stripAnsi(stdout).trim());
		});
	});
}

async function getDeploys() {
	const OUTPUT = await executeCmd("npx surge list");
	const LINES = stripAnsi(OUTPUT)
		.trim()
		.split("\n")
		.map(l => l.trim());
	const DEPLOYS = LINES.map(line => {
		deploy = line.split("  ").map(a => a.trim());
		const [id, domain] = deploy[0].split(" ");
		const [, timestamp, provider, host, plan] = deploy;
		return {
			id,
			domain,
			timestamp,
			provider,
			host,
			plan,
			line
		};
	});
	return DEPLOYS;
}

async function teardownProject(domain) {
	if([true, "true", 1, "1"].includes(core.getInput("dryrun"))){
		console.log(`DRYRUN: npx surge teardown ${domain}`)
	}else{
		return executeCmd(`npx surge teardown ${domain}`);
	}
}

async function teardown(REGEX) {
	const deploys = await getDeploys();
	const toTearDown = deploys.filter(deploy => deploy.line.match(REGEX));
	console.log(`search for projects that match ${REGEX}`);
	console.log(`found ${toTearDown.length} projects for teardown`);
	Promise.all(
		toTearDown.map(project => {
			console.log(
				"teardown",
				project.domain,
				`(last updated ${project.timestamp})`
			);
			teardownProject(project.domain)
				.then(() => {
					console.log("removed", project.domain);
				})
				.catch(console.error);
		})
	);
}

try {
	const REGEX = new RegExp(core.getInput("regex"), "i");
	teardown(REGEX);
} catch (error) {
	core.setFailed(error.message);
}
