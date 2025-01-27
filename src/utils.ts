import { exec } from '@actions/exec'
import * as path from 'path'

export function binaryExtension (): string {
  return platformName() === 'windows' ? '.exe' : ''
}

export function cliUrl (version: string): string {
  const platform = platformName()
  const arch = platformArch()
  const [major = '', minor = ''] = version.split('.')
  const versionBeforeMacOSArch = version !== 'latest' && parseInt(major) === 0 && parseInt(minor) < 14

  if (platform === 'macos' && !versionBeforeMacOSArch) {
    return `https://cdn.thelang.io/cli-core-${platform}-${arch}@${version}`
  } else {
    return `https://cdn.thelang.io/cli-core-${platform}@${version}`
  }
}

export function dependenciesPath (): string {
  const platform = platformName()
  const arch = platformArch()

  if (platform === 'macos') {
    return path.join('native', platform, arch)
  }

  return path.join('native', platform)
}

export function homeDirectory (): string {
  const result = process.env.HOME ?? process.env.USERPROFILE ?? ''

  if (result === '') {
    throw new Error('HOME environment variable is not set')
  }

  return result
}

export async function installedVersion (): Promise<string> {
  let stdout = ''

  const exitCode = await exec('the', ['-v'], {
    listeners: {
      stdout: (data) => {
        stdout += data.toString()
      }
    }
  })

  let version = null

  if (exitCode === 0 && stdout.length !== 0) {
    version = versionFromOutput(stdout)
  }

  if (version === null) {
    throw new Error('Unable to get version of The programming language')
  }

  return version
}

export function platformArch (): string {
  if (process.arch === 'x64') {
    return 'x86_64'
  } else {
    return process.arch
  }
}

export function platformName (): string {
  if (process.platform === 'win32') {
    return 'windows'
  } else if (process.platform === 'darwin') {
    return 'macos'
  } else {
    return 'linux'
  }
}

export function tempDirectory (): string {
  const result = process.env.RUNNER_TEMP ?? ''

  if (result === '') {
    return path.join(__dirname, 'tmp')
  }

  return result
}

export function versionFromOutput (output: string): string | null {
  const matches = output.match(/Version ([.\d]+)/) ?? []
  return matches[1] ?? null
}
