#! /usr/bin/env node

const core = require("@actions/core");
const { exec } = require("child_process");
const stripAnsi = require("strip-ansi");

function executeCmd(command) {
	return new Promise((resolve, reject) => {
		exec(command, function(error, stdout) {
			error
				? reject(stripAnsi(error).trim())
				: resolve(stripAnsi(stdout).trim());
		});
	});
}

async function getDeploys() {
	const OUTPUT = await executeCmd("surge list");
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
	return executeCmd(`surge teardown ${domain}`);
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
