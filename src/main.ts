import * as core from '@actions/core'
import * as path from 'path'
import * as tc from '@actions/tool-cache'
import { downloadUrl, getInstalledVersion } from './utils'

async function run (): Promise<void> {
  try {
    const version = core.getInput('the-version')

    if (version.length === 0) {
      throw new Error('the-version input expected to be set')
    }

    let cachedPath = tc.find('the', version)

    if (cachedPath.length === 0) {
      core.debug(`Could not find The programming language version ${version} in cache, downloading it ...`)
      const installationPath = await tc.downloadTool(downloadUrl(version))
      const installationDirectory = path.dirname(installationPath)
      cachedPath = await tc.cacheDir(installationDirectory, 'the', version)
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
