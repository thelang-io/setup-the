import { execa } from 'execa'

export function downloadFilename (): string {
  return 'the' + (platformName() === 'windows' ? '.exe' : '')
}

export function downloadUrl (version: string): string {
  const platform = platformName()
  const arch = platformArch()
  const [major = '', minor = ''] = version.split('.')
  const versionBeforeMacOSArch = parseInt(major) === 0 && parseInt(minor) < 14

  if (versionBeforeMacOSArch && platform === 'macos') {
    return `https://cdn.thelang.io/cli-core-${platform}-${arch}@${version}`
  } else {
    return `https://cdn.thelang.io/cli-core-${platform}@${version}`
  }
}

export function extractVersionFromOutput (output: string): string | null {
  const [match] = output.match(/Version ([.\d]+) \([\w ]+\)/g) ?? [null]

  if (match === null) {
    return null
  }

  const [result] = match.match(/[.\d]+/g) ?? [null]
  return result
}

export async function getInstalledVersion (): Promise<string> {
  const { stderr, stdout } = await execa('the', ['-v'])
  let version = null

  if (stderr.length === 0 && stdout.length !== 0) {
    version = extractVersionFromOutput(stdout)
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
