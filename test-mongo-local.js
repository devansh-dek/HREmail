const fs = require("fs");
const path = require("path");
const { MongoClient } = require("mongodb");

function loadEnvFile(envPath) {
	if (!fs.existsSync(envPath)) {
		return;
	}

	const contents = fs.readFileSync(envPath, "utf8");
	for (const line of contents.split(/\r?\n/)) {
		const trimmed = line.trim();
		if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) {
			continue;
		}

		const equalsIndex = trimmed.indexOf("=");
		const key = trimmed.slice(0, equalsIndex).trim();
		const value = trimmed.slice(equalsIndex + 1).trim();

		if (key && process.env[key] === undefined) {
			process.env[key] = value;
		}
	}
}

function maskMongoUri(uri) {
	try {
		const parsed = new URL(uri);
		if (parsed.username) {
			parsed.username = `${parsed.username.slice(0, 3)}***`;
		}
		if (parsed.password) {
			parsed.password = "***";
		}
		return parsed.toString();
	} catch {
		return uri.replace(/:\/\/(.*?):(.*?)@/, "://***:***@");
	}
}

async function main() {
	const envPath = path.join(__dirname, ".env");
	loadEnvFile(envPath);

	const mongoUri = process.env.MONGODB_STRING;
	const mongoDbName = process.env.MONGODB_DB || "hremail";

	if (!mongoUri) {
		console.error("MONGODB_STRING is missing. Add it to .env before running this script.");
		process.exitCode = 1;
		return;
	}

	const client = new MongoClient(mongoUri, {
		serverSelectionTimeoutMS: 10000,
	});

	console.log("Connecting to MongoDB...");
	console.log("URI:", maskMongoUri(mongoUri));

	try {
		await client.connect();
		await client.db(mongoDbName).command({ ping: 1 });

		const adminDb = client.db(mongoDbName).admin();
		const serverInfo = await adminDb.serverStatus();
		const buildInfo = await adminDb.command({ buildInfo: 1 });

		console.log("Connection successful.");
		console.log("Database:", mongoDbName);
		console.log("MongoDB version:", buildInfo.version);
		console.log("Host:", serverInfo.host);
		console.log("Uptime (seconds):", serverInfo.uptime);
	} catch (error) {
		console.error("MongoDB connection failed:");
		console.error(error && error.message ? error.message : error);
		process.exitCode = 1;
	} finally {
		await client.close().catch(() => {});
	}
}

main().catch((error) => {
	console.error("Unexpected script failure:", error);
	process.exitCode = 1;
});
