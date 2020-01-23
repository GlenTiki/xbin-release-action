const core = require('@actions/core');
const { GitHub } = require('@actions/github');

const path = require('path');
const fs = require('fs');
const fsPromises = fs.promises;

async function run() {
  try {
    // Get authenticated GitHub client (Ocktokit): https://github.com/actions/toolkit/tree/master/packages/github#usage
    const github = new GitHub(process.env.GITHUB_TOKEN);

    // Get the inputs from the workflow file: https://github.com/actions/toolkit/tree/master/packages/core#inputsoutputs
    const uploadUrl = core.getInput('upload_url', { required: true });
    const assetsPath = core.getInput('assets_path', { required: true });

		const fullAssetsPath = path.join(process.cwd(), assetsPath)
		await fsPromises.access(fullAssetsPath, fs.constnts.R_OK)

		const filenames = await fsPromises.readdir(fullAssetsPath)

		for (let filename of filenames) {
			const fullpath = path.join(fullAssetsPath, filename)
			const isExe = fullpath.endsWith('.exe')

      // Determine content-length for header of upload asset
      const contentLength = (await fsPromises.stat(fullpath)).size

      // Setup headers for API call, see Octokit Documentation: https://octokit.github.io/rest.js/#octokit-routes-repos-upload-release-asset for more information
      const headers = {
				'content-type': isExe ? 'application/vnd.microsoft.portable-executable' : 'application/octet-stream',
				'content-length': contentLength
			};

			const fileContent = await fsPromises.readFile(fullpath)

      // Upload a release asset
      // API Documentation: https://developer.github.com/v3/repos/releases/#upload-a-release-asset
      // Octokit Documentation: https://octokit.github.io/rest.js/#octokit-routes-repos-upload-release-asset
      await github.repos.uploadReleaseAsset({
      	headers,
      	url: uploadUrl,
      	name: filename,
      	file: fileContent
      });
		}
  } catch (error) {
    core.setFailed(error.message);
  }
}

run()
