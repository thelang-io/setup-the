import * as core from '@actions/core'
import * as fs from 'fs'
import * as path from 'path'
import * as tc from '@actions/tool-cache'
import { downloadFilename, downloadUrl, getInstalledVersion, platformName } from './utils'

async function run (): Promise<void> {
  try {
    const tempDirectory = process.env.RUNNER_TEMP ?? ''

    if (tempDirectory === '') {
      throw new Error('GitHub runner temporary directory is not set')
    }

    const version = core.getInput('the-version', { required: true })
    let cachedPath = tc.find('the', version)

    if (cachedPath.length === 0) {
      core.debug(`Could not find The programming language version ${version} in cache, downloading it ...`)
      const installationDirectory = path.join(tempDirectory, `the-${version}`)
      const installationPath = await tc.downloadTool(downloadUrl(version), path.join(installationDirectory, downloadFilename()))

      if (platformName() !== 'windows') {
        fs.chmodSync(installationPath, 0o755)
      }

      cachedPath = await tc.cacheDir(installationDirectory, 'the', version)
      core.debug(`Cached The programming language version ${version} to ${cachedPath}.`)
    }

    core.addPath(cachedPath)
    core.setOutput('the-version', getInstalledVersion())
  } catch (err) {
    if (err instanceof Error) {
      core.setFailed(err.message)
    }
  }
}

run().catch(console.error)
