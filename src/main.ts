import * as core from '@actions/core'
import * as fs from 'fs'
import * as path from 'path'
import * as tc from '@actions/tool-cache'
import * as utils from './utils'
import { cmake } from './cmake'
import { git } from './git'

async function installCompiler (version: string): Promise<void> {
  core.debug('Installing The compiler dependencies ...')

  const tempDirectory = utils.tempDirectory()
  const installationDirectory = path.join(tempDirectory, `the-${version}-deps`)

  const dependenciesTarballPath = await tc.downloadTool('https://cdn.thelang.io/deps.tar.gz')
  const dependenciesPath = await tc.extractTar(dependenciesTarballPath, path.join(installationDirectory, path.join(installationDirectory, 'deps')))

  core.exportVariable('DEPS_DIR', path.join(dependenciesPath, utils.dependenciesPath()))
  core.debug('Installing The compiler ...')

  const compilerDirectory = path.join(installationDirectory, 'the')
  const compilerBuildDirectory = path.join(compilerDirectory, 'build')
  const compilerTargetLocation = path.join(utils.homeDirectory(), '.the', 'bin', 'compiler')

  await git.clone('https://github.com/thelang-io/the.git', {
    depth: 1,
    directory: compilerDirectory,
    singleBranch: true
  })

  await cmake.generate(compilerDirectory, {
    buildPath: compilerBuildDirectory,
    variables: [
      { name: 'CMAKE_BUILD_TYPE', value: 'Release' }
    ]
  })

  await cmake.build(compilerBuildDirectory, { target: 'the' })
  fs.copyFileSync(path.join(compilerBuildDirectory, 'the'), compilerTargetLocation)
}

async function install (version: string): Promise<string> {
  core.debug(`Could not find The programming language version ${version} in cache, downloading it ...`)

  const tempDirectory = utils.tempDirectory()
  const installationDirectory = path.join(tempDirectory, `the-${version}`)
  const installationPath = await tc.downloadTool(utils.cliUrl(version), path.join(installationDirectory, utils.cliFilename()))

  if (utils.platformName() !== 'windows') {
    fs.chmodSync(installationPath, 0o755)
  }

  const cachedPath = await tc.cacheDir(installationDirectory, 'the', version)
  core.debug(`Cached The programming language version ${version} to ${cachedPath}.`)

  return cachedPath
}

async function run (): Promise<void> {
  const version = core.getInput('the-version', { required: true })
  let cachedPath = tc.find('the', version)

  if (cachedPath.length === 0) {
    cachedPath = await install(version)
    await installCompiler(version)
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
