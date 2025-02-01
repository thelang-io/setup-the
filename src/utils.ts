import { exec } from '@actions/exec'
import * as os from 'os'
import * as path from 'path'

export const isWin = process.platform === 'win32'
export const binaryExtension = isWin ? '.exe' : ''

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

export function homePath (): string {
  return path.join(os.homedir(), isWin ? 'The' : '.the')
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
    const matches = stdout.match(/Version ([.\d]+)/) ?? []
    version = matches[1] ?? null
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

export function versionToNumber (version: string): number {
  if (['latest'].includes(version)) {
    return Number.MAX_SAFE_INTEGER
  }

  if (version.match(/^\d+\.\d+\.\d+$/) == null) {
    throw new Error(`Invalid version '${version}'`)
  }

  return version.split('.').reduce((acc, part) => {
    return acc * 0x100 + parseInt(part)
  }, 0)
}
