import unzipper from "unzipper";
import fs from "fs";
import * as tar from "tar";
import path from "path";

interface ExtensionType {
	normal_ext: string,
	special_ext: string,
}

function file_extenstion(file_path: string): ExtensionType {
	const basename = path.basename(file_path);
	const parts = basename.split(".");

	if (parts.length < 2) {
		return { normal_ext: "", special_ext: "" };
	}

	const last = parts[parts.length - 1]?.toLowerCase();
	const second_last = parts[parts.length - 2]?.toLowerCase();

	if (last == "gz" && second_last == "tar") {
		return { normal_ext: ".tar", special_ext: ".gz" };
	}

	if (last == "zip") {
		return { normal_ext: ".zip", special_ext: "" };
	}

	return { normal_ext: "", special_ext: "" }
}

async function unzip_test(archive_path: string, extract_to: string): Promise<void> {
	const ext = file_extenstion(archive_path);

	if (!fs.existsSync(extract_to)) {
		fs.mkdirSync(extract_to, { recursive: true });
	}

	if (ext.normal_ext == ".zip") {
		return new Promise<void>((resolv, reject) => {
			fs.createReadStream(archive_path)
				.pipe(unzipper.Extract({ path: extract_to }))
				.on("close", resolv)
				.on("error", (err: Error) => {
					console.log(`Error when extract ${archive_path}: ${err.message}`);
					reject(new Error(`${err.message}`));
				});
		});
	}

	if (ext.normal_ext == ".tar" && ext.special_ext == ".gz") {
		return new Promise<void>((resolv, reject) => {
			fs.createReadStream(archive_path)
				.pipe(tar.extract({ cwd: extract_to }))
				.on("error", (err: Error) => {
					console.log(`Error when extract ${archive_path}: ${err.message}`);
					reject(new Error(`${err.message}`));
				})
				.on("finish", resolv)
		});
	}

	return Promise.reject(new Error(`File is not supported: ${archive_path}`));
}

(async () => {
	const file_name = "GoHook_linux.tar.gz";

	try {
		await unzip_test(`${file_name}`, ".").then(() => {
			console.log("Extract sucessfully.");
		});
	} catch (error) {
		console.log(`${error}`);
	}
})();