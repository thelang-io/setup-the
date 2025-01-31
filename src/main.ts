import * as core from '@actions/core'
import * as fs from 'fs/promises'
import * as io from '@actions/io'
import * as path from 'path'
import * as tc from '@actions/tool-cache'
import { cmake } from './cmake'
import { git } from './git'
import * as utils from './utils'

async function installCompiler (version: string): Promise<void> {
  core.debug('Installing The compiler dependencies ...')

  const tempDirectory = utils.tempDirectory()
  const installationDirectory = path.join(tempDirectory, `the-${version}-deps`)

  const dependenciesTarballPath = await tc.downloadTool('https://cdn.thelang.io/deps.tar.gz')
  const dependenciesPath = await tc.extractTar(dependenciesTarballPath, path.join(installationDirectory, 'deps'))

  core.exportVariable('THE_DEPS_DIR', path.join(dependenciesPath, utils.dependenciesPath()))
  core.debug('Installing The compiler ...')

  const compilerDirectory = path.join(installationDirectory, 'the')
  const compilerBuildDirectory = path.join(compilerDirectory, 'build')
  const compilerReleaseDirectory = utils.isWin
    ? path.join(compilerBuildDirectory, 'Release')
    : compilerBuildDirectory
  const compilerTargetDirectory = path.join(utils.homeDirectory(), (utils.isWin ? 'The' : '.the'), 'bin')
  const compilerTargetLocation = path.join(compilerTargetDirectory, `compiler${utils.binaryExtension()}`)

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

  await cmake.build(compilerBuildDirectory, {
    config: 'Release',
    target: 'the'
  })

  await io.mkdirP(compilerTargetDirectory)
  await io.cp(path.join(compilerReleaseDirectory, `the${utils.binaryExtension()}`), compilerTargetLocation)

  core.addPath(compilerTargetDirectory)
}

async function download (version: string): Promise<string> {
  core.debug(`Couldn't find The programming language ${version} in cache, downloading it ...`)

  const tempDirectory = utils.tempDirectory()
  const installationDirectory = path.join(tempDirectory, `the-${version}`)

  const installationPath = await tc.downloadTool(
    utils.cliUrl(version),
    path.join(installationDirectory, `the${utils.binaryExtension()}`)
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
