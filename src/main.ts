import * as core from '@actions/core'
import { exec } from '@actions/exec'
import * as fs from 'fs/promises'
import * as path from 'path'
import * as tc from '@actions/tool-cache'
import * as utils from './utils'

async function download (version: string): Promise<string> {
  core.debug(`Couldn't find The programming language ${version} in cache, downloading it ...`)

  const tempDirectory = utils.tempDirectory()
  const installationDirectory = path.join(tempDirectory, `the-${version}`)

  const installationPath = await tc.downloadTool(
    utils.cliUrl(version),
    path.join(installationDirectory, `the${utils.binaryExtension}`)
  )

  if (!utils.isWin) {
    await fs.chmod(installationPath, 0o755)
  }

  const cachedPath = await tc.cacheDir(installationDirectory, 'the', version)
  core.debug(`Cached The programming language ${version} to ${cachedPath}.`)

  return cachedPath
}

async function run (): Promise<void> {
  const version = core.getInput('the-version', { required: true })
  let cachedPath = tc.find('the', version)

  if (cachedPath.length === 0) {
    cachedPath = await download(version)
    await exec('the offline')
  }

  core.addPath(cachedPath)
  core.setOutput('the-version', utils.installedVersion())
}

run().catch((err) => {
  if (err instanceof Error) {
    core.setFailed(err.message)
  } else if (typeof err === 'string') {
    core.setFailed(err)
  }
})
